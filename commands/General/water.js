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
			message.reply('Your timer has been deactivated.');
			clearInterval(usersPref[message.author.id].timeout);
		} else {
			message.reply('You don\'t have a timer active!');

		}

	}else{
		console.log(usersPref[message.author.id]);
		if(usersPref[message.author.id]) {
			message.reply('Delete your current timer before creating a new one.');
			return;
		}
		usersPref[message.author.id] = {};
		const currDate = new Date();
		if(currDate.getHours() > 18) {
			usersPref[message.author.id].date = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + 1, (currDate.getHours() + 5) % 23);

		} else {
			usersPref[message.author.id].date = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), currDate.getHours() + 5);

		}

		usersPref[message.author.id].timeout = setInterval(() => {
			const insideDate = new Date();
			if(insideDate < usersPref[message.author.id].date) {
				return message.reply('Drink water');
			} else {
				clearInterval(usersPref[message.author.id].timeout);
				delete usersPref[message.author.id];
			}

		}, time);
		message.reply('Your reminder is set!');

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