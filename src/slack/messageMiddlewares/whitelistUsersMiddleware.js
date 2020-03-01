module.exports = (usersStr = '') => (messageEvent) => {
	const whitelistedUsers = usersStr.split(',');
	if (!whitelistedUsers.includes(messageEvent.user)) {
		return;
	}
	return messageEvent;
};
