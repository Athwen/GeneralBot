const ytdl = require('ytdl-core');
const ytsearch = require('youtube-search');
require('dotenv').config();

const servers = {};

const opts = {
	maxResults: 10,
	key: process.env.YTKEY,
	type: 'video',
};


module.exports = {
	name: 'play',
	description: 'music time',
	servers: servers,
	async execute(message, args) {
		let link;
		if(message.member.voice.channel && !args[0].startsWith('https')) {
			ytsearch(args.join(), opts, function(err, results) {
				console.log(err);
				link = results[0].link;
				console.log('link inside ytsearch:' + link);

				if(servers[message.guild.id]) {
					servers[message.guild.id].queue.push(link);
					message.reply(link);
					console.log(servers[message.guild.id].queue);

				}

			});


		}

		if(servers[message.guild.id]) {
			servers[message.guild.id].queue.push(args[0]);
			message.reply(servers[message.guild.id].queue[0]);
			console.log(servers[message.guild.id].queue);

		}

		// if music is playing already then add to queue
		// dispatcher.on finish play next queued song
		if(servers[message.guild.id] == undefined || servers[message.guild.id].connection == undefined) {
			const connection = await message.member.voice.channel.join();
			const dispatcher = connection.play(ytdl(args[0], { filter: 'audioonly' }), { type: 'webm/opus', volume: 0.075 });
			servers[message.guild.id] = { queue: [] };

			const server = servers[message.guild.id];
			server.dispatcher = dispatcher;
			server.connection = connection;

			server.dispatcher.on('finish', () => {
				console.log('ON FINISH: ' + server.queue[0]);
				if(server.queue[0] != undefined) {
					server.connection.play(ytdl(server.queue[0], { filter: 'audioonly' }), { type: 'webm/opus', volume: 0.075 });

				} else {
					server.connection.disconnect();
					server.connection = undefined;
				}

				server.queue.shift();
			});


		}

	},
};