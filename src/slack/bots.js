const XtremeBotSlack = require('./xtremebot');
const manifest = require('../../bot-manifest');
const ignoreDoubleParensMiddleware = require('./messageMiddlewares/ignoreDoubleParensMiddleware');
const whitelistUsersMiddleware = require('./messageMiddlewares/whitelistUsersMiddleware');

const bots = [];

manifest.slack.bots.forEach((b, i) => {
	const {
		apiToken,
		messageMiddlewares,
		commandTrigger,
		forceDisableUpdateMarkov,
	} = b;
	if (!apiToken) {
		console.warn(`Slack bot manifest missing API token at index ${i}. Aborting initialization.`);
		return;
	}
	if (messageMiddlewares) {
		const messageMiddleware = [];
		if (messageMiddlewares.ignoreDoubleParens) {
			messageMiddleware.push(ignoreDoubleParensMiddleware());
		}
		if (messageMiddlewares.whitelistUsers) {
			messageMiddleware.push(whitelistUsersMiddleware(messageMiddlewares.whitelistUsers));
		}
	}
	bots.push(new XtremeBotSlack(apiToken, {
		commandTrigger,
		messageMiddlewares,
		forceDisableUpdateMarkov,
	}));
});

module.exports = bots;
