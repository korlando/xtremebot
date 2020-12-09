const { DiscordBot } = require('../../db');

const cmd = async ({ instance, message, match }) => {
	const guildId = instance.getGuildId(message);
	const discordBot = instance.discordBots[guildId];
	if (!guildId || !discordBot) {
		instance.send({
			text: 'You can only add phrases on servers',
			message,
		});
		return;
	}
	const phrase = ((Array.isArray(match) && match[2]) || '').trim();
	if (!phrase || discordBot.phrases.includes(phrase)) {
		instance.send({
			text: 'Phrase already exists.',
			message,
		});
		return;
	}

	try {
		const results = await DiscordBot.find({ _id: discordBot._id }).limit(1);
		if (!results.length) {
			throw new Error('Bot not found.');
		}
		const bot = results[0];
		bot.phrases.push(phrase);
		await bot.save();
		instance.discordBots[guildId] = JSON.parse(JSON.stringify(bot));
		instance.send({
			text: 'Success!',
			message,
		});
	} catch (e) {
		console.log(e);
		instance.send({
			text: 'Error saving phrase.',
			message,
		});
	}
};

module.exports = {
	cmd,
	regex: /^add[ ]+(phrase|saying)[ ]+(.+)$/i,
	name: 'Add Phrase',
	usage: 'bot add phrase [PHRASE]',
};
