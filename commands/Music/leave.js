const { servers } = require('./play');

module.exports = {
	name: 'leave',
	description: 'Stop playing music and disconnect the bot!',
	execute(message, args) {
		servers[message.guild.id].connection.disconnect();
	},
};