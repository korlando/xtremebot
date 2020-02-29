const { ResponseTrigger } = require('../../db');

const cmd = async ({ instance, messageEvent, match }) => {
	const { channel } = messageEvent;
	const customTrigger = match[2].trim().toLowerCase();
	const customResponse = match[4].trim();
	const list = instance.customTriggerMap[customTrigger];
	const triggerExists = Array.isArray(list);
	if (
		triggerExists &&
		list.find((r) => r.trigger === customTrigger && r.response === customResponse)
	) {
		instance.send({
			text: 'I\'ve already got that trigger/response combo.',
			channel,
		});
		return;
	}

	const rt = new ResponseTrigger();
	rt.slackBotId = instance.slackBot.botId;
	rt.trigger = customTrigger;
	rt.response = customResponse;
	rt.createdBySlackUserId = messageEvent.user;
	try {
		await rt.save();
		const responseTrigger = JSON.parse(JSON.stringify(rt));
		instance.addCustomTrigger(responseTrigger);
		instance.send({
			text: `Success! Added:\n*${responseTrigger._id}*: ${customTrigger} *->* ${customResponse}`,
			channel,
		});
	} catch (e) {
		instance.send({
			text: `An error occurred:\n${err.message}`,
			channel,
		});
	}
};

module.exports = {
	cmd,
	regex: /^add[ ]+(trigger|response)[ ]+(.+)[ ]+(>>>|&gt;&gt;&gt;|->|-&gt;)[ ]+(.+)$/i,
};
