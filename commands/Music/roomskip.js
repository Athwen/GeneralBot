const { servers } = require('./createroom');

module.exports = {
	name: 'roomskip',
	description: 'skips music in a music room',
	async execute(message, args) {
		if(servers[message.guild.id]) {
			servers[message.guild.id].dispatcher.emit('finish');

		} else {
			message.reply('The bot is not currently playing music');
		}
	},
};