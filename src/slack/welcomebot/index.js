const slackKit = require('../slack-kit');
const commands = require('./commands');

class WelcomeBot extends slackKit.SlackBotInstance {
	constructor(token) {
		super(token);
		this.commandTrigger = '(bot)';
	}

	handleMessageEvent = async (messageEvent) => {
		const { channel, text } = messageEvent;
		const { botUserId } = this;

	 	if (typeof text !== 'string') {
	 		return;
	 	}
	 	// ignore content between double parens
	 	const readableText = text.trim().replace(/\(\(.*\)\)/gi, '');

		const commandRegex = new RegExp(`^(${this.commandTrigger}|<@${botUserId}>),?[ ]+(.*)$`, 'i');
		const commandMatch = readableText.match(commandRegex);
		// command is the portion of text after the trigger (after 'bot', for example)
		const commandText = commandMatch && commandMatch[3] && commandMatch[3].trim();

		if (commandText) {
		  for (let i = 0; i < commands.length; i++) {
		    const { cmd, regex } = commands[i];
		    const match = commandText.match(regex);
		    if (match) {
		      return cmd({
		      	send: this.send,
		      	instance: this,
		      	messageEvent,
		      	commandTrigger: this.commandTrigger,
		      	match,
		      });
		    }
		  }
		}

		if (text.trim().toLowerCase() === 'welcome') {
			try {
				await this.send({
					text: 'welcome',
					channel,
				});
			} catch (e) {
				console.log(e);
			}
		}
	};
}

const instances = [
	new WelcomeBot(process.env.TEST_WELCOMEBOT_SLACK_TOKEN),
	new WelcomeBot(process.env.MK_XTREMEBOT_SLACK_TOKEN),
];

module.exports = {
	name: 'welcomebot',
	slackEventHandler: async (slackEvent) => {
		await slackKit.slackEventHandler(slackEvent, instances);
	},
};;
