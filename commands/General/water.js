const usersPref = {};

function createInterval(message, args, time) {
	let stopWater = false;

	// check for stop arg or number arg 
	if(isNaN(args[0])) {
		if(args[0].toLowerCase() == 'stop') {
			stopWater = true;
		} else {
			message.reply('Invalid input');
		}
	} else if(args[0] < 10) {
		message.reply('Enter an interval that is longer than 10 minutes');

	} else if(args[0] > 35700) {
		message.reply('Enter an interval that wont break the bot pls');
		return;
	}

	if(stopWater) {
		if(usersPref[message.author.id]) {
			message.reply('Your intervals have been deactivated.');
			clearInterval(usersPref[message.author.id].timeout);
		} else {
			message.reply('You don\'t have a timer active!');

		}

	}else{
		if(usersPref[message.author.id]) {
			message.reply('Delete your current timer before creating a new one.');
			return;
		}
		usersPref[message.author.id] = {};
		if(Date.getHours() > 18) {
			usersPref[message.author.id].date = new Date(Date.getFullYear, Date.getDate(), Date.getDay() + 1, (Date.getHours() + 5) % 23);

		} else {
			usersPref[message.author.id].date = new Date(Date.getFullYear, Date.getDate(), Date.getDay(), Date.getHours() + 5);

		}

		usersPref[message.author.id].timeout = setInterval(() => {
			if(Date.now() < usersPref[message.author.id].date) {
				return message.reply('Drink water');
			} else {
				clearInterval(usersPref[message.author.id].timeout);
				delete usersPref[message.author.id];
			}

		}, time);
		message.reply('Your reminder is set!');
		console.log(usersPref);

	}

}

module.exports = {
	name: 'water',
	description: 'a water reminder',
	args: true,
	usage: '<minutes>',
	execute(message, args) {
		const minutesToMS = (args[0] * 60) * 1000;
		createInterval(message, args, minutesToMS);

	},
};