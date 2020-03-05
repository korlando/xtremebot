const dictionary = require('../../dictionary');

const cmd = async ({ instance, messageEvent, match }) => {
	const { channel } = messageEvent;
	const word = match[2].trim().toLowerCase();
	const words = word.split(' ');
	const definitions = words.map((w) => {
		const letter = w[0];
		const bucket = dictionary[letter];
		if (!bucket) {
			return '';
		}
		let wordObj;
		for (let i = 0; i < bucket.length; i++) {
			if (bucket[i].word.toLowerCase() === w) {
				wordObj = bucket[i];
				break;
			}
		}
		if (!wordObj) {
			return '';
		}
		return `*${wordObj.word}*\n${wordObj.def}`;
	}).filter(d => !!d);

	if (!definitions.length) {
		instance.send({
			text: 'No definition found.',
			channel,
		});
		return;
	}
	instance.send({
		text: definitions.join('\n\n'),
		channel,
	});
};

module.exports = {
	cmd,
	regex: /^(def|define)[ ]+(.+)$/i,
	name: 'Define Word',
	usage: 'bot define [WORD]',
};
