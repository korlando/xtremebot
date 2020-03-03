const { WebClient } = require('@slack/web-api');

const utils = require('../utils');
const methods = require('./methods');
const {
	SlackBot,
	ResponseTrigger,
	MarkovChain,
} = require('../db');
const { FrequencyTable } = require('../markov');

const EVENTS = {
	MESSAGE: 'message',
};

// an instance is a workspace-specific instance of a bot, usually
class SlackBotInstance {
	/**
	 *  token: a slack bot token
	 *  commandTrigger: string pattern used at the start of commands
	 *  messageMiddleware: function to be run before handleMessageEvent
	 */
	constructor(token, config = {}) {
		const { commandTrigger, messageMiddleware } = config;
		this.token = token;
		this.web = new WebClient(token);
		this.initialized = false;
		this.phrasesActive = false;
		this.markovActive = false;
		this.botTeamId = '';
		this.botUserId = '';
		this.botUserStr = '';
		this.commandTrigger = commandTrigger || '(bot)';
		this.customTriggerMap = {};

		if (utils.isFunc(messageMiddleware) || Array.isArray(messageMiddleware)) {
			this.messageMiddleware = messageMiddleware;
		}

		this.initialize();
	}

	initialize = async () => {
		try {
			// fetch the user and team IDs of each bot instance
			const authRes = await methods.authTest(this.web);
			if (!authRes.ok) {
				console.log('Error getting auth info.');
				return;
			}
			const { botId, userId, teamId } = authRes;
			const botInfoRes = await methods.getBotInfo(this.web, { botId });
			if (!botInfoRes.ok) {
				console.log('Error getting bot info.');
				return;
			}
			this.appId = botInfoRes.bot.appId;
			this.botUserId = userId;
			this.botTeamId = teamId;
			this.botUserStr = `<@${userId}>`;
			this.commandRegex = new RegExp(`^(${this.commandTrigger}|${this.botUserStr}),?[ ]+(.*)$`, 'i');
			const botRes = await SlackBot.find({ botId, userId, teamId }).limit(1);
			let slackBot;
			if (!botRes.length) {
				// bot doesn't exist yet, create it
				slackBot = new SlackBot();
				slackBot.botId = botId;
				slackBot.userId = userId;
				slackBot.teamId = teamId;
				await slackBot.save();
			} else {
				slackBot = botRes[0];
			}
			this.slackBot = JSON.parse(JSON.stringify(slackBot));
			this.phrasesActive = true;

			// initialize the custom triggers
			const triggerRes = await ResponseTrigger.find({ slackBotId: botId });
			this.customTriggerList = JSON.parse(JSON.stringify(triggerRes));
			this.customTriggerList.forEach((r) => {
				const { trigger, response } = r;
				if (this.customTriggerMap[trigger]) {
					this.customTriggerMap[trigger].push(r);
				} else {
					this.customTriggerMap[trigger] = [r];
				}
			});
			this.buildCustomTriggerRegex();

			// initialize markov chains
			this.markovChains = {};
			const markovRes = await MarkovChain.find({ slackAppId: this.appId });
			markovRes.forEach((m) => {
				const _id = String(m._id);
				this.markovChains[_id] = {
					_id,
					frequencyTable: new FrequencyTable(m.predictionLength, m.frequencyTable),
					predictionLength: m.predictionLength,
					slackTeamId: m.slackTeamId,
					slackUserId: m.slackUserId,
				};
			});
			if (
				Object.keys(this.markovChains).length &&
				(!this.slackBot.activeMarkovChainId || !this.markovChains[this.slackBot.activeMarkovChainId])
			) {
				// pick a default markov chain ID if a correct one isn't already selected
				const id = Object.keys(this.markovChains)[0];
				this.slackBot.activeMarkovChainId = id;
				slackBot.activeMarkovChainId = id;
				slackBot.save();
			}
			this.markovActive = true;

			this.initialized = true;

			// save the markov chain (if applicable) every 10 minutes
			this.saveMarkovChainTimer = setInterval(() => {
				try {
					this.saveActiveMarkovChain();
				} catch (e) {
					console.log(e);
				}
			}, 10 * 60 * 1000);
		} catch (e) {
			console.log(e);
		}
	};

