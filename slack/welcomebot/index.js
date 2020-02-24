const { WebClient } = require('@slack/web-api');
const methods = require('../methods');

const instances = [
	{
		web: new WebClient(process.env.TEST_WELCOMEBOT_SLACK_TOKEN),
		initialized: false,
		botTeamId: '',
		botUserId: '',
	},
	{
		web: new WebClient(process.env.MK_XTREMEBOT_SLACK_TOKEN),
		initialized: false,
		botTeamId: '',
		botUserId: '',
	},
];

const handleMessageEvent = async (slackEvent) => {
	const { event, teamId } = slackEvent;
	const { text, channel, user } = event;

	instances.forEach(async (instance) => {
		const { web, initialized, botUserId, botTeamId } = instance;
		if (!initialized) {
			// bot hasn't finished set up
			return;
		}
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

const initializeSlack = async () => {
	instances.forEach(async (instance) => {
		const { web } = instance;
		// fetch the user and team IDs of each bot instance
		const res = await methods.authTest(web);
		if (res.ok) {
			instance.botUserId = res.userId;
			instance.botTeamId = res.teamId;
			instance.initialized = true;
		}
	});
};

const welcomebot = {
	name: 'welcomebot',
	slackEventHandler,
	initializeSlack,
};

module.exports = welcomebot;
