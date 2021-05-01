const admin = require('firebase-admin');
const axios = require('axios').default;
require('dotenv').config();


exports.setApp = async function(app, client) {
	app.post('/api/test', async (req, res, next) =>{
		console.log(req.body);
		const { code } = req.body;
		console.log(process.env.DISCORD_SECRET);

		const ret = {};

		try {

			const params = new URLSearchParams();
			params.append('client_id', '800022605901201438');
			params.append('client_secret', process.env.DISCORD_SECRET);
			params.append('redirect_uri', 'https://general-bot-web.herokuapp.com/');
			params.append('grant_type', 'authorization_code');
			params.append('code', code);

			console.log('CODE: ' + code);

			const result = await axios.post('https://discord.com/api/oauth2/token', params);

			const user = await axios.get('https://discord.com/api/v8/users/@me', {
				headers: {
					Authorization: `Bearer ${result.data.access_token}`,
				},
			});

			// EXPIRES AFTER ONE HOUR
			const customToken = await admin.auth().createCustomToken(user.data.id);

			const avatarLink = `https://cdn.discordapp.com/avatars/${user.data.id}/${user.data.avatar}`;

			ret.customToken = customToken;
			ret.avatar = avatarLink;
			ret.username = user.data.username;

		} catch (e) {
			console.log(e.data);

		}


		res.status(200).send(ret);

	});
};