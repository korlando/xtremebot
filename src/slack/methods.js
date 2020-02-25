const { transformSlackAuthTest } = require('../transforms');

module.exports = {
	// https://api.slack.com/methods/chat.postMessage
	postMessage: async (webClient, { channel, text }) => {
		await webClient.chat.postMessage({ channel, text });
	},

	// https://api.slack.com/methods/channels.list
	listChannels: async (webClient) => {
	  const res = await webClient.channels.list();
	  return res;
	},

	// https://api.slack.com/methods/bots.info
	getBotInfo: async (webClient, config) => {
		const { botId } = (config || {});
		const res = await webClient.bots.info({ botId });
		return res;
	},

	// https://api.slack.com/methods/users.list
	getUsersList: async (webClient) => {
		const res = await webClient.users.list();
		return res;
	},

	// https://api.slack.com/methods/users.identity
	authTest: async (webClient) => {
		const res = await webClient.auth.test();
		return transformSlackAuthTest(res);
	},
};
