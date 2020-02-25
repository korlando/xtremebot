const { WebClient } = require('@slack/web-api');

const commands = require('./commands');
const methods = require('../methods');
const utils = require('../../utils');
const { SlackBot } = require('../../db');

const instances = [
	{
		web: new WebClient(process.env.TEST_PHRASEBOT_SLACK_TOKEN),
		initialized: false,
		phrasesActive: false,
		botTeamId: '',
		botUserId: '',
	},
	{
		web: new WebClient(process.env.NXJ_PHRASEBOT_SLACK_TOKEN),
		initialized: false,
		phrasesActive: false,
		botTeamId: '',
		botUserId: '',
	},
];
const commandTrigger = process.env.PHRASEBOT_TRIGGER;

const processMessage = (instance, messageEvent) => {
	const { channel, text } = messageEvent;
	const { botUserId } = instance;

 	if (typeof text !== 'string') {
 		return;
 	}

	const commandRegex = new RegExp(`^(${commandTrigger}|<@${botUserId}>),?[ ]+(.*)$`, 'i');
	const commandMatch = text.trim().match(commandRegex);
	// command is the portion of text after the trigger (after 'bot', for example)
	// this assumes commandTrigger is of the format (x|y|z); extra parens affect the match position
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
	      cmd({ send, instance, messageEvent, commandTrigger, match });
	      return;
	    }
	  }
	}
	// no command match; check for generic trigger
	const triggerMatch = text.trim().match(new RegExp(commandTrigger, 'i'));
	if (triggerMatch && instance.phrasesActive) {
		// send a random phrase
		send({
			text: utils.randomValue(instance.slackBot.phrases),
			channel,
		});
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

module.exports = {
	name: 'bot',
	slackEventHandler,
	initializeSlack,
};;
