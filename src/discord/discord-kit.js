const Discord = require('discord.js');

const utils = require('../utils');
// const methods = require('./methods');
const flows = require('./flows');
const {
	DiscordBot,
	ResponseTrigger,
	MarkovChain,
	User,
} = require('../db');
const { FrequencyTable } = require('../markov');

const EVENTS = {
	MESSAGE: 'message',
};

class DiscordBotInstance {
	/**
	 *  token: a discord bot token
	 *  commandTrigger: string pattern used at the start of commands
	 *  messageMiddleware: function to be run before handleMessageEvent
	 */
	constructor(token, config = {}) {
		const { commandTrigger, messageMiddleware, commands } = config;
		this.token = token;
		this.client = new Discord.Client();
		this.initialized = false;
		// maps guild id to boolean representing whether phrases are active
		this.phrasesActive = {};
		// maps guild id to boolean representing whether markov chains are active
		this.markovActive = {};
		// maps guild id to DiscordBot document instance
		this.discordBots = {};
		this.botId = '';
		this.botUserStr = '';
		// maps guild id to guild
		this.guildMap = {};
		this.guilds = [];
		this.commandTrigger = commandTrigger || '(bot)';
		// maps guild id to array of response triggers
		this.customTriggerList = {};
		// maps guild id to trigger map
		this.customTriggerMap = {};
		// maps guild id to the regex for custom triggers
		this.customTriggerRegex = {};
		this.commands = commands || [];
		this.checkinTimers = {};

		if (utils.isFunc(messageMiddleware) || Array.isArray(messageMiddleware)) {
			this.messageMiddleware = messageMiddleware;
		}

		this.client.on('ready', () => {
			console.log('initializing discord bot');
			this.initialize();
		});

		this.client.on('message', (message) => {
			if (!this.initialized) {
				return;
			}
			this.handleMessageEvent(message);
		});

		this.client.login(this.token);
	}

	initialize = async () => {
		try {
			// bot info
			const botUser = this.client.user;
			const botId = botUser.id;
			this.botId = botId;
			this.botUserStr = `<@!${botId}>`;

			// initialize markov chains (requires botId)
			await this.syncMarkovChains();

			// fetch the members and guild IDs of each server
			for (const [guildId, _] of this.client.guilds.cache) {
				const guild = await this.client.guilds.fetch(guildId);
				this.guilds.push(guild);
				this.guildMap[guildId] = guild;
				// const members = await guild.members.fetch();
				// for (const [memberId, member] of guild.members.cache) {
					
				// }
				const botRes = await DiscordBot.find({ botId, guildId }).limit(1);
				let discordBot;
				if (!botRes.length) {
					// bot doesn't exist yet, create it
					discordBot = new DiscordBot();
					discordBot.botId = botId;
					discordBot.guildId = guildId;
					await discordBot.save();
				} else {
					discordBot = botRes[0];
				}
				this.discordBots[guildId] = JSON.parse(JSON.stringify(discordBot));
				this.phrasesActive[guildId] = true;

				// pick an active markov chain if appropriate
				if (
					Object.keys(this.markovChains).length &&
					(!this.discordBots[guildId].activeMarkovChainId || !this.getActiveMarkovChain(guildId))
				) {
					// pick a default markov chain ID if a correct one isn't already selected
					const id = Object.keys(this.markovChains)[0];
					this.discordBots[guildId].activeMarkovChainId = id;
					discordBot.activeMarkovChainId = id;
					discordBot.save();
				}
				this.markovActive[guildId] = Boolean(discordBot.activeMarkovChainId);

				// initialize the custom triggers
				const triggerRes = await ResponseTrigger.find({ discordBotId: botId, guildId });
				this.customTriggerMap[guildId] = {};
				this.customTriggerList[guildId] = JSON.parse(JSON.stringify(triggerRes));
				this.customTriggerList[guildId].forEach((r) => {
					const { trigger, response } = r;
					if (this.customTriggerMap[guildId][trigger]) {
						this.customTriggerMap[guildId][trigger].push(r);
					} else {
						this.customTriggerMap[guildId][trigger] = [r];
					}
				});
				this.buildCustomTriggerRegex(guildId);
			}
			this.commandRegex = new RegExp(`^(${this.commandTrigger}|${this.botUserStr}),?[ ]+(.*)$`, 'i');

			// get users from this team
			// const usersListRes = await methods.getUsersList(this.web);
			// if (!usersListRes.ok) {
			// 	console.log('Error getting users.');
			// 	console.log(usersListRes);
			// 	return;
			// }
			// const usersRes = await User.find({ slackTeamId: this.botTeamId });
			// const users = [];
			// usersListRes.members.forEach(async (m) => {
			// 	// synchronize the list of users from slack with the ones in mongo
			// 	let user = usersRes.find(u => u.slackUserId === m.id);
			// 	if (!user) {
			// 		// create users as necessary
			// 		user = new User();
			// 		user.slackUserId = m.id;
			// 		user.slackTeamId = this.botTeamId;
			// 		await user.save();
			// 	}
			// 	users.push(JSON.parse(JSON.stringify(user)));
			// });
			// this.users = users;
			// this.slackUsers = usersListRes.members;

			this.initialized = true;
			console.log('discord bot initialized');

			// save the markov chains (if applicable) every 10 minutes
			this.saveMarkovChainTimer = setInterval(() => {
				try {
					this.saveActiveMarkovChains();
				} catch (e) {
					console.log(e);
				}
			}, 10 * 60 * 1000);
		} catch (e) {
			console.log(e);
		}
	};

