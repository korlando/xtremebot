const cmd = async ({ instance, message }) => {
	const guildId = instance.getGuildId(message);
	const discordBot = instance.discordBots[guildId];
	if (!guildId || !discordBot) {
		return;
	}
	let text = '*Status Report*\n\n';
	// phrases
	text += `Phrases: ${instance.phrasesActive[guildId] ? '`ON`' : '`OFF`'}\n# Phrases: ${discordBot.phrases.length}\n\n`;
	// markov
	text += `Markov Chains: ${instance.markovActive[guildId] ? '`ON`' : '`OFF`'}\n`;
	if (instance.markovActive[guildId]) {
		const mc = instance.getActiveMarkovChain(guildId);
		text += `Active Chain: ${mc.name} (\`${mc._id}\`)\n`;
	}
	instance.send({
		text,
		message,
	});
};

module.exports = {
  cmd,
  regex: /^status([ ]+report)?$/i,
  name: 'Status Report',
  usage: 'bot status',
};
