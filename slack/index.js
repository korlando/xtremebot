const { WebClient } = require('@slack/web-api');
const bots = require('./bots');

const slackEventHandler = (slackEvent) => {
	bots.forEach((bot) => {
		bot.slackEventHandler(slackEvent);
	});
};

const initializeSlack = () => {
	bots.forEach((bot) => {
		bot.initializeSlack();
	});
};

module.exports = {
	slackEventHandler,
	initializeSlack,
};
