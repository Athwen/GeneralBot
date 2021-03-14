const ytdl = require('ytdl-core');

module.exports = {
	name: 'play',
	description: 'music time',
	async execute(message, args) {
		if(message.member.voice.channel) {
			const connection = await message.member.voice.channel.join();

			connection.play(ytdl(args[0], { filter: 'audioonly' }), { type: 'webm/opus', volume: 0.075 });

		}
	},
};