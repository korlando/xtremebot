const utils = require('../../utils');

module.exports = async ({ text, messageEvent, instance }) => {
	// custom response
	const customMatch = text.match(instance.customTriggerRegex);
	if (!customMatch) {
		return false;
	}
	const trigger = customMatch[2].toLowerCase();
	const responses = instance.customTriggerMap[trigger];
	if (!Array.isArray(responses) || !responses.length) {
		return false;
	}
	await instance.send({
		text: utils.randomValue(responses).response,
		channel: messageEvent.channel,
	});
	return true;
};
