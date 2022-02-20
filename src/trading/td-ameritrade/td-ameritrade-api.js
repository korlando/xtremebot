const axios = require('axios');
const qs = require('qs');

const TDAmeritradeWebSocket = require('./td-ameritrade-ws');

const {
	transformTDAGetAccountsResponse,
	transformTDAGetQuoteResponse,
	transformTDAGetUserPrincipalsResponse,
	transformTDAGetPriceHistoryResponse,
} = require('./transforms');

const TD_AMERITRADE_API = 'https://api.tdameritrade.com';
const TD_AMERITRADE_OAUTH_CLIENT_SUFFIX = '@AMER.OAUTHAP';

class TDAmeritradeAPI {
	// clientId     - app's consumer key from https://developer.tdameritrade.com/user/me/apps
	// redirectUri  - app's callback URL from https://developer.tdameritrade.com/user/me/apps
	// refreshToken - refresh token from https://developer.tdameritrade.com/authentication/apis/post/token-0
	constructor(clientId, redirectUri, refreshToken) {
		this.clientId = clientId;
		this.redirectUri = redirectUri;
		this.refreshToken = refreshToken;
		// expires every 1800 seconds and needs to be refreshed
		this.accessToken = '';
	}

	initialize = async () => {
		console.log('Initializing TD Ameritrade API...');
		if (!this.clientId) {
			throw new Error('Missing TD Ameritrade client ID.');
		}
		if (!this.redirectUri) {
			throw new Error('Missing TD Ameritrade redirect URI.');
		}
		if (!this.refreshToken) {
			throw new Error('Missing TD Ameritrade refresh token.');
		}
		await this.startAccessTokenRefreshCycle();
	};

