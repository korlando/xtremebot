const slackKit = require('../slack-kit');
const commands = require('./commands');
const flows = require('./flows');
const ignoreDoubleParensMiddleware = require('../messageMiddlewares/ignoreDoubleParensMiddleware');
const whitelistUsersMiddleware = require('../messageMiddlewares/whitelistUsersMiddleware');

class XtremeBot extends slackKit.SlackBotInstance {
	constructor(token, config = {}) {
		const { commandTrigger, messageMiddleware } = config;
		super(token, {
			commandTrigger: commandTrigger || '(xtremebot|bot)',
			messageMiddleware,
		});
	}

	handleMessageEvent = async (messageEvent) => {
		const { channel, text } = messageEvent;
		const { botUserId } = this;

		const commandMatch = text.match(this.commandRegex);
		// command is the portion of text after the trigger (after 'bot', for example)
		const commandText = commandMatch && commandMatch[3] && commandMatch[3].trim();

		if (commandText) {
			for (let i = 0; i < commands.length; i++) {
				const { cmd, regex } = commands[i];
				const match = commandText.match(regex);
				if (match) {
					cmd({ instance: this, messageEvent, match });
					return;
				}
			}
		}

		for (let i = 0; i < flows.length; i++) {
			const success = await flows[i]({ instance: this, text, messageEvent });
			if (success) {
				return;
			}
		}

		if (text.toLowerCase() === 'welcome') {
			await this.send({
				text: 'welcome',
				channel,
			});
		}
	};
}

const instances = [
	new XtremeBot(process.env.TEST_WELCOMEBOT_SLACK_TOKEN, {
		messageMiddleware: ignoreDoubleParensMiddleware(),
	}),
	new XtremeBot(process.env.TEST_PHRASEBOT_SLACK_TOKEN),
	new XtremeBot(process.env.MK_XTREMEBOT_SLACK_TOKEN, {
		messageMiddleware: ignoreDoubleParensMiddleware(),
	}),
	new XtremeBot(process.env.NXJ_PHRASEBOT_SLACK_TOKEN, {
		commandTrigger: process.env.PHRASEBOT_TRIGGER,
		messageMiddleware: [
			whitelistUsersMiddleware(process.env.PHRASEBOT_USERS),
			ignoreDoubleParensMiddleware(),
		],
	}),
];

module.exports = {
	name: 'xtremebot',
	slackEventHandler: async (slackEvent) => {
		await slackKit.slackEventHandler(slackEvent, instances);
	},
};;
