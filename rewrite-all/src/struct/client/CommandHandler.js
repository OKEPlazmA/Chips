'use strict';
Object.defineProperty(exports, "__esModule", { value: true });

const Handler = class CommandHandler {
  constructor (client) {
    this.client = client;
    this.prefix = client.prefix;
    this.prefix = client.database.prefixStore;
  }

  prehandle (msg) {
    if(this.globalBannedUser(msg.author.id)) return true;

    for(const p of this.prefix){
    }
  }

  handle (msg, prefix) {
    const precmd = msg.content.split(/\s+/)[0].toLowerCase().replace(this._.escapeRegExp(prefix),'');
    if(!this.cmds.has(precmd)) return false;
    const ctx = {
      'msg': msg,
      'message': msg,
      'channel': msg.channel,
      'guild': msg.guild,
      'server': msg.guild,
      'author': msg.author,
      'member': msg.member,
      'send': msg.channel.send.bind(msg.channel),
      'reply': msg.reply.bind(msg),
      'client': this.client,
      'bot': this.client,
      'content': msg.content,
      'args': this._.drop(msg.content.split(/\s+/)),
      'precmd': precmd;
      'suffix': msg.content.split(/\s+/).length>1?msg.content.substring(msg.content.indexOf(msg.content.split(/\s+/)[1])+1):null,
      'prefix': prefix,
      'Discord': this.Discord,
    };


  }

  posthandle (msg) {

  }
};

function(Discord, client) {
  return async (msg, prefix) => {
    const regprefix = _.escapeRegExp(prefix);
    const noprefix = msg.content.replace(new RegExp(`^${regprefix}`), "");
    let context = {
      noprefix, prefix, msg, Discord, client,
      message: msg,
      channel: msg.channel,
      content: msg.content,
      guild: msg.guild,
      send: msg.channel.send.bind(msg.channel),
      reply: msg.reply.bind(msg),
      member: msg.member,
      author: msg.author,
      args: _.drop(msg.content.split(/\s+/)),
      bot: client,
      c: msg.channel,
      gMember: msg.guild?msg.guild.member.bind(msg.guild):_=>_,
      getUser: client.users.get.bind(client.users),
      doEval: stuff => {
        const timestamp = Date.now();
        return new Promise((res, rej) => {
          console.log("doEval part: dideval" + timestamp);
          Messager.once("dideval" + timestamp, ({ err, result }) => {
            console.log("Received doEval");
            if (err) rej(result);
            else res(result);
          });
          Messager.emit("eval", { evalContent: stuff, vars: context, timestamp });
          console.log("Emitted eval");
        });
      },
      delay: (ms) => new Promise( res => setTimeout(()=>res(ms),ms) ),
      times: ["years","months","weeks","days","hours","minutes","seconds"],
    };
    context.convertTime = async (obj, i) => {
      if(obj instanceof Date){
        if(isNaN(i)) throw 'Invalid number given for index';
        if(i>=context.times.length) throw 'Invalid index given';
        let diff = moment().diff(obj, context.times[i], true).toFixed(2);
        for(;i<context.times.length-1;){
          if(diff>1) return [diff,i];
          diff = moment().diff(obj, context.times[++i], true).toFixed(2);
        }
        return [diff,i];
      }else{
        throw 'Invalid date!';
      }
    };
    context.loadingBar = (msg, seconds = 5, l = 30, emb = false, mu = 5) => {
      return new Promise( async res => {
        let cb = '`', c ='▓', u = '░', m, embed;
        const switchTitle = e => {
          switch(e.title) {
            case 'Loading.': { return e.setTitle('Loading..'); }
            case 'Loading..': { return e.setTitle('Loading...'); }
            case 'Loading...': { return e.setTitle('Loading....'); }
            case 'Loading....': { return e.setTitle('Loading.'); }
          }
        };
        if(emb){
          embed = new context.Discord.MessageEmbed().setDescription(cb+u.repeat(l)+cb).setColor(msg.member.displayColor || 10342).setTitle('Loading.');
          m = await msg.channel.send('', { embed });
        }else
          m = await msg.channel.send(cb+u.repeat(l)+cb);
        for(let i=1; i<Math.floor(l/mu)+1;i++) {
          await context.delay(~~(1000*seconds/(l/mu)));
          if(emb){
            embed = switchTitle(embed.setDescription(cb+c.repeat(mu*i)+u.repeat((l-mu*i))+cb));
            await m.edit('', { embed });
          }else
            await m.edit(cb+c.repeat(mu*i)+u.repeat((l-mu*i))+cb);
        }
        if(emb) m.edit('', {embed: embed.setTitle('Done Loading!').setTimestamp(new Date())});
        else m.edit('**Done Loading!**');
        res(m);
      });
    };
    for (const cmdn in client.commands) {
      const cmd = client.commands[cmdn];
      if (new RegExp(`^${_.escapeRegExp(cmdn)}$`).test(noprefix.split(/\s+/)[0])){
        const meta = cmd.metadata;
        if(meta==null) return msg.reply('This command has an error with its metadata! Please report this to my developers!');
        if(meta.perm!=null&&meta.perm[0]!=null){
          console.log(meta.perm[0]);
          permissions.checkMulti(msg, meta.perm[0]).then((info) =>{
            console.log("[Command] "+ info);
            return cmd.run(msg, context);
          }).catch((reason)=>{
            if(msg.member&&(meta.customperm&&meta.customperm[0])){
              if(!msg.member.hasPermission(meta.customperm[0])){
                console.log("[Command] Rejected " + reason);
                issue=true;
                return msg.reply(`${reason}\nYou could also use this if you have \`\`${meta.customperm[0]}\`\` permissions`);
              }else{
                console.log("[Command] Accepted due to customperm bypass.");
                return cmd.run(msg, context);
              }
            }else{
              console.log('[Command] Rejected '+ reason);
              return msg.reply(reason);
            }
          });
        }else{
          console.log(`meta perm not found! ${meta?JSON.stringify(meta):''}`);
          return cmd.run(msg, context);
        }
      }
    }
  };
};