	send = async ({ text, message }) => {
		try {
			await message.channel.send(text);
		} catch (e) {
			console.log(e);
		}
	};

	addCustomTrigger = (responseTrigger, guildId) => {
		const { trigger, response } = responseTrigger;
		const list = this.customTriggerMap[guildId][trigger];
		if (Array.isArray(list)) {
			list.push(responseTrigger);
		} else {
			this.customTriggerMap[guildId][trigger] = [responseTrigger];
		}
		this.buildCustomTriggerRegex(guildId);
	};

	deleteCustomTrigger = (responseTrigger, guildId) => {
		const { trigger, _id } = responseTrigger;
		const list = this.customTriggerMap[guildId][trigger];
		if (Array.isArray(list)) {
			this.customTriggerMap[trigger] = list.filter(rt => rt._id !== _id);
			if (!this.customTriggerMap[guildId][trigger].length) {
				delete this.customTriggerMap[guildId][trigger];
			}
			this.buildCustomTriggerRegex(guildId);
		}
	};

	buildCustomTriggerRegex = (guildId) => {
		const filtered = [];
		Object.keys(this.customTriggerMap[guildId]).forEach((trigger) => {
			if (!trigger.match(new RegExp(`^${this.commandTrigger}$`, 'i'))) {
				filtered.push(utils.escapeSpecialRegexChars(trigger));
			}
		});
		this.customTriggerRegex[guildId] = new RegExp(`(^|.+[ ]+|[^a-z0-9]+)(${filtered.join('|')})($|[ ]+.+|[^a-z0-9]+)`, 'i');
	};

	canUseMarkovChain = (guildId) => this.markovActive[guildId] &&
		Object.keys(this.markovChains).length > 0 &&
		Boolean(this.getActiveMarkovChain(guildId));

	getActiveMarkovChain = (guildId) => this.markovChains[this.discordBots[guildId].activeMarkovChainId];

	generateMarkovChainMessage = (guildId) => {
		if (this.canUseMarkovChain(guildId)) {
			return this.getActiveMarkovChain(guildId).frequencyTable.generateMessage();
		}
		return '';
	};

	getGuildId = (message) => message.channel && message.channel.guild && message.channel.guild.id;

	handleMessageEvent = async (message) => {
		if (!this.initialized) {
			return;
		}
		const { content, channel, author } = message;
		if (typeof content !== 'string') {
			return;
		}

		// prevent cycle where bot responds to itself
		if (author.id === this.botId || author.bot) {
			return;
		}

		// use message middlewares
		const mm = this.messageMiddleware;
		if (utils.isFunc(mm)) {
			message = mm(message);
			if (!message) {
				return;
			}
		} else if (Array.isArray(mm)) {
			for (let i = 0; i < mm.length; i++) {
				const m = mm[i];
				if (utils.isFunc(m)) {
					message = m(message);
					if (!message) {
						return;
					}
				}
			}
		}

		// cycle through main flows
		for (let i = 0; i < flows.length; i++) {
			const success = await flows[i]({ instance: this, text: content, message });
			if (success) {
				return;
			}
		}
	};

	saveActiveMarkovChain = async (guildId) => {
		if (!this.markovActive[guildId] || this.forceDisableUpdateMarkov) {
			return;
		}
		const m = this.getActiveMarkovChain(guildId);
		const markovChainRes = await MarkovChain.find({ _id: m._id }).limit(1);
		if (!markovChainRes.length) {
			return;
		}
		const markovChain = markovChainRes[0];
		markovChain.frequencyTable = m.frequencyTable.dumpTable();
		await markovChain.save();
	};

	saveActiveMarkovChains = async () => {
		for (const guildId in this.markovActive) {
			await this.saveActiveMarkovChain(guildId);
		}
	};

	syncMarkovChains = async () => {
		const markovRes = await MarkovChain.find({ discordBotId: this.botId });
		this.markovChains = {};
		markovRes.forEach((m) => {
			const _id = String(m._id);
			this.markovChains[_id] = {
				_id,
				name: m.name || '(Unnamed)',
				frequencyTable: new FrequencyTable(m.predictionLength, m.frequencyTable),
				predictionLength: m.predictionLength,
				discordGuildId: m.discordGuildId,
				discordUserId: m.discordUserId,
			};
		});
	};
}

module.exports = {
	DiscordBotInstance,
};
