const cmd = async ({ instance, messageEvent }) => {
	const { channel } = messageEvent;
	const m = instance.customTriggerMap;
	const triggers = Object.keys(m);
	let text = '';
	triggers.forEach((trigger, i) => {
		text += `${trigger}\n`;
		const responses = m[trigger];
		responses.forEach((rt) => {
			text += `> ${rt.response} (*${rt._id}*)\n`;
		});
		if (i < triggers.length - 1) {
			text += '\n';
		}
	});

	if (!text) {
		instance.send({
			text: 'No triggers found.',
			channel,
		});
		return;
	}

	instance.send({
		text,
		channel,
	});
};

module.exports = {
	cmd,
	regex: /^(list|ls)[ ]+(custom[ ]+)?(responses|triggers)([ ]+)?$/i,
};
