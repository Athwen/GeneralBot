const { servers, roomsToServer } = require('../commands/Music/createroom');

exports.setApp = async function(app, client) {
	app.post('/api/skipsong', async (req, res, next) => {
		const { roomCode } = req.body;

		const serverID = roomsToServer[roomCode].serverID;

		servers[serverID].dispatcher.emit('finish');

		res.status(200).send({ err : '' });
	});
};