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


const commandFolders = fs.readdirSync('./commands');

for(const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for(const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);

	}
}

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

