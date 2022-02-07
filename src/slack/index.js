const bots = require('./bots');

// main entry point for slack events; they
// get passed on to all active slack bots
const slackEventHandler = (slackEvent) => {
	bots.forEach((bot) => {
		bot.handleEvent(slackEvent);
	});
};

module.exports = {
	slackEventHandler,
};
