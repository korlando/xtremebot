const { SlackBot } = require('../../db');

const cmd = async ({ instance, messageEvent, match }) => {
	const state = ((Array.isArray(match) && match[2]) || "").trim().toLowerCase();
	const { channel } = messageEvent;

	let stateText;
	if (state === '0' || state === 'off') {
		stateText = 'off';
		instance.phrasesActive = false;
	} else if (state === '1' || state === 'on') {
		stateText = 'on';
		instance.phrasesActive = true;
	} else  {
		instance.send({
			text: 'Unrecognized input.',
			channel,
		});
		return;
	}

	instance.send({
		text: `Toggling phrases ${stateText}.`,
		channel,
	});
};

module.exports = {
  cmd,
  regex: /^(phrases|sayings)[ ]+([^ ]+)$/i,
};
