const axios = require('axios');
const qs = require('qs');
const WebSocket = require('websocket').client;

const {
	transformTDAGetAccountsResponse,
	transformTDAGetQuoteResponse,
	transformTDAGetUserPrincipalsResponse,
} = require('./transforms');

const TD_AMERITRADE_API = 'https://api.tdameritrade.com';
const TD_AMERITRADE_OAUTH_CLIENT_SUFFIX = '@AMER.OAUTHAP';

class TDAmeritradeAPI {
	// clientId - app's consumer key from https://developer.tdameritrade.com/user/me/apps
	// redirectUri - app's callback URL from https://developer.tdameritrade.com/user/me/apps
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
		console.log('Fetching TD Ameritrade accounts...');
		const res = await this.apiGet('/v1/accounts');
		return transformTDAGetAccountsResponse(res.data);
	};

	getQuote = async (ticker) => {
		const res = await this.apiGet(`/v1/marketdata/${ticker.toUpperCase()}/quotes`);
		return transformTDAGetQuoteResponse(res.data);
	};

	getUserPrincipals = async (fields) => {
		const res = await this.apiGet(`/v1/userprincipals?fields=${encodeURIComponent(fields)}`);
		return transformTDAGetUserPrincipalsResponse(res.data);
	};

	_connectWebSocket = (uri) => new Promise((resolve, reject) => {
		const ws = new WebSocket();

		ws.on('connectFailed', (error) => {
			console.error('TD Amertride WebSocket client to connect.');
			reject(error);
		});

		ws.on('connect', (conn) => {
			console.log('TD Ameritrade WebSocket client connected.');
			resolve(conn);
		});

		ws.connect(uri);
	});

	getWebSocketConnection = async () => {
		// https://developer.tdameritrade.com/content/streaming-data
		const r = await this.getUserPrincipals('streamerSubscriptionKeys,streamerConnectionInfo');
		// converts ISO-8601 response in snapshot to ms since epoch accepted by streamer
		const tokenTimeStampAsDateObj = new Date(r.streamerInfo.tokenTimestamp);
		const tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime();

		const credentials = {
			userid: r.accounts[0].accountId,
			token: r.streamerInfo.token,
			company: r.accounts[0].company,
			segment: r.accounts[0].segment,
			cddomain: r.accounts[0].accountCdDomainId,
			usergroup: r.streamerInfo.userGroup,
			accesslevel: r.streamerInfo.accessLevel,
			authorized: 'Y',
			timestamp: tokenTimeStampAsMs,
			appid: r.streamerInfo.appId,
			acl: r.streamerInfo.acl,
		};

		const request = {
			requests: [
				{
					service: 'ADMIN',
					command: 'LOGIN',
					requestid: 0,
					account: r.accounts[0].accountId,
					source: r.streamerInfo.appId,
					parameters: {
						credential: qs.stringify(credentials),
						token: r.streamerInfo.token,
						version: '1.0',
					},
				},
			],
		};

		const conn = await this._connectWebSocket(`wss://${r.streamerInfo.streamerSocketUrl}/ws`);
		// authenticate
		conn.send(JSON.stringify(request));

		return conn;
	};
}

module.exports = TDAmeritradeAPI;
