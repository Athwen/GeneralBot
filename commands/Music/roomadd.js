const admin = require('firebase-admin');
const axios = require('axios').default;
const { servers, db } = require('./createroom');
const ytsearch = require('youtube-search');
const util = require('util');

const opts = {
	maxResults: 10,
	key: process.env.YTKEY,
	type: 'video, playlist',
};

module.exports = {
	name: 'roomadd',
	description: 'Adds music to a music room queue',
	async execute(message, args) {
		let songURL = '';
		let videoId = '';

		if(args[0].startsWith('https') && !args[0].includes('playlist') && args[0].includes('v=')) {
			const url = new URL(args[0]);
			const queryString = url.search;
			const urlParameters = new URLSearchParams(queryString);

			videoId = urlParameters.get('v');

			songURL = args[0];

		} else {
			const results = await ytsearch(args.join(), opts);
			songURL = results.results[0].link;
			const url = new URL(songURL);
			const queryString = url.search;
			const urlParameters = new URLSearchParams(queryString);

			videoId = urlParameters.get('v');

		}


		const reqURL = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YTKEY}`;

		const response = await axios.get(reqURL);
		const data = response.data.items[0];

		const newSong = {
			songName: data.snippet.title,
			songLink: songURL,
			enqueuedBy: message.author.username,
			thumbnail: data.snippet.thumbnails.default.url,
		};

		const server = servers[message.guild.id];

		server.queue.push(newSong);

		await db.collection('rooms').doc(server.roomCode).update({
			queue: server.queue,
		});


	},
};
