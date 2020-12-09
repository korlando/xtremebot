const cmd = async ({ instance, message }) => {
	instance.send({
		text: instance.commands
			.filter(c => !c.hidden)
			.map(c => `*${c.name}*\n\`${c.usage}\``)
			.join('\n\n'),
		message,
	});
};

module.exports = {
	cmd,
	regex: /^(list|ls)[ ]+commands$/i,
	name: 'List Commands',
	usage: 'bot list commands',
};
