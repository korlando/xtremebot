const { SlackBot } = require('../../db');

const cmd = async ({ instance, messageEvent, match }) => {
	const phrase = ((Array.isArray(match) && match[3]) || "").trim();
	const { channel } = messageEvent;

	try {
		const results = await SlackBot.find({ _id: instance.slackBot._id }).limit(1);
		if (!results.length) {
			throw new Error('Error looking up bot.');
		}
		const bot = results[0];
		bot.phrases = bot.phrases.filter(p => p !== phrase);
		await bot.save();
		instance.slackBot = JSON.parse(JSON.stringify(bot));
		instance.send({
			text: 'Success!',
			channel,
		});
	} catch (e) {
		console.log(e);
		instance.send({
			text: 'Error deleting phrase.',
			channel,
		});
	}
};

module.exports = {
  cmd,
  regex: /^(delete|remove|rm)[ ]+(phrase|saying)[ ]+(.+)$/i,
  name: 'Delete Phrase',
  usage: 'bot delete phrase [PHRASE]',
};