	handleMessageEvent = async (messageEvent) => {};

	send = async ({ text, channel }) => {
		try {
			await methods.postMessage(this.web, { text, channel });
		} catch (e) {
			console.log(e);
		}
	};

	addCustomTrigger = (responseTrigger) => {
		const { trigger, response } = responseTrigger;
		const list = this.customTriggerMap[trigger];
		if (Array.isArray(list)) {
			list.push(responseTrigger);
		} else {
			this.customTriggerMap[trigger] = [responseTrigger];
		}
		this.buildCustomTriggerRegex();
	};

	deleteCustomTrigger = (responseTrigger) => {
		const { trigger, _id } = responseTrigger;
		const list = this.customTriggerMap[trigger];
		if (Array.isArray(list)) {
			this.customTriggerMap[trigger] = list.filter(rt => rt._id !== _id);
			if (!this.customTriggerMap[trigger].length) {
				delete this.customTriggerMap[trigger];
			}
			this.buildCustomTriggerRegex();
		}
	};

	buildCustomTriggerRegex = () => {
		const filtered = [];
		Object.keys(this.customTriggerMap).forEach((trigger) => {
			if (!trigger.match(new RegExp(`^${this.commandTrigger}$`, 'i'))) {
				filtered.push(utils.escapeSpecialRegexChars(trigger));
			}
		});
		this.customTriggerRegex = new RegExp(`(^|.+[ ]+|[^a-z0-9]+)(${filtered.join('|')})($|[ ]+.+|[^a-z0-9]+)`, 'i');
	};

	canUseMarkovChain = () => this.markovActive &&
		Object.keys(this.markovChains).length > 0 &&
		Boolean(this.markovChains[this.slackBot.activeMarkovChainId]);

	getActiveMarkovChain = () => this.markovChains[this.slackBot.activeMarkovChainId];

	generateMarkovChainMessage = () => {
		if (this.canUseMarkovChain()) {
			return this.getActiveMarkovChain().frequencyTable.generateMessage();
		}
		return '';
	};

	saveActiveMarkovChain = async () => {
		if (this.canUseMarkovChain()) {
			const m = this.getActiveMarkovChain();
			const markovChainRes = await MarkovChain.find({ _id: m._id }).limit(1);
			if (!markovChainRes.length) {
				return;
			}
			const markovChain = markovChainRes[0];
			markovChain.frequencyTable = m.frequencyTable.dumpTable();
			await markovChain.save();
		}
	};
}

const handleMessageEvent = async (slackEvent, instances) => {
	const { teamId, apiAppId } = slackEvent;
	let { event } = slackEvent;
	const { text, channel, user } = event;

	if (typeof text !== 'string') {
		return;
	}

	// find the right instance according to the team ID
	for (let i = 0; i < instances.length; i++) {
		const instance = instances[i];
		if (teamId !== instance.botTeamId || apiAppId !== instance.appId) {
			continue;
		}
		if (!instance.initialized) {
			// bot hasn't finished set up
			continue;
		}
		if (user === instance.botUserId) {
			// prevent cycle where bot responds to itself
			continue;
		}

		const mm = instance.messageMiddleware;
		// use message middlewares
		if (utils.isFunc(mm)) {
			event = mm(event);
			if (!event) {
				return;
			}
		} else if (Array.isArray(mm)) {
			for (let i = 0; i < mm.length; i++) {
				const m = mm[i];
				if (utils.isFunc(m)) {
					event = m(event);
					if (!event) {
						return;
					}
				}
			}
		}
		instance.handleMessageEvent(event);
	}
};

const slackEventHandler = async (slackEvent, instances) => {
	const { event } = slackEvent;
	const { type } = event;
	switch (type) {
		case EVENTS.MESSAGE:
			await handleMessageEvent(slackEvent, instances);
			return;
	}
};

module.exports = {
	SlackBotInstance,
	slackEventHandler,
};
