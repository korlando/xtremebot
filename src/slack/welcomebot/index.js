const { WebClient } = require('@slack/web-api');

const methods = require('../methods');
const commands = require('./commands');
const { SlackBot } = require('../../db');

const instances = [
	{
		web: new WebClient(process.env.TEST_WELCOMEBOT_SLACK_TOKEN),
		initialized: false,
		phrasesActive: false,
		botTeamId: '',
		botUserId: '',
	},
	{
		web: new WebClient(process.env.MK_XTREMEBOT_SLACK_TOKEN),
		initialized: false,
		phrasesActive: false,
		botTeamId: '',
		botUserId: '',
	},
];
const commandTrigger = '(bot)';

const processMessage = async (instance, messageEvent) => {
	const { channel, text } = messageEvent;
	const { botUserId } = instance;

 	if (typeof text !== 'string') {
 		return;
 	}
 	// ignore content between double parens
 	const readableText = text.trim().replace(/\(\(.*\)\)/gi, '');

	const commandRegex = new RegExp(`^(${commandTrigger}|<@${botUserId}>),?[ ]+(.*)$`, 'i');
	const commandMatch = readableText.match(commandRegex);
	// command is the portion of text after the trigger (after 'bot', for example)
	const commandText = commandMatch && commandMatch[3] && commandMatch[3].trim();

	const send = async ({ text, channel }) => {
		try {
			await methods.postMessage(instance.web, { text, channel });
		} catch (e) {
			console.log(e);
		}
	};

	if (commandText) {
	  for (let i = 0; i < commands.length; i++) {
	    const { cmd, regex } = commands[i];
	    const match = commandText.match(regex);
	    if (match) {
	      return cmd({ send, instance, messageEvent, commandTrigger, match });
	    }
	  }
	}

	if (text.trim().toLowerCase() === 'welcome') {
		try {
			await send({
				text: 'welcome',
				channel,
			});
		} catch (e) {
			console.log(e);
		}
	}
};

const handleMessageEvent = async (slackEvent) => {
	const { event, teamId } = slackEvent;
	const { text, channel, user } = event;

	instances.forEach(async (instance) => {
		const { web, initialized, botUserId, botTeamId } = instance;
		if (!initialized) {
			// bot hasn't finished set up
			return;
		}
		if (teamId !== botTeamId) {
			return;
		}
		if (user === botUserId) {
			// prevent cycle where bot responds to itself
			return;
		}
		processMessage(instance, event);
	});
};

const slackEventHandler = async (slackEvent) => {
	const { event } = slackEvent;
	const { type } = event;
	switch (type) {
		case 'message':
			await handleMessageEvent(slackEvent);
			return;
	}
};

const initializeSlack = async () => {
	instances.forEach(async (instance) => {
		const { web } = instance;
		try {
			// fetch the user and team IDs of each bot instance
			const authRes = await methods.authTest(web);
			if (!authRes.ok) {
				return;
			}
			const { botId, userId, teamId } = authRes;
			instance.botUserId = userId;
			instance.botTeamId = teamId;
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
			instance.slackBot = slackBot;
			instance.phrasesActive = true;
			instance.initialized = true;
	 	} catch (e) {
	 		console.log(e);
	 	}
	});
};

const welcomebot = {
	name: 'welcomebot',
	slackEventHandler,
	initializeSlack,
};

module.exports = welcomebot;
