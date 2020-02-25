const { SlackBot } = require('../../db');

const cmd = async ({ send, instance, messageEvent, match }) => {
	const phrase = ((Array.isArray(match) && match[2]) || "").trim();
	const { channel } = messageEvent;
	if (!phrase || instance.slackBot.phrases.includes(phrase)) {
		send({
			text: 'Phrase already exists.',
			channel,
		});
		return;
	}

	try {
		const results = await SlackBot.find({ _id: instance.slackBot._id }).limit(1);
		if (!results.length) {
			throw new Error('Error looking up bot.');
		}
		const bot = results[0];
		bot.phrases.push(phrase);
		await bot.save();
		instance.slackBot = JSON.parse(JSON.stringify(bot));
		send({
			text: 'Success!',
			channel,
		});
	} catch (e) {
		console.log(e);
		send({
			text: 'Error saving phrase.',
			channel,
		});
	}
};

module.exports = {
  cmd,
  regex: /^add[ ]+(phrase|saying)[ ]+(.+)$/i,
};
