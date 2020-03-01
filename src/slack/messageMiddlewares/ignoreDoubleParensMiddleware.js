module.exports = () => (messageEvent) => {
	// ignore content between double parens
	messageEvent.text = messageEvent.text.trim().replace(/\(\(.*\)\)/gi, '');
	return messageEvent;
};
