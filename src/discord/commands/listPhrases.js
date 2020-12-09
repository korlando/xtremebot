const cmd = async ({ instance, message }) => {
	const guildId = instance.getGuildId(message);
	if (!guildId) {
		return;
	}
	const { phrases } = instance.discordBots[guildId];

	if (!phrases.length) {
		instance.send({
			text: 'No phrases.',
			message,
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
		message,
	});
};

module.exports = {
  cmd,
  regex: /^(list|ls)[ ]+(phrases|sayings)([ ]+)?$/i,
  name: 'List Phrases',
  usage: 'bot list phrases',
};
