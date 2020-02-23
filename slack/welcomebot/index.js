const { WebClient } = require('@slack/web-api');
const methods = require('../methods');

const instances = [
	{
		web: new WebClient(process.env.TEST_WELCOMEBOT_SLACK_TOKEN),
		botUserId: 'UU3RUS61J',
	},
];

const handleMessageEvent = async (slackEvent) => {
	const { event } = slackEvent;
	const { text, channel, user } = event;

	instances.forEach(async (instance) => {
		const { web, botUserId } = instance;
		if (user === botUserId) {
			// prevent cycle where bot responds to itself
			return;
		}
		if (text.trim().toLowerCase() === 'welcome') {
			try {
				await methods.postMessage(web, {
					text: 'welcome',
					channel,
				});
			} catch (e) {
				console.log(e);
			}
		}
	});
};

const slackEventHandler = async (slackEvent) => {
	const { event } = slackEvent;
	const { type } = event;
	switch (type) {
		case 'message':
			await handleMessageEvent(slackEvent);
			return;
	}
};

const welcomebot = {
	name: 'welcomebot',
	slackEventHandler,
};

module.exports = welcomebot;
