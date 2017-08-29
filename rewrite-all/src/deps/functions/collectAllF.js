'use strict';
Object.defineProperty(exports, "__esModule", { value: true });

exports.default = ({ }) => {
  // options must contain mfilter and rfilter,
  // a users object that either has an allowAll = true or array of userids
  // accepted/deniedMsgs and accepted/deniedRxns
  // expire (time in ms)
  // reply (boolean whether to reply in prompt)
  const collectAll = (msg, { options }) => {
    const channel = msg.channel;
    const { users, promptMsg, expire, numMsgs, acceptedMsgs, deniedMsgs } = options;
    const allMsgs = [...acceptedMsgs, ...deniedMsgs];
    return new Promise( (res, rej) => {
      let externalMsgCounter = 0;
      const mcol = channel.createMessageCollector(
        m=>{
          if(users.allowAll) return true;
          if(users.indexOf(m.author.id)){
            if(options.mfilter(m)) {
              externalMsgCounter++;
            }
            if(externalMsgCounter>numMsgs) mcol.stop();
          }
          return false;
        },
        { max: numMsgs || 1, time: expire }
      );

      mcol.on('end', collected => {
        if(collected.size === 0) rej('timeout');
      });

      if(options.reply) msg.
    });
  };
  return collectAll;
};
