// const CodeGenerator = require('node-code-generator');
// const ytdl = require('ytdl-core-discord');
// const admin = require('firebase-admin');

// const servers = {};
// const roomsToServer = {};

// const db = admin.firestore();

// module.exports = {
// 	name: 'createroom',
// 	description: 'Creates a music room',
// 	servers: servers,
// 	db: db,
// 	roomsToServer: roomsToServer,
// 	async execute(message, args) {

// 		if(!message.member.voice.channel || servers[message.guild.id] != null) {
// 			message.reply('You must be in a voice channel first!');
// 			return;
// 		}

// 		// creates room code
// 		const generator = new CodeGenerator();
// 		const codes = generator.generateCodes('******', 5, {});
// 		let doc, count = -1;

// 		do {
// 			count++;
// 			console.log(codes[count]);
// 			doc = await db.collection(codes[count]).get();
// 		}while (doc.exists || count > 5);

// 		// creates document with the room code
// 		await db.collection('rooms').doc(codes[count]).set({
// 			queue: [],
// 			serverID: message.guild.id,

// 		});


// 		servers[message.guild.id] = { queue: [], roomCode: codes[count], playing: false };
// 		const server = servers[message.guild.id];

// 		roomsToServer[server.roomCode] = { serverID: message.guild.id };
// 		console.log(roomsToServer);

// 		message.reply(server.roomCode);

// 		const observer = db.collection('rooms').doc(server.roomCode).onSnapshot(docSnapshot => {
// 			const dataQ = docSnapshot.get('queue');

// 			if(dataQ == undefined) return;

// 			server.queue = dataQ;
// 			console.log(server.queue);

// 			// start playing music if there is no music playing
// 			if(server.queue.length != 0 && server.playing == false) {
// 				const nextSong = server.queue.shift();
// 				server.playing = true;
// 				playMusic(nextSong, server, message);
// 				db.collection('rooms').doc(server.roomCode).update({ queue: server.queue, currentSong: nextSong });
// 			}
// 		});

// 		const connection = await message.member.voice.channel.join();
// 		servers[message.guild.id].connection = connection;

// 	},
// };


// async function playMusic(nextSong, server, message) {

// 	const dispatcher = await server.connection.play(await ytdl(nextSong.songLink, { highWaterMark: 1 << 25, filter: 'audioonly' }), { type: 'opus', volume: 0.5 });
// 	server.dispatcher = dispatcher;

// 	dispatcher.on('finish', () => {
// 		const next = server.queue.shift();
// 		if(next == undefined) {
// 			server.playing = false;
// 			return;
// 		}
// 		db.collection('rooms').doc(server.roomCode).update({ queue: server.queue, currentSong: next });
// 		playMusic(next, server);

// 	});

// }