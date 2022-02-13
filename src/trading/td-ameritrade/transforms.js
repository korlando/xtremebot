const transformTDAGetAccountsSecuritiesAccount = (a) => ({
	type: a.type,
	accountId: a.accountId,
	roundTrips: a.roundTrips,
	isDayTrader: a.isDayTrader,
	isClosingOnlyRestricted: a.isClosingOnlyRestricted,
	initialBalances: a.initialBalances,
	currentBalances: a.currentBalances,
	projectedBalances: a.projectedBalances,
});

module.exports = {
	transformTDAGetAccountsResponse: (data) => data.map((a) => ({
		securitiesAccount: transformTDAGetAccountsSecuritiesAccount(a.securitiesAccount),
	})),
};
