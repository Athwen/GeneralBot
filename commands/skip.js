const { servers } = require('./play.js');
const ytdl = require('ytdl-core');

module.exports = {
	name: 'skip',
	description: 'skips music',
	async execute(message, args) {
		if(servers[message.guild.id]) {
			const server = servers[message.guild.id];

			if(server.queue[0]) {
				server.connection.play(ytdl(server.queue[0], { filter: 'audioonly' }), { type: 'webm/opus', volume: 0.075 });
				server.queue.shift();
			}else{
				server.connection.disconnect();
				server.connection = undefined;
			}
		}

	},
};