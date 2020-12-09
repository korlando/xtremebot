module.exports = async ({ instance, message, text }) => {
	const commandMatch = text.match(instance.commandRegex);
	// command is the portion of text after the trigger (after 'bot', for example)
	const commandText = commandMatch && commandMatch[3] && commandMatch[3].trim();

	if (commandText) {
		for (let i = 0; i < instance.commands.length; i++) {
			const { cmd, regex } = instance.commands[i];
			const match = commandText.match(regex);
			if (match) {
				cmd({ instance, message, match });
				return true;
			}
		}
	}
	return false;
};
