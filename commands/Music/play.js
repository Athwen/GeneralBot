const ytdl = require('ytdl-core-discord');
const ytsearch = require('youtube-search');
require('dotenv').config();
const util = require('util');
const axios = require('axios');

const EventEmitter = require('events');
const { VoiceState } = require('discord.js');


const servers = {};
const YTLink = 'https://www.youtube.com/watch?v=';
const opts = {
	maxResults: 10,
	key: process.env.YTKEY,
	type: 'video, playlist',
};

module.exports = {
	name: 'play',
	description: 'music time',
	servers: servers,
	async execute(message, args) {
		console.log(message.client.voice.connections);
		if (!message.member.voice.channel) {
			message.reply('You must be in a voice channel first!');
			return;
		}

		class MyEmitter extends EventEmitter { }
		const MusicEmitter = new MyEmitter();

		let link;
		// if there is no link then search on youtube and add link to queue
		if (args[0] == 'banger') {
			if (!servers[message.guild.id]) {
				servers[message.guild.id] = { queue: [] };
				servers[message.guild.id].connection = null;
			}
			servers[message.guild.id].queue.push('https://www.youtube.com/watch?v=XD-OFP-0H5g');
		} else if (!args[0].startsWith('https') && !args[0].includes('playlist')) {

			// Get YT link
			const ytSearchPromise = util.promisify(ytsearch);
			await ytSearchPromise(args.join(), opts).then(results => {
				if (!servers[message.guild.id]) {
					servers[message.guild.id] = { queue: [] };
					servers[message.guild.id].connection = null;
				}
				// Add to server queue
				link = results[0].link;
				servers[message.guild.id].queue.push(link);

			}).catch(err => {
				console.log(err);
				message.reply('Search error, try using a link instead');

			});
			// if link is a playlist then get playlist id
		} else if (args[0].includes('list')) {
			if (!servers[message.guild.id]) {
				servers[message.guild.id] = { queue: [] };
				servers[message.guild.id].connection = null;
			}

			const currURL = new URL(args[0]);
			const playlistID = currURL.searchParams.get('list');
			let nextPageToken = '';

			// This loop should go through each page of youtube's item/pagination
			do {
				const getReq = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&pageToken=${nextPageToken}&playlistId=${playlistID}&key=${process.env.YTKEY}`;
				let i = 0;
				noError = true;
				// Make the request to Youtube Data API
				await axios.get(getReq).then(response => {
					for (i = 0; i < response.data.items.length; i++) {
						servers[message.guild.id].queue.push(`${YTLink}${response.data.items[i].snippet['resourceId'].videoId}`);

					}
					// Set next page token
					nextPageToken = response.data['nextPageToken'];

				}).catch(error => {
					console.log(error);
					noError = false;
					message.reply('playlist be broken right now, use a link instead');

				});

				// Go until there is no next page
			} while (nextPageToken != undefined && noError);

		} else {
			// If it is just a youtube link then add to queue
			if (!servers[message.guild.id]) {
				servers[message.guild.id] = { queue: [] };
				servers[message.guild.id].connection = null;
			}
			servers[message.guild.id].queue.push(args[0]);
		}

		// If server isnt created yet then create it and create connection
		if (servers[message.guild.id] != null && servers[message.guild.id].connection == null) {
			const connection = await message.member.voice.channel.join();
			// await connection.voice.setRequestToSpeak(true);

			// message.client.on('voiceStateUpdate', () => {
			// 	if(connection.voice.suppress == false) {
			// 		message.client.emit('notSuppressed');
			// 	}
			// });

			// message.client.once('notSuppressed', () => {
			connection.voice.setSelfDeaf(true);

			servers[message.guild.id].connection = connection;
			servers[message.guild.id].musicemitter = MusicEmitter;

			// create listener for whenever a new song needs to be played
			servers[message.guild.id].musicemitter.on('nextSong', async () => {
				if (!servers[message.guild.id]) return;

				const server = servers[message.guild.id];

				if (server.queue[0] != undefined) {
					const dispatcher = server.connection.play(await ytdl(server.queue[0], { highWaterMark: 1 << 25, filter: 'audioonly' }), { type: 'opus', volume: 0.12 });
					dispatcher.on('finish', () => {
						server.queue.shift();
						servers[message.guild.id].musicemitter.emit('nextSong');
						return;

					});

				} else {
					server.connection.disconnect();

				}

			});

			MusicEmitter.emit('nextSong');
			// });
			connection.on('disconnect', () => {
				delete servers[message.guild.id];

			});

		}

	},
};