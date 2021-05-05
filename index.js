const Discord = require('discord.js');
const client = new Discord.Client({ intents: Discord.Intents.ALL });
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const port = process.env.PORT || 5000;
const path = require('path');

require('dotenv').config();
const prefix = process.env.PREFIX;

client.commands = new Discord.Collection();


// firebase stuff
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const commandFolders = fs.readdirSync('./commands');

for(const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for(const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);

	}
}

const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
	// Set static folder
	app.use(express.static('frontend/build'));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
	});
}

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE, OPTIONS',
	);
	next();
});

const endPoints = fs.readdirSync('./api').filter(file => file.endsWith('.js'));
for(const file of endPoints) {
	const api = require(`./api/${file}`);
	api.setApp(app);

}


const server = app.listen(port, () => {
	console.log(`Server listening at port: ${port}`);

});

client.once('ready', async () => {
	console.log('Ready!');

});

client.on('message', message =>{

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	if(!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	} else if (args[0] == 'help') {
		return message.channel.send(command.help);

	}

	try {
		command.execute(message, args);

	} catch (error) {
		console.log(error);
		message.reply('There was an error trying to execute that command');

	}

});

client.login(process.env.TOKEN);

module.exports = {
	db: db,
};