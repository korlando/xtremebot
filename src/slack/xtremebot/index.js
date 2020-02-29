const slackKit = require('../slack-kit');
const commands = require('./commands');
const flows = require('./flows');

class WelcomeBot extends slackKit.SlackBotInstance {
	constructor(token) {
		super(token);
		this.commandTrigger = '(bot)';
	}

	handleMessageEvent = async (messageEvent) => {
		const { channel, text } = messageEvent;
		const { botUserId } = this;

		// ignore content between double parens
		const readableText = text.trim().replace(/\(\(.*\)\)/gi, '');

		const commandRegex = slackKit.makeCommandRegex(this);
		const commandMatch = readableText.match(commandRegex);
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
			const success = await flows[i]({ instance: this, text: readableText, messageEvent });
			if (success) {
				return;
			}
		}

		if (readableText.toLowerCase() === 'welcome') {
			await this.send({
				text: 'welcome',
				channel,
			});
		}
	};
}

const instances = [
	new WelcomeBot(process.env.TEST_WELCOMEBOT_SLACK_TOKEN),
	new WelcomeBot(process.env.MK_XTREMEBOT_SLACK_TOKEN),
];

module.exports = {
	name: 'xtremebot',
	slackEventHandler: async (slackEvent) => {
		await slackKit.slackEventHandler(slackEvent, instances);
	},
};;