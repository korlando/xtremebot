const wordBuckets = {};

const initWordbuckets = () => {
	let dictionary = require('./dictionary_compact.json');
	Object.keys(dictionary).forEach((word) => {
		if (!word.match(/[a-z0-9]/i) || word.match(/[\-']/) || word.match(/^[A-Z](.*)$/)) {
			return;
		}
		const letter = word[0].toLowerCase();
		const obj = { word, def: dictionary[word] };
		if (!wordBuckets[letter]) {
			wordBuckets[letter] = [obj]
		} else {
			wordBuckets[letter].push(obj);
		}
	});
	dictionary = null;
};

initWordbuckets();

module.exports = wordBuckets;
