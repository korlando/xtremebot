const cmd = async ({ instance, message, match }) => {
	const guildId = instance.getGuildId(message);
	if (!guildId || !Array.isArray(match)) {
		return;
	}
	const state = (match[3] || "").trim().toLowerCase();

	let stateText;
	if (state === '0' || state === 'off') {
		stateText = 'off';
		instance.markovActive[guildId] = false;
	} else if (state === '1' || state === 'on') {
		stateText = 'on';
		instance.markovActive[guildId] = true;
	} else  {
		instance.send({
			text: 'Unrecognized input.',
			message,
		});
		return;
	}

	instance.send({
		text: `Toggling markov chains ${stateText}.`,
		message,
	});
};

module.exports = {
	cmd,
	regex: /^(toggle[ ]+)?markov[ ]+(chains?[ ]+)?([^ ]+)$/i,
	name: 'Toggle Markov Chains',
	usage: 'bot markov [on|off]',
};
