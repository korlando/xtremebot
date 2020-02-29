const { WebClient } = require('@slack/web-api');

const utils = require('../utils');
const methods = require('./methods');
const { SlackBot, ResponseTrigger } = require('../db');

const EVENTS = {
	MESSAGE: 'message',
};

// an instance is a workspace-specific instance of a bot, usually
class SlackBotInstance {
	constructor(token) {
		this.token = token;
		this.web = new WebClient(token);
		this.initialized = false;
		this.phrasesActive = false;
		this.botTeamId = '';
		this.botUserId = '';
		this.commandTrigger = '(bot)';
		this.customTriggerMap = {};

		this.initialize();
	}

	initialize = async () => {
		try {
			// fetch the user and team IDs of each bot instance
			const authRes = await methods.authTest(this.web);
			if (!authRes.ok) {
				return;
			}
			const { botId, userId, teamId } = authRes;
			this.botUserId = userId;
			this.botTeamId = teamId;
			this.botUserStr = `<@${userId}>`;
			const botRes = await SlackBot.find({ botId, userId, teamId }).limit(1);
			let slackBot;
			if (!botRes.length) {
				// bot doesn't exist yet, create it
				bot = new SlackBot();
				bot.botId = botId;
				bot.userId = userId;
				bot.teamId = teamId;
				await bot.save();
				slackBot = JSON.parse(JSON.stringify(bot));
			} else {
				slackBot = JSON.parse(JSON.stringify(botRes[0]));
			}
			this.slackBot = slackBot;
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

			this.initialized = true;
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
}

const handleMessageEvent = async (slackEvent, instances) => {
	const { event, teamId } = slackEvent;
	const { text, channel, user } = event;

	if (typeof text !== 'string') {
		return;
	}

	// find the right instance according to the team ID
	for (let i = 0; i < instances.length; i++) {
		const instance = instances[i];
		if (teamId !== instance.botTeamId) {
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

const makeCommandRegex = (instance) =>
	new RegExp(`^(${instance.commandTrigger}|${instance.botUserStr}),?[ ]+(.*)$`, 'i');

module.exports = {
	SlackBotInstance,
	slackEventHandler,
	makeCommandRegex,
};
