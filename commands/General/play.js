const ytdl = require('ytdl-core-discord');
const ytsearch = require('youtube-search');
require('dotenv').config();
const util = require('util');
const axios = require('axios');
const url = require('url');

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const MusicEmitter = new MyEmitter();

const servers = {};
const YTLink = 'https://www.youtube.com/watch?v=';

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
		if(!args[0].startsWith('https') && !args[0].includes('playlist')) {

			const ytSearchPromise = util.promisify(ytsearch);

			ytSearchPromise(args.join(), opts).then(results => {
				if(!servers[message.guild.id]) {
					servers[message.guild.id] = { queue: [] };

				}
				link = results[0].link;
				servers[message.guild.id].queue.push(link);
				console.log('link inside ytsearch:' + link);

			}).catch(err => {
				console.log(err);

			});
		} else if(args[0].includes('playlist')) {
			if(!servers[message.guild.id]) {
				servers[message.guild.id] = { queue: [] };
			}

			const currURL = new URL(args[0]);
			const playlistID = currURL.searchParams.get('list');
			console.log(playlistID);
			let nextPageToken = '';

			do{
				const getReq = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&pageToken=${nextPageToken}&playlistId=${playlistID}&key=${process.env.YTKEY}`;
				let i = 0;
				await axios.get(getReq).then(response => {
					console.log(response.data.items[0].snippet.resourceId.videoId);
					for(i = 0; i < response.data.items.length; i++) {
						console.log(response.data.items[i].snippet['resourceId'].videoId);
						servers[message.guild.id].queue.push(`${YTLink}${response.data.items[i].snippet['resourceId'].videoId}`);

					}

					nextPageToken = response.data['nextPageToken'];

				}).catch(error => {
					console.log(error);

				});

			} while(nextPageToken != undefined);

			console.log(servers[message.guild.id].queue);

		} else {
			if(!servers[message.guild.id]) {
				servers[message.guild.id] = { queue: [] };

			}
			servers[message.guild.id].queue.push(args[0]);
		}


		if(servers[message.guild.id] == undefined) {
			if(!message.member.voice) {
				message.reply('You must be in a voice channel first!');
				return;
			}
			const connection = await message.member.voice.channel.join();

			servers[message.guild.id].connection = connection;

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