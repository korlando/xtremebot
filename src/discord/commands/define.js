const dictionary = require('../../dictionary');

const cmd = async ({ instance, message, match }) => {
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
			message,
		});
		return;
	}
	instance.send({
		// discord allows a maximum of 2000 characters in a message
		text: definitions.join('\n\n').slice(0, 2000),
		message,
	});
};

module.exports = {
	cmd,
	regex: /^(def|define)[ ]+(.+)$/i,
	name: 'Define Word',
	usage: 'bot define [WORD]',
};
