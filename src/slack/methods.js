const {
	transformBotInfo,
	transformSlackAuthTest,
	transformUsersList,
} = require('../transforms');

module.exports = {
	// https://api.slack.com/methods/chat.postMessage
	postMessage: async (webClient, { channel, text }) => {
		await webClient.chat.postMessage({ channel, text });
	},

	// https://api.slack.com/methods/users.conversations
	listConversations: async (webClient) => {
	  const res = await webClient.users.conversations();
	  return res;
	},

	// https://api.slack.com/methods/bots.info
	getBotInfo: async (webClient, config) => {
		const { botId } = (config || {});
		const res = await webClient.bots.info({ bot: botId });
		return transformBotInfo(res);
	},

	// https://api.slack.com/methods/users.list
	getUsersList: async (webClient) => {
		const res = await webClient.users.list();
		return transformUsersList(res);
	},

	// https://api.slack.com/methods/users.identity
	authTest: async (webClient) => {
		const res = await webClient.auth.test();
		return transformSlackAuthTest(res);
	},
};
