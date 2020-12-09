const { randomValue } = require('../../utils');
const dictionary = require('../../dictionary');

const cmd = async ({ instance, message, match }) => {
	const acronym = match[2];
	const words = [];
	for (let i = 0; i < acronym.length; i++) {
		const letter = acronym[i].toLowerCase();
		if (dictionary[letter]) {
			const obj = randomValue(dictionary[letter]);
			words.push(obj.word);
		}
	}
	if (!words.length) {
		instance.send({
			text: 'Unable to generate words.',
			message,
		});
		return;
	}
	instance.send({
		text: words.join(' '),
		message,
	});
};

module.exports = {
	cmd,
	regex: /^(acronym|acro)[ ]+(.+)$/i,
	name: 'Acronym',
	usage: 'bot acro [ACRONYM]',
};
