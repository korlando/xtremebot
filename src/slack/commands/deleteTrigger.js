const utils = require('../../utils');
const { ResponseTrigger } = require('../../db');

const cmd = async ({ instance, messageEvent, match }) => {
	const { channel } = messageEvent;
	const input = match[3].trim().toLowerCase();
	const isId = utils.validObjectId(input);

	const condition = { slackBotId: instance.slackBot.botId };
	// input can either be an object ID or the trigger text itself
	if (isId) {
		condition._id = input;
	} else {
		condition.trigger = input;
	}

	try {
		const results = await ResponseTrigger.find(condition).select('_id trigger response').limit(2);
		if (!results.length) {
			instance.send({
				text: 'I can\'t find a matching trigger.',
				channel,
			});
			return;
		}
		if (results.length > 1) {
			instance.send({
				text: `ERROR: trigger has multiple responses; delete using an ID (use \`${instance.commandTrigger} list triggers\` to find a particular ID).`,
				channel,
			});
			return;
		}

		const rt = results[0];
		await ResponseTrigger.remove({ _id: rt._id });
		instance.deleteCustomTrigger(JSON.parse(JSON.stringify(rt)));
		instance.send({
			text: 'Trigger deleted!',
			channel,
		});
	} catch (e) {
		instance.send({
			text: `ERROR: ${e.message}`,
			channel,
		});
	}
};

module.exports = {
	cmd,
	regex: /^(delete|del|remove|rm)[ ]+(trigger|response)[ ]+(.*)$/i,
	name: 'Delete Trigger',
	usage: 'bot delete trigger [TRIGGER|trigger ID]',
};
