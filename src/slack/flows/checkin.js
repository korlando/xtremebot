module.exports = async ({ text, instance, messageEvent }) => {
	if (text.match(/^check(ing)?( |-)?in$/i)) {
		const userId = messageEvent.user;
		const user = instance.slackUsers.find(u => u.id === userId);
		const name = user && user.profile && user.profile.displayName || user.profile.realName || '(unnamed)';
		const channel = messageEvent.channel;
		if (instance.checkinTimers[userId]) {
			clearTimeout(instance.checkinTimers[userId]);
			instance.send({
				text: 'Checkin complete!',
				channel,
			});
			delete instance.checkinTimers[userId];
		} else {
			// 2 hours
			instance.checkinTimers[userId] = setTimeout(() => {
				instance.send({
					text: `<!channel> it's been 2 hours since ${name} last checked in.`,
					channel,
				});
				delete instance.checkinTimers[userId];
			}, 2 * 60 * 60 * 1000);
			instance.send({
				text: `You're checked in, ${name}! Please check back in within 2 hours.`,
				channel,
			});
		}
		return true;
	}
	return false;
};
