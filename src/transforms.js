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

	transformSlackAuthTest: (b) => ({
		ok: b.ok,
		url: b.url,
		team: b.team,
		user: b.user,
		teamId: b.team_id,
		userId: b.user_id,
		botId: b.bot_id,
		responseMetadata: b.response_metadata,
	}),

	transformBotInfo: (b) => ({
		ok: b.ok,
		bot: {
			id: b.bot.id,
			deleted: b.bot.deleted,
			name: b.bot.name,
			updated: b.bot.updated,
			appId: b.bot.app_id,
			userId: b.bot.user_id,
			icons: b.icons,
		},
	}),
};
