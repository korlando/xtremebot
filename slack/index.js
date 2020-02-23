const { WebClient } = require('@slack/web-api');
const bots = require('./bots');

const slackEventHandler = (slackEvent) => {
	bots.forEach((bot) => {
		bot.slackEventHandler(slackEvent);
	});
};

module.exports = {
	slackEventHandler,
};
