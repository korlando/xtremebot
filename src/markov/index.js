const utils = require('../utils');

const START = '__START__';
const END = '__END__';
const NULL = '__NULL__';
const COLON = '__COLON__';

const punctuationRegex = /[\.,:;!\+&]/gi;
const colonRegex = new RegExp(COLON, 'g');
const exportWord = w => w.replace(colonRegex, ':');

class FrequencyTable {
	constructor(predictionLength = 2, dump) {
		this.predictionLength = Math.round(predictionLength);
		this.table = {};
		this.wordFrequencies = {};
		if (dump) {
			this.parseDump(dump);
		}
	}

	parseText = (text) => {
		if (!utils.isString(text)) {
			return [];
		}
		const tokens = text
			.trim()
			.toLowerCase()
			.replace('&gt;', '>')
			.replace('&lt;', '<')
			// emojis
			.replace(/:[-_a-z0-9]+:/gi, x => ` ${COLON + x.slice(1, x.length - 1) + COLON} `)
			.replace(/\<https?\:\/\/[^ ]+\>/gi, '')
			.replace(punctuationRegex, x => ` ${x} `)
			.split(/[ \t]+/)
			.filter(t => !!t && t !== START && t !== END && t !== NULL);
		if (!tokens.length) {
			return [];
		}
		tokens.unshift(START);
		tokens.push(END);
		return tokens;
	};

	parseDump = (dump) => {
		try {
			const parsed = JSON.parse(dump);
			this.predictionLength = parsed.predictionLength;
			this.table = parsed.frequencyTable;
			this.wordFrequencies = parsed.wordFrequencies;
		} catch (e) {
			console.log(e);
		}
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

			if (i < tokens.length - this.predictionLength) {
				if (
					this.table[entry] &&
					// weird edge case
					(entry !== 'constructor' || (entry === 'constructor' && typeof this.table[entry] !== 'function'))
				) {
					this.table[entry].total += 1;
					if (
						this.table[entry].tokens[nextToken] &&
						// another weird edge case
						(nextToken !== 'constructor' || (nextToken === 'constructor' && typeof this.table[entry].tokens[nextToken] !== 'function'))
					) {
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
		return JSON.stringify({
			predictionLength: this.predictionLength,
			frequencyTable: this.table,
			wordFrequencies: this.wordFrequencies,
		});
	};

	handleInput = (text) => {
		const tokens = this.parseText(text);
		this.updateTable(tokens);
	};

	randomStarterEntry = () => {
		const keys = Object.keys(this.table);
		if (!keys.length) {
			return '';
		}
		let numStarters = 0;
		const starterFreqs = {};
		keys.forEach((k) => {
			if (k.indexOf(START) === 0) {
				const m = this.table[k];
				numStarters += m.total;
				starterFreqs[k] = m.total;
			}
		});
		const r = Math.floor(Math.random() * numStarters);
		const starters = Object.keys(starterFreqs);
		let i = 0;
		let freq = 0;
		let starter = starters[i];
		while (freq <= r) {
			starter = starters[i];
			freq += starterFreqs[starter];
			i += 1;
		}
		return starter;
	};

	randomWordFromFreqMap = (freqMap) => {
		// the set of possible next words
		const { total, tokens } = freqMap;
		const words = Object.keys(tokens);
		const r = Math.floor(Math.random() * total);
		let i = 0;
		let freq = 0;
		let w = words[i];
		while (freq <= r) {
			w = words[i];
			freq += tokens[w].frequency;
			i += 1;
		}
		return w;
	};

	generateMessage = () => {
		// pick a starter
		const starter = this.randomStarterEntry();
		if (!starter) {
			return '';
		}
		const words = starter.split(' ');
		let curEntry = starter;
		while (true) {
			const w = this.randomWordFromFreqMap(this.table[curEntry]);
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
			.reduce((str, w, i) => (w.match(punctuationRegex) || i === 0 ? str + exportWord(w) : `${str} ${exportWord(w)}`), '');
	};
}

module.exports = {
	FrequencyTable,
};
