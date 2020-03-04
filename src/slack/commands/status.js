const cmd = async ({ instance, messageEvent }) => {
	let text = '*Status Report*\n\n';
	// phrases
	text += `Phrases: ${instance.phrasesActive ? '`ON`' : '`OFF`'}\n# Phrases: ${instance.slackBot.phrases.length}\n\n`;
	// markov
	text += `Markov Chain: ${instance.markovActive ? '`ON`' : '`OFF`'}`;
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
