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
};
