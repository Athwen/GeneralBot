const { servers } = require('./play');

module.exports = {
	name: 'skip',
	description: 'skips music',
	async execute(message, args) {
		if(servers[message.guild.id]) {
			servers[message.guild.id].queue.shift();
			servers[message.guild.id].musicemitter.emit('nextSong');

		} else {
			message.reply('The bot is not currently playing music');
		}
	},
};