const usersPref = {};


module.exports = {
	name: 'water',
	description: 'a water reminder',
	args: true,
	usage: '<minutes>',
	execute(message, args) {
		const minutesToMS = (args[0] * 60) * 1000;

		if(args[0] < 10) {
			message.reply('Enter an interval that is longer than 10 minutes');
			return;
		}
		if(args[0] > 35700) {
			message.reply('Enter an interval that wont break the bot pls');
			return;
		}

		if(usersPref[message.author.id]) {
			clearInterval(usersPref[message.author.id].timeout);

		}else{
			usersPref[message.author.id] = {};
			usersPref[message.author.id].timeout = setInterval(() => {
				return message.reply('Drink water');
			}, minutesToMS);

		}
	},
};