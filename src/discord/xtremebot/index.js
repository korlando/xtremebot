const DiscordBotInstance = require('../discord-bot');
// Commands are imported here, rather than
// provided by a user in the constructor.
const commands = require('./commands');

class XtremeBotDiscord extends DiscordBotInstance {
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
}

module.exports = XtremeBotDiscord;
