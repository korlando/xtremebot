const cmd = async ({ instance, messageEvent, match }) => {
	const state = ((Array.isArray(match) && match[3]) || "").trim().toLowerCase();
	const { channel } = messageEvent;

	let stateText;
	if (state === '0' || state === 'off') {
		stateText = 'off';
		instance.markovActive = false;
	} else if (state === '1' || state === 'on') {
		stateText = 'on';
		instance.markovActive = true;
	} else  {
		instance.send({
			text: 'Unrecognized input.',
			channel,
		});
		return;
	}

	instance.send({
		text: `Toggling markov chains ${stateText}.`,
		channel,
	});
};

module.exports = {
	cmd,
	regex: /^(toggle[ ]+)?markov[ ]+(chains?[ ]+)?([^ ]+)$/i,
	name: 'Toggle Markov Chains',
	usage: 'bot markov [on|off]',
};
