const cmd = async ({ instance, messageEvent }) => {
	const { channel } = messageEvent;
	const { phrases } = instance.slackBot;

	if (!phrases.length) {
		instance.send({
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

	instance.send({
		text,
		channel,
	});
};

module.exports = {
	cmd,
	regex: /^(list|ls)[ ]+(phrases|sayings)([ ]+)?$/i,
	name: 'List Phrases',
	usage: 'bot list phrases',
};
