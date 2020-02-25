const { SlackBot } = require('../../db');

const cmd = async ({ send, instance, messageEvent }) => {
	const { channel } = messageEvent;
	const { phrases } = instance.slackBot;

	if (!phrases.length) {
		send({
			text: 'No phrases.',
			channel,
		});
		return;
	}

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
  regex: /^(list|ls)[ ]+(phrases|sayings)([ ]+)?$/i,
};
