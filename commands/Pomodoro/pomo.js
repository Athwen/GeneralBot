const { small } = require('ffmpeg-static');
const users = {};

function timeout(minutes) {
	let newTimeout, promise;

	// eslint-disable-next-line prefer-const
	promise = new Promise((resolve, reject) => {
		newTimeout = setTimeout(() => {
			resolve();
		}, minutes * 60 * 1000);

	});
	return {
		promise: promise,
		stop: function() {clearTimeout(newTimeout); },

	};
}

module.exports = {
	name: 'pomo',
	description: 'Allows you to use the pomodoro technique!',
	args: true,
	usage: '<WorkTime> <SmallBreak> <LargeBreak> OR <pomo>',
	async execute(message, args) {

		let workTime, smallBreak, largeBreak;

		if(args[0] == 'pomo') {
			workTime = 25;
			smallBreak = 5;
			largeBreak = 30;

		} else if(args[0] == 'stop') {
			if(users[message.author.id]) {
				message.reply('Your pomodoro session has been stopped!');
				console.log(users[message.author.id]);
				users[message.author.id].timeout.stop();
				users[message.author.id].checkmarks = 4;
				return;
			}else {
				message.reply('You don\'t have an active pomodoro session!');
				return;
			}

		} else if(!isNaN(args[0]) && !isNaN(args[1]) && !isNaN(args[0])) {
			workTime = Number(args[0]);
			smallBreak = Number(args[1]);
			largeBreak = Number(args[2]);

		}

		users[message.author.id] = {};
		const currUser = users[message.author.id];
		currUser.cancel = false;
		currUser.checkmarks = 0;

		while(users[message.author.id].checkmarks < 4) {
			// Work period start
			message.channel.send(message.author.toString() + '```Your work session has started!\nCurrent checkmarks: ' + currUser.checkmarks + '```');
			currUser.timeout = timeout(workTime);
			await currUser.timeout.promise;
			// Work period end and increment checkmark
			users[message.author.id].checkmarks += 1;

			if(currUser.cancel == true) break;
			// Break period start
			const breakTime = users[message.author.id].checkmarks == 4 ? largeBreak : smallBreak;
			if(breakTime == smallBreak) {
				message.channel.send(message.author.toString() + '```Stop working! Enjoy your small break!\nCurrent checkmarks: ' + currUser.checkmarks + '```');
			} else {
				message.channel.send(message.author.toString() + '```Stop working! Enjoy your long break!\nCurrent checkmarks: ' + currUser.checkmarks + '```');
			}


			console.log(breakTime);
			currUser.timeout = timeout(breakTime);
			await currUser.timeout.promise;
			// Break period end and continue in loop
		}
		message.channel.send(message.author.toString() + '```Your pomodoro session has ended! Nice work!\nStart another session with the $pomo command.```');

		delete users[message.author.id];

	},
};