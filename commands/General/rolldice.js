module.exports = {
	name: 'rolldice',
	description: 'roll a dice',
	usage: '<#>d<#>',
	execute(message, args) {
		const charArray = args[0].split('');
		let firstNum, secondNum;

		if(!args[0].includes('d')) {
			message.reply('Proper format is <#>d<#>');
			return;
		}

		for(let i = 0; charArray.length; i++) {
			if(charArray[i] == 'd') {
				firstNum = args[0].substring(0, i);
				secondNum = args[0].substring(i + 1, charArray.length);
				break;
			}
		}

		let result = 0;


		for(let i = 0; i < firstNum; i++) {
			result += Math.floor((Math.random() * secondNum) + 1);

		}

		message.reply(`Your result is ${result}`);

	},
};