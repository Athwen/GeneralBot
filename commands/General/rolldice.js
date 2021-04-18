module.exports = {
	name: 'rolldice',
	description: 'roll a dice',
	execute(message, args) {
		const charArray = args[0].split('');

		if(charArray.length == 3) {
			if(isNaN(charArray[0]) && isNaN(charArray[2])) {
				message.reply('intended format is <#>d<#>?');
				return;
			}
		} else {
			return;
		}

		const firstNumm = charArray[0], secondNum = charArray[2];
		let result = 0;


		for(let i = 0; i < firstNumm; i++) {
			result += Math.floor((Math.random() * secondNum) + 1);

		}

		message.reply(`Your result is ${result}`);

	},
};