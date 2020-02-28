const bots = require('./bots');

const slackEventHandler = (slackEvent) => {
	bots.forEach((bot) => {
		bot.slackEventHandler(slackEvent);
	});
};

module.exports = {
	slackEventHandler,
};
