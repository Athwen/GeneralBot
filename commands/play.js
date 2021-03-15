const ytdl = require('ytdl-core');
const ytsearch = require('youtube-search');
const servers = require('../index');
require('dotenv').config();

const opts = {
	maxResults: 10,
	key: process.env.YTKEY,
	type: 'video',
};


module.exports = {
	name: 'play',
	description: 'music time',
	async execute(message, args) {
		let link;
		if(message.member.voice.channel) {
			ytsearch(args.join(), opts, function(err, results) {

				link = results[0].link;
				console.log('link inside ytsearch:' + link);

				if(servers[message.guild.id]) {
					servers[message.guild.id].queue.push(link);
					message.reply(link);
					console.log(servers[message.guild.id].queue);

				}

			});

			// if music is playing already then add to queue
			// dispatcher.on finish play next queued song
			if(!servers[message.guild.id]) {
				const connection = await message.member.voice.channel.join();
				const dispatcher = connection.play(ytdl(link, { filter: 'audioonly' }), { type: 'webm/opus', volume: 0.075 });
				servers[message.guild.id] = { queue: [] };

				const server = servers[message.guild.id];
				server.dispatcher = dispatcher;
				server.connection = connection;

			}

			const server = servers[message.guild.id];

			server.dispatcher.on('finish', () => {
				server.queue.shift();
				console.log('ON FINISH: ' + server.queue[0]);
				if(server.queue[0]) {
					server.connection.play(ytdl(server.queue[0], { filter: 'audioonly' }), { type: 'webm/opus', volume: 0.075 });

				} else {
					server.connection.disconnect();
				}
			});


		}
	},
};