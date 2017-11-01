
let nickname = require('./nickname');

console.log('[CPSCMD][MODERATION][nickname] Building objects...');
nickname.metadata = {
  category: require('../').category,
  description: 'Insert complicated things here.',
  usage: 'nickname <name> or nickname <user> <name>',
  example: ['nickname JohnSmith'],
  perm: ['global.moderation.nickname'],
  customperm: ['SEND_MESSAGES'],
};

console.log('[CPSCMD][MODERATION][nickname] Build objects complete!');
module.exports = [
  [nickname.name, nickname],
  ['nick', nickname],
];
