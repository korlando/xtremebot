module.exports = {
	randomValue: (arr) => {
		const numOptions = arr.length;
		const randomIndex = Math.floor(Math.random() * numOptions);
		return arr[randomIndex];
	},
	escapeSpecialRegexChars: str => str.replace(/[-.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:]/gi, x => `\\${x}`),
};