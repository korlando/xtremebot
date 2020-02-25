const { SlackBot } = require('../../db');

const cmd = async ({ send, instance, messageEvent }) => {
	const { channel } = messageEvent;
	const { phrases } = instance.slackBot;

	let text = '```\n';
	phrases.forEach((phrase) => {
		text += `${phrase}\n`;
	});
	text += '```';

	send({
		text,
		channel,
	});
};

module.exports = {
  cmd,
  regex: /^list[ ]+(phrases|sayings)([ ]+)?$/i,
};
