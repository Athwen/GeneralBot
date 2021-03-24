const { servers, MusicEmitter } = require('./play.js');

module.exports = {
	name: 'skip',
	description: 'skips music',
	async execute(message, args) {
		if(servers[message.guild.id]) {
			servers[message.guild.id].queue.shift();
			MusicEmitter.emit('nextSong');

		} else {
			message.reply('The bot is not currently playing music');
		}
	},
};