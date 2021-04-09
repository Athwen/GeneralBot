// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
	let j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

module.exports = {
	name: 'teams',
	description: 'creates teams',
	args: true,
	usage: '<numTeams> <EvenTeamSize?> <Person1> <Person2> ... <PersonN>',
	execute(message, args) {
		const numTeams = args[0];
		const evenTeamSize = args[1].toLowerCase();

		// check if parameters are correct
		if(isNaN(numTeams) || (evenTeamSize != 'true' && evenTeamSize != 'false')) {
			message.reply('```Team size must be a number and EvenTeamSize must be either true or false```');
			return;
		}

		// get the list of people
		const people = [];
		for(let i = 2; i < args.length; i++) {
			people.push(args[i]);

		}

		// check if even team size is true and
		// if you are able to create even teams
		if(evenTeamSize == 'true' && people.length % numTeams != 0) {
			// eslint-disable-next-line quotes
			message.reply(`\`\`\`You set even team size to true but you can't create ${numTeams} even teams with ${people.length} people\`\`\` `);

		}

		// shuffle people for random teams
		shuffle(people);
		const teams = [];

		// assign teams
		for(let i = 0; people.length > 0; i++) {
			if(teams[i % numTeams] == undefined) teams[i % numTeams] = [];
			teams[i % numTeams].push(people.pop());

		}

		// display teams
		message.reply(`\`\`\`Teams \n${teams.map(element => `Team: ${element} \n`).join('') }\`\`\``);


	},
};