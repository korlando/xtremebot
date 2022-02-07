const SlackBotInstance = require('../slack-bot');
const commands = require('./commands');
const flows = require('./flows');

class XtremeBotSlack extends SlackBotInstance {
	constructor(apiToken, config = {}) {
		const {
			commandTrigger,
			messageMiddleware,
			forceDisableUpdateMarkov,
		} = config;
		super(apiToken, {
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

module.exports = XtremeBotSlack;
