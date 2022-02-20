const TDAmeritradeAPI = require('./td-ameritrade-api');

class TDAmeritradeBrokerage {
	constructor(clientId, redirectUri, refreshToken) {
		this.ready = false;
		this.TDA = new TDAmeritradeAPI(clientId, redirectUri, refreshToken);
	}

	initialize = async () => {
		await this.TDA.initialize();
		this.ws = await this.TDA.getWebSocketConnection();
		this.ready = true;
	};

	getAccounts = async () => {
		return await this.TDA.getAccounts();
	};

	getQuote = async (ticker) => {
		return await this.TDA.getQuote(ticker);
	};

	getOptionChain = async (params) => {
		return await this.TDA.getOptionChain(params);
	};

	logQuoteData = async (symbols, fields, path) => {
		await this.ws.logQuoteData(symbols, fields, path);
	};

	logOptionData = async (symbols, fields, path) => {
		await this.ws.logOptionData(symbols, fields, path);
	};
}

module.exports = TDAmeritradeBrokerage;
