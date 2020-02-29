const slackKit = require('../slack-kit');
const commands = require('./commands');
const utils = require('../../utils');
const phrases = require('../flows/phrases');

class PhraseBot extends slackKit.SlackBotInstance {
	constructor(token) {
		super(token);
		this.commandTrigger = process.env.PHRASEBOT_TRIGGER || '(bot)';
		const whitelistedUsersString = process.env.PHRASEBOT_USERS || '';
		this.whitelistedUsers = whitelistedUsersString.split(',');
	}

	handleMessageEvent = async (messageEvent) => {
		const { channel, text, user } = messageEvent;
		const { botUserId } = this;

		if (!this.whitelistedUsers.includes(user)) {
			return;
		}

		const commandRegex = slackKit.makeCommandRegex(this);
		const commandMatch = text.trim().match(commandRegex);
		// command is the portion of text after the trigger (after 'bot', for example)
		// this assumes commandTrigger is of the format (x|y|z); extra parens affect the match position
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

		// no command match; check for generic trigger
		const success = await phrases({ instance: this, text, messageEvent });
		if (success) {
			return;
		}
	};
}

const instances = [
	new PhraseBot(process.env.TEST_PHRASEBOT_SLACK_TOKEN),
	new PhraseBot(process.env.NXJ_PHRASEBOT_SLACK_TOKEN),
];

module.exports = {
	name: 'phrasebot',
	slackEventHandler: async (slackEvent) => {
		await slackKit.slackEventHandler(slackEvent, instances);
	},
};;
