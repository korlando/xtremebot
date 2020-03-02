const mongoose = require('mongoose');

module.exports = {
	randomValue: (arr) => {
		const numOptions = arr.length;
		const randomIndex = Math.floor(Math.random() * numOptions);
		return arr[randomIndex];
	},

	escapeSpecialRegexChars: str => str.replace(/[-.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:]/gi, x => `\\${x}`),

	validObjectId: x => mongoose.Types.ObjectId.isValid(x),

	isFunc: x => typeof x === 'function',

	isString: x => typeof x === 'string',
};