const utils = require('../../utils');

module.exports = async ({ text, messageEvent, instance }) => {
	// custom response
	const customMatch = text.match(instance.customTriggerRegex);
	if (!customMatch) {
		return false;
	}
	const matchedTrigger = customMatch[2].toLowerCase();
	const matchedResponses = instance.customTriggerMap[matchedTrigger];
	if (!Array.isArray(matchedResponses) || !matchedResponses.length) {
		return false;
	}
	await instance.send({
		text: utils.randomValue(matchedResponses).response,
		channel: messageEvent.channel,
	});
	return true;
};
