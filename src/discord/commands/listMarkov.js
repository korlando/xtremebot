const cmd = async ({ instance, message }) => {
	const guildId = instance.getGuildId(message);
	const ids = Object.keys(instance.markovChains);

	if (!ids.length) {
		instance.send({
			text: 'No markov chains.',
			message,
		});
		return;
	}

	let text = '';
	ids.forEach((id) => {
		const mc = instance.markovChains[id];
		text += `ID: \`${id}\`\nName: *${mc.name}*\nPrediction Len: *${mc.predictionLength}*\n\n`;
	});

	instance.send({
		text,
		message,
	});
};

module.exports = {
  cmd,
  regex: /^(list|ls)[ ]+markov([ ]+chains)?$/i,
  name: 'List Markov Chains',
  usage: 'bot list markov',
};