	apiPost = async (path, data, noAuthHeader) => {
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
		};
		if (!noAuthHeader) {
			headers.Authorization = `Bearer ${this.accessToken}`;
		}
		return await axios({
			method: 'post',
			url: TD_AMERITRADE_API + path,
			// TD Ameritrade expects application/x-www-form-urlencoded data
			data: qs.stringify(data),
			headers,
		});
	};

	apiGet = async (path, noAuthHeader) => {
		return await axios({
			url: TD_AMERITRADE_API + path,
			headers: noAuthHeader ? undefined : {
				'Authorization': `Bearer ${this.accessToken}`,
			},
		});
	};

	refreshAccessToken = async () => {
		console.log('Refreshing TD Ameritrade access token...');
		const res = await this.apiPost('/v1/oauth2/token', {
			grant_type: 'refresh_token',
			refresh_token: this.refreshToken,
			client_id: this.clientId + TD_AMERITRADE_OAUTH_CLIENT_SUFFIX,
			redirect_uri: this.redirectUri,
		}, true);
		this.accessToken = res.data.access_token;
		// # seconds until expiration (usually 1800)
		return res.data.expires_in;
	};

	startAccessTokenRefreshCycle = async () => {
		try {
			const expiresIn = await this.refreshAccessToken();
			setInterval(async () => {
				try {
					await this.refreshAccessToken();
				} catch (e) {
					// TODO: notify client; an unrefreshed token is dangerous
					console.error(e);
				}
			// give 10% buffer in case an error occurs while refreshing
			}, (expiresIn * 0.9) * 1000);
		} catch (e) {
			console.warn('Unable to refresh TD Ameritrade access token.');
			console.error(e);
		}
	};

	getAccounts = async () => {
		// https://developer.tdameritrade.com/account-access/apis/get/accounts-0
		console.log('Fetching TD Ameritrade accounts...');
		const res = await this.apiGet('/v1/accounts');
		return transformTDAGetAccountsResponse(res.data);
	};

	getQuote = async (ticker) => {
		// https://developer.tdameritrade.com/quotes/apis/get/marketdata/%7Bsymbol%7D/quotes
		const res = await this.apiGet(`/v1/marketdata/${ticker.toUpperCase()}/quotes`);
		return transformTDAGetQuoteResponse(res.data);
	};

	getUserPrincipals = async (fields) => {
		// https://developer.tdameritrade.com/user-principal/apis/get/userprincipals-0
		const res = await this.apiGet(`/v1/userprincipals?fields=${encodeURIComponent(fields)}`);
		return transformTDAGetUserPrincipalsResponse(res.data);
	};

	// params is an object configurable with the following keys:
	// periodType            - day, month, year, ytd
	// period                - day: 1, 2, 3, 4, 5, 10*, month: 1*, 2, 3, 6, year: 1*, 2, 3, 5, 10, 15, 20, ytd: 1
	// frequencyType         - day: minute, month: daily, weekly*, year: daily, weekly, monthly*, ytd: daily, weekly*
	// frequency             - minute: 1*, 5, 10, 15, 30, daily: 1, weekly: 1, monthly: ,
	// startDate, endDate    - in milliseconds since epoch
	// needExtendedHoursData - true, false
	getPriceHistory = async (params) => {
		// https://developer.tdameritrade.com/price-history/apis/get/marketdata/%7Bsymbol%7D/pricehistory
		const res = await this.apiGet(`/v1/marketdata/${ticker.toUpperCase()}/pricehistory?${qs.stringify(params)}`);
		return transformTDAGetPriceHistoryResponse(res.data);
	};

	// params is an object configurable with the following keys:
	// contractType     - CALL, PUT, ALL
	// strikeCount      - The number of strikes to return above and below the at-the-money price.
	// includeQuotes    - Include quotes for options in the option chain. Can be TRUE or FALSE. Default is FALSE.
	// strategy         - Passing a value returns a Strategy Chain. Possible values are SINGLE, ANALYTICAL (allows use
	//                    ofthe volatility, underlyingPrice, interestRate, and daysToExpiration params to calculate
	//                    theoretical values), COVERED, VERTICAL, CALENDAR, STRANGLE, STRADDLE, BUTTERFLY, CONDOR,
	//                    DIAGONAL, COLLAR, or ROLL. Default is SINGLE.
	// interval         - Strike interval for spread strategy chains (see strategy param).
	// strike           - Provide a strike price to return options only at that strike price.
	// range            - Returns options for the given range. Possible values are:
	//                    ITM: In-the-money
	//                    NTM: Near-the-money
	//                    OTM: Out-of-the-money
	//                    SAK: Strikes Above Market
	//                    SBK: Strikes Below Market
	//                    SNK: Strikes Near Market
	//                    ALL: All Strikes (default)
	// fromDate         - Only return expirations after this date. For strategies, expiration refers to the nearest term
	//                    expiration in the strategy. Valid ISO-8601 formats are: yyyy-MM-dd and yyyy-MM-dd'T'HH:mm:ssz.
	// toDate           - Only return expirations before this date. For strategies, expiration refers to the nearest term
	//                    expiration in the strategy. Valid ISO-8601 formats are: yyyy-MM-dd and yyyy-MM-dd'T'HH:mm:ssz.
	// volatility       - Volatility to use in calculations. Applies only to ANALYTICAL strategy chains (see strategy param).
	// underlyingPrice  - Underlying price to use in calculations. Applies only to ANALYTICAL strategy chains (see strategy param).
	// interestRate     - Interest rate to use in calculations. Applies only to ANALYTICAL strategy chains (see strategy param).
	// daysToExpiration - Days to expiration to use in calculations. Applies only to ANALYTICAL strategy chains (see strategy param).
	// expMonth         - Return only options expiring in the specified month. Month is given in the three character format.
	//                    Example: JAN
	//                    Default is ALL.
	// optionType       - Type of contracts to return. Possible values are:
	//                    S: Standard contracts
	//                    NS: Non-standard contracts
	//                    ALL: All contracts (default)
	getOptionChain = async (params) => {
		// https://developer.tdameritrade.com/option-chains/apis/get/marketdata/chains
		const res = await this.apiGet(`/v1/marketdata/chains?${qs.stringify(params)}`);
		return res.data;
	};

	getWebSocketConnection = async () => {
		const ws = new TDAmeritradeWebSocket(this);
		await ws.initialize();
		return ws;
	};
}

module.exports = TDAmeritradeAPI;
