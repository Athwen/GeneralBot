const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

require('dotenv').config();
const { prefix } = require('./config.json');

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);

}

client.once('ready', ()=> {
	console.log('Ready!');

});

client.on('message', message =>{

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	if(!client.commands.has(commandName)) return;

	try {
		client.commands.get(commandName).execute(message, args);

	} catch (error) {
		console.log(error);
		message.reply('There was an error trying to execute that command');

	}

});

client.login(process.env.TOKEN);