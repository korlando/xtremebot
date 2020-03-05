const cmd = async ({ instance, messageEvent }) => {
	const { channel } = messageEvent;
	instance.send({
		text: instance.commands.map(c => `*${c.name}*\n\`${c.usage}\``).join('\n\n'),
		channel,
	});
};

module.exports = {
	cmd,
	regex: /^(list|ls)[ ]+commands$/i,
	name: 'List Commands',
	usage: 'bot list commands',
};
