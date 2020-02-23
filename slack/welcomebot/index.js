const { WebClient } = require('@slack/web-api');
const methods = require('../methods');

const instances = [
	{
		web: new WebClient(process.env.TEST_WELCOMEBOT_SLACK_TOKEN),
		botTeamId: 'TC6DG4XED',
		botUserId: 'UU3RUS61J',
	},
	{
		web: new WebClient(process.env.MK_XTREMEBOT_SLACK_TOKEN),
		botTeamId: 'TRF1B2NN4',
		botUserId: 'UUF4Y0ZV4',
	},
];

const handleMessageEvent = async (slackEvent) => {
	const { event, teamId } = slackEvent;
	const { text, channel, user } = event;

	instances.forEach(async (instance) => {
		const { web, botUserId, botTeamId } = instance;
		if (teamId !== botTeamId) {
			return;
		}
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
