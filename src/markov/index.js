const utils = require('../utils');

const START = '__START__';
const END = '__END__';
const NULL = '__NULL__';

const punctuationRegex = /[\.,:;!\+&]/gi;

class FrequencyTable {
	constructor(predictionLength = 2) {
		this.predictionLength = Math.round(predictionLength);
		this.table = {};
		this.wordFrequencies = {};
		this.numStarters = 0;
		this.starterPhrases = {};
	}

	parseText = (text) => {
		if (!utils.isString(text)) {
			return [];
		}
		const tokens = text
			.trim()
			.toLowerCase()
			.replace(punctuationRegex, x => ` ${x} `)
			.split(/[ ]+/)
			.filter(t => !!t && t !== START && t !== END && t !== NULL);
		if (!tokens.length) {
			return [];
		}
		tokens.unshift(START);
		tokens.push(END);
		return tokens;
	};

	updateTable = (originalTokens) => {
		const tokens = [...originalTokens];
		// handle the case where prediction length exceeds # tokens (excluding __END__)
		if (tokens.length - 1 < this.predictionLength) {
			const numInserts = this.predictionLength - (tokens.length - 1);
			let i = 0;
			while (i < numInserts) {
				tokens.splice(tokens.length - 1, 0, NULL);
				i += 1;
			}
		}
		for (let i = 0; i < tokens.length; i++) {
			const entryTokens = tokens.slice(i, i + this.predictionLength);
			const firstToken = entryTokens[0];
			const nextToken = tokens[i + this.predictionLength];
			const entry = entryTokens.join(' ');

			if (this.wordFrequencies[firstToken]) {
				this.wordFrequencies[firstToken] += 1;
			} else {
				this.wordFrequencies[firstToken] = 1;
			}

			if (firstToken === START) {
				this.numStarters += 1;
				if (this.starterPhrases[entry]) {
					this.starterPhrases[entry] += 1;
				} else {
					this.starterPhrases[entry] = 1;
				}
			}

			if (i < tokens.length - this.predictionLength) {
				if (this.table[entry]) {
					this.table[entry].total += 1;
					if (this.table[entry].tokens[nextToken]) {
						this.table[entry].tokens[nextToken].frequency += 1;
					} else {
						this.table[entry].tokens[nextToken] = { frequency: 1 };
					}
				} else {
					this.table[entry] = {
						total: 1,
						tokens: {
							[nextToken]: { frequency: 1 },
						},
					};
				}
			}
		}
	};

	dumpTable = () => {
		return JSON.stringify(this.table);
	};

	handleInput = (text) => {
		const tokens = this.parseText(text);
		this.updateTable(tokens);
	};

	randomStarterEntry = () => {
		const starterCutoff = Math.floor(Math.random() * this.numStarters);
		const starterOptions = Object.keys(this.starterPhrases);
		let index = 0;
		let count = 0;
		let starter = starterOptions[index];
		while (count <= starterCutoff) {
			starter = starterOptions[index];
			count += this.starterPhrases[starter];
			index += 1;
		}
		return starter;
	};

	generateMessage = () => {
		// pick a starter
		const starter = this.randomStarterEntry();
		const words = starter.split(' ');
		let curEntry = starter;
		while (true) {
			// the set of possible next words
			const totalOptions = this.table[curEntry].total;
			const map = this.table[curEntry].tokens;
			const options = Object.keys(map);
			const cutoff = Math.floor(Math.random() * totalOptions);
			let i = 0;
			let c = 0;
			let w = options[i];
			while (c <= cutoff) {
				w = options[i];
				c += map[w].frequency;
				i += 1;
			}
			words.push(w);
			const curTokens = curEntry.split(' ');
			curTokens.splice(0, 1);
			curTokens.push(w);
			curEntry = curTokens.join(' ');
			if (w === END) {
				break;
			}
		}
		if (words[0] === START) {
			words.splice(0, 1);
		}
		if (words[words.length - 1] === END) {
			words.splice(words.length - 1, 1);
		}
		return words
			.filter(w => w !== NULL)
			.reduce((str, w, i) => (w.match(punctuationRegex) || i === 0 ? str + w : `${str} ${w}`), '');
	};
}

module.exports = {
	FrequencyTable,
};
