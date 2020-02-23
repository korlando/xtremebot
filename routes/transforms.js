const transformMessageEvent = (e) => ({
	type: e.type,
	channel: e.channel,
	user: e.user,
	text: e.text,
	ts: e.ts,
	eventTs: e.event_ts,
	channelType: e.channel_type,
});

const resolveSlackEvent = (e) => {
	const event = e || {};
	const { type } = event;
	switch (type) {
		case 'message':
			return transformMessageEvent(event);
	}
	return event;
};

module.exports = {
	transformSlackEventBody: (b) => ({
		token: b.token,
		teamId: b.team_id,
		apiAppId: b.api_app_id,
		event: resolveSlackEvent(b.event),
		type: b.type,
		authedTeams: b.authed_teams || [],
		eventId: b.event_id,
		eventTime: b.event_time,
	}),
};
