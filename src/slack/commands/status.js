const cmd = async ({ instance, messageEvent }) => {
	let text = '*Status Report*\n\n';
	// phrases
	text += `Phrases: ${instance.phrasesActive ? '`ON`' : '`OFF`'}\n# Phrases: ${instance.slackBot.phrases.length}\n\n`;
	// markov
	text += `Markov Chains: ${instance.markovActive ? '`ON`' : '`OFF`'}\n`;
	if (instance.canUseMarkovChain()) {
		const mc = instance.getActiveMarkovChain();
		text += `Active Chain: ${mc.name} (\`${mc._id}\`)\n`;
	}
	instance.send({
		text,
		channel: messageEvent.channel,
	});
};

module.exports = {
	cmd,
	regex: /^status([ ]+report)?$/i,
	name: 'Status Report',
	usage: 'bot status',
};
