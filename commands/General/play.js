const ytdl = require('ytdl-core-discord');
const ytsearch = require('youtube-search');
require('dotenv').config();
const util = require('util');
const axios = require('axios');

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const MusicEmitter = new MyEmitter();

const servers = {};

async function playSong(server) {
	const dispatcher = server.connection.play(await ytdl(server.queue[0], { filter: 'audioonly' }), { type: 'opus', volume: 0.055 });
	dispatcher.on('finish', () => {
		server.queue.shift();
		MusicEmitter.emit('nextSong');
	});

}

const opts = {
	maxResults: 10,
	key: process.env.YTKEY,
	type: 'video, playlist',
};

module.exports = {
	name: 'play',
	description: 'music time',
	servers: servers,
	MusicEmitter: MusicEmitter,
	async execute(message, args) {
		let link;
		if(!args[0].startsWith('https')) {

			const ytSearchPromise = util.promisify(ytsearch);

			ytSearchPromise(args.join(), opts).then(results => {
				link = results[0].link;
				console.log('link inside ytsearch:' + link);

			}).catch(err => {
				console.log(err);

			});
		} else if(args[0].includes('playlist')) {
			const splitURL = args[0].split('list=');
			const playlistID = splitURL[1];

			const getReq = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistID}&key=${process.env.YTKEY}`;

			axios.get(getReq).then(response => {
				console.log(response.data.items);

			});

		} else {
			link = args[0];
		}


		if(servers[message.guild.id]) {
			servers[message.guild.id].queue.push(link);
			console.log(servers[message.guild.id].queue);

		}else {
			const connection = await message.member.voice.channel.join();
			servers[message.guild.id] = { queue: [] };
			servers[message.guild.id].connection = connection;
			servers[message.guild.id].queue.push(link);

			MusicEmitter.on('nextSong', async () => {
				if(!servers[message.guild.id]) return;

				const server = servers[message.guild.id];

				if(server.queue[0] != undefined) {
					const dispatcher = server.connection.play(await ytdl(server.queue[0], { filter: 'audioonly' }), { type: 'opus', volume: 0.055 });
					dispatcher.on('finish', () => {
						server.queue.shift();
						console.log('JHASDNFJSHDBF');
						MusicEmitter.emit('nextSong');
						return;
					});

				} else {
					server.connection.disconnect();
					delete servers[message.guild.id];

				}

			});

			MusicEmitter.emit('nextSong');
		}

	},
};