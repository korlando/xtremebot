const transformMessageEvent = (e) => ({
	type: e.type,
	channel: e.channel,
	user: e.user,
	text: e.text,
	ts: e.ts,
	eventTs: e.event_ts,
	channelType: e.channel_type,
});

const transformUsersListMembers = (members) => members.map((m) => ({
	id: m.id,
	teamId: m.team_id,
	name: m.name,
	deleted: m.deleted,
	color: m.color,
	realName: m.real_name,
	tz: m.tz,
	tzLabel: m.tz_label,
	tzOffset: m.tz_offset,
	profile: {
		avatarHash: m.profile.avatar_hash,
		statusText: m.profile.status_text,
		statusEmoji: m.profile.status_emoji,
		realName: m.profile.real_name,
		displayName: m.profile.display_name,
		realNameNormalized: m.profile.real_name_normalized,
		displayNameNormalized: m.profile.display_name_normalized,
		email: m.profile.email,
		image24: m.profile.image_24,
		image32: m.profile.image_32,
		image48: m.profile.image_48,
		image72: m.profile.image_72,
		image192: m.profile.image_192,
		image512: m.profile.image_512,
		team: m.profile.team,
	},
	isAdmin: m.is_admin,
	isOwner: m.is_owner,
	isPrimaryOwner: m.is_primary_owner,
	isRestricted: m.is_restricted,
	isUltraRestricted: m.is_ultra_restricted,
	isBot: m.is_bot,
	updated: m.updated,
	isAppUser: m.is_app_user,
	has2fa: m.has_2fa,
}));

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

	transformUsersList: (b) => ({
		ok: b.ok,
		members: transformUsersListMembers(b.members),
		cacheTs: b.cache_ts,
		responseMetadata: b.response_metadata,
	}),
};
