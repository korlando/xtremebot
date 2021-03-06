const { SlackBotInstance, slackEventHandler } = require('../slack-kit');
const commands = require('./commands');
const flows = require('./flows');
const ignoreDoubleParensMiddleware = require('../messageMiddlewares/ignoreDoubleParensMiddleware');
const whitelistUsersMiddleware = require('../messageMiddlewares/whitelistUsersMiddleware');

class XtremeBot extends SlackBotInstance {
	constructor(token, config = {}) {
		const {
			commandTrigger,
			messageMiddleware,
			forceDisableUpdateMarkov,
		} = config;
		super(token, {
			commandTrigger: commandTrigger || '(xtremebot|bot)',
			messageMiddleware,
			commands,
		});
		this.forceDisableUpdateMarkov = forceDisableUpdateMarkov;
	}

	handleMessageEvent = async (messageEvent) => {
		const { channel, text } = messageEvent;

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
		forceDisableUpdateMarkov: true,
	}),
	new XtremeBot(process.env.SMITH_LIVE_XTREMEBOT_TOKEN, {
		commandTrigger: process.env.SMITH_LIVE_XTREMEBOT_TRIGGER,
		messageMiddleware: ignoreDoubleParensMiddleware(),
	}),
];

module.exports = {
	name: 'xtremebot',
	slackEventHandler: async (slackEvent) => {
		await slackEventHandler(slackEvent, instances);
	},
};;
