const Searcher = require(path.join(__dirname, '../handlers/Searcher')).default;
const TRUE=true;
const time = ["years","months","weeks","days","hours","minutes","seconds"];

const memberJoin = (member, i) => {
  let diff = moment().diff(member.joinedAt, time[i], true).toFixed(2);
  for(;i<time.length-1;){
    if(diff>1) return [diff,i];
    diff = moment().diff(member.joinedAt, time[++i], true).toFixed(2);
  }
  return [diff,i];
};
const lastSeen = (member, i) => {
  let diff = moment().diff(member.lastMessage.createdAt, time[i], true).toFixed(2);
  for(;i<time.length-1;){
    if(diff>1) return [diff,i];
    diff = moment().diff(member.lastMessage.createdAt, time[++i], true).toFixed(2);
  }
  return [diff,i];
};
const joinedDiscord = (member, i) => {
  let diff = moment().diff(member.user.createdAt, time[i], true).toFixed(2);
  for(;i<time.length-1;){
    if(diff>1) return [diff,i];
    diff = moment().diff(member.user.createdAt, time[++i], true).toFixed(2);
  }
  return [diff,i];
};
const ex = {
  name: "info",
  perm: ["global.info","global.info.all","global.info.serv","global.info.channel","global.info.role","global.info.user","global.info.user.self"],
  customperm: ['SEND_MESSAGES'],
  async func(msg, {send, member, author, channel, guild, args, gMember, reply, content, doEval }) {
    const used = member || author;
    let action;
    if (!args[0]) return send("No action given :(");
    else action = args[0];

    console.log("[Info] Action: "+action);
    console.log("[Info] Creating new searcher for guild " + guild.id);
    let options = { guild: guild };
    searchers[guild.id] = new Searcher( options.guild );
    let infobad = new Discord.RichEmbed().setColor(member.displayColor);

    if(action=="server"){
      try{
        let info = await permissions.checkPermission(msg, ex.perm[2]);
        console.log("[Command] "+ info);
      }catch(err){
        if(!member.hasPermission(ex.customperm[0])){
          console.log("Rejected info server to " + used.id);
          return msg.reply(err);
        }
      }

      let diff =  moment().diff(guild.createdAt,'days');

      let trueMemC = guild.members.filter((member) => { return !member.user.bot; });
      let online = 0, idle = 0, dnd = 0, invis = 0, available = 0;
      let presences = guild.presences.filter((presence) => {
        switch(presence.status){
          case "offline":
            invis++;
          break;

          case "online":
            online++;
            available++;
          break;

          case "idle":
            idle++;
            available++;
          break;

          case "dnd":
            dnd++;
            available++;
          break;
        }
        return true;
      });

      let textC = 0, voiceC = 0, tC = 0, nsfw = 0;
      let channels = guild.channels.filter((c) => {
        if(c.type=="text") textC++;
        else if(c.type=="voice") voiceC++;
        tC++;
        if(c.nsfw) nsfw++;
        return true;
      });

      let vInfo = 'there is no verification requirement.';
      let vLvl = guild.verificationLevel;
      if (vLvl >= 1) vInfo = "new users must have an email linked to their account. ";
      if (vLvl >= 2) vInfo+= "They must also be registered on Discord for more than five minutes. ";
      if (vLvl >= 3) vInfo+= "In addition, upon joining, new members must wait 10 minutes before they are able to speak. ";

      let gname = guild.name.replace('@','(at)');
      if (guild.iconURL&&guild.iconURL(2048)) infobad.setImage(guild.iconURL(2048));
      infobad.addField(`Name of this server: ${gname}`, `Guild id: ${guild.id}`);
      infobad.addField(`Server owner: `, `<@${guild.ownerID}>`);
      infobad.addField(`Total number of channels: ${tC}`, `Total number of nsfw channels: ${nsfw}`);
      infobad.addField(`Text channel count:    `, textC       , true)
             .addField(`Voice channel count:   `, voiceC      , true)
             .addField(`Server region (voice): `, guild.region, true);
      infobad.addField(`Default channel: `,`<#${guild.defaultChannel.id}>`, true);
      if(guild.afkChannelID) infobad.addField(`AFK voice channel: #${guild.channels.get(guild.afkChannelID).name}`, `AFK Timeout: ${guild.afkTimeout/60} minute(s)`, true);
      else infobad.addField(`AFK voice channel: `, `None`, true);
      infobad.addField(`Date created: ${guild.createdAt.toUTCString()}`, `That's about ${diff} days ago!`);
      infobad.addField(`Member count: `, guild.memberCount, true);
      infobad.addField(`Total number of members: ${trueMemC.size} (Not including bots)`,`There are ${guild.members.size-trueMemC.size} bots!`, true);
      infobad.addField(`Reachable members (online, idle or dnd): available`, `There are <:vpOffline:212790005943369728> ${invis} people offline or invisible`);
      infobad.addField(`Online: <:vpOnline:212789758110334977>`, online, true)
             .addField(`Idle: <:vpAway:212789859071426561>    `, idle  , true)
             .addField(`Dnd: <:vpDnD:236744731088912384>      `, dnd   , true);
      infobad.addField(`Verification level: ${vLvl}`,`That means ${vInfo}`);
      await reply(`Server info`, {embed: infobad});
      infobad = new Discord.RichEmbed();
      infobad.setColor(member.displayColor).setAuthor('Server Emojis').setTitle(`Emoji count: ${guild.emojis.size}`).setDescription(guild.emojis.array().join(' '));
      return reply("Emoji List", {embed: infobad});
    }else if(action=="user"){
      let member=used;
      let membername = member.displayName.replace('@','(at)');
      if (args[1]){
        try{
          let info = await permissions.checkPermission(msg, ex.perm[5]);
          console.log("[Command] "+ info);
        }catch(err){
          if(!member.hasPermission(ex.customperm[0])){
            console.log("Rejected info user to " + used.id);
            return msg.reply(err);
          }
        }

        try{ //get mention:
          console.log("Trying to find user by mention..");
          let target = args[1].match(Constants.patterns.MENTION)[1];
          member = gMember(target);
          if(member==null) throw "NotMemberMention";
        }catch(err){  //gMember failed:
          console.log("Finding by mention failed...");
          member = content.substring(`${prefix}info ${action} `.length);
          let list = searchers[guild.id].searchMember(member);
          if(list.length>1) await send("Multiple matches found, using first one..");
          else if(list.length<1) return await send(`User [${args[1]}] not found!`);
          member = list[0];
        }
        membername = member.displayName.replace('@','(at)');
        let highest = "years";
        diff = memberJoin(member,time.indexOf(highest));
        diff = `${diff[0]} ${time[diff[1]]}`;

        let diff2;
        highest = "years";
        if(member.lastMessage){
          diff2 = lastSeen(member,time.indexOf(highest));
          //send("diff2-1: " + diff2);
          diff2 = `${diff2[0]} ${time[diff2[1]]}`;
          //send("diff2-2: " + diff2);
        }else diff2="NAN";

        let diff3;
        highest = "years";
        diff3 = joinedDiscord(member, time.indexOf(highest));
        diff3 = `${diff3[0]} ${time[diff3[1]]}`;

        infobad.addField(`User tag: `, `${member.user.tag}`   , true)
               .addField(`User id:  `, `${member.id}`         , true)
               .addField(`Nickname: `, `${membername}`, true);
        infobad.addField(`Joined Discord on ${member.user.createdAt.toUTCString()}`,`That's about ${diff3} ago!`);
        infobad.addField(`Joined the server on: ${member.joinedAt.toUTCString()}`,`That's about ${diff} ago!`);
        infobad.addField(`${member.lastMessage?"Last seen here at: "+member.lastMessage.createdAt.toUTCString():"Last seen here: Unknown"}`,`${diff2!="NAN"?"That's about "+diff2+" ago!":"Time ago: Unknown"}`);
        infobad.addField(`Colour: `,`${member.displayHexColor}`,true)
               .addField(`Highest Role: ${member.highestRole.name}`,`Total number of roles: ${member.roles.size}`, true)
               .addField(`Status:`,`    ${member.presence.status}`, true);
        infobad.addField(`Permissions number:`,member.permissions.bitfield);
        infobad.addField(`Avatar URL`, `[Click Here](${member.user.avatarURL(2048)})`);
        infobad.setImage(member.user.avatarURL(2048));
        return await send(`User info`, {embed: infobad});
      }else{
        try{
          let info = await permissions.checkPermission(msg, ex.perm[6]);
          console.log("[Command] "+ info);
        }catch(err){
          if(!member.hasPermission(ex.customperm[0])){
            console.log("Rejected info user (self) to " + used.id);
            return msg.reply(err);
          }
      }
        let highest = "years";
        diff = memberJoin(member,time.indexOf(highest));
        diff = `${diff[0]} ${time[diff[1]]}`;

        let diff2;
        highest = "years";
        if(member.lastMessage){
          diff2 = lastSeen(member,time.indexOf(highest));
          //send("diff2-1: " + diff2);
          diff2 = `${diff2[0]} ${time[diff2[1]]}`;
          //send("diff2-2: " + diff2);
        }else diff2="NAN";

        let diff3;
        highest = "years";
        diff3 = joinedDiscord(member, time.indexOf(highest));
        diff3 = `${diff3[0]} ${time[diff3[1]]}`;
        infobad.addField(`User tag: `, `${member.user.tag}`   , true)
               .addField(`User id:  `, `${member.id}`         , true)
               .addField(`Nickname: `, `${membername}`, true);
        infobad.addField(`Joined Discord on ${member.user.createdAt.toUTCString()}`,`That's about ${diff3} ago!`);
        infobad.addField(`Joined the server on: ${member.joinedAt.toUTCString()}`,`That's about ${diff} ago!`);
        infobad.addField(`${member.lastMessage?"Last seen here at: "+member.lastMessage.createdAt.toUTCString():"Last seen here: Unknown"}`,`${diff2!="NAN"?"That's about "+diff2+" ago!":"Time ago: Unknown"}`);
        infobad.addField(`Colour: `,`${member.displayHexColor}`,true)
               .addField(`Highest Role: ${member.highestRole.name}`,`Total number of roles: ${member.roles.size}`, true)
               .addField(`Status:`,`    ${member.presence.status}`, true);
        infobad.addField(`Permissions number:`,member.permissions.bitfield);
        infobad.addField(`Avatar URL`, `[Click Here](${member.user.avatarURL(2048)})`);
        infobad.setImage(member.user.avatarURL(2048));
        return await send(`User info`, {embed: infobad});
      }
    }else if(action == "role"){
      try{
        let info = await permissions.checkPermission(msg, ex.perm[4]);
        console.log("[Command] "+ info);
      }catch(err){
        if(!member.hasPermission(ex.customperm[0])){
          console.log("Rejected info role to " + used.id);
          return msg.reply(err);
        }
      }

      if (!args[1]) return send("No role given :<");
      else{
        let role;
        try{
          role = args[1].substring(3,args[1].length-1);
          console.log("Trying to find role from mention " + role);
          role = guild.roles.get(role);
          if(role==null) throw "NotRoleId";
        }catch(err){  //failed to find by id
          role = content.substring(`${prefix}info ${action} `.length);
          let list = searchers[guild.id].searchRole(role);
          if(list.length>1) await send("Multiple matches found, using first one..");
          else if(list.length<1) return await send(`Role [${args[1]}] not found!`);
          role = list[0];
        }
        let rolename = role.name.replace('@','(at)');
        return await send(`Role Id: ${role.id}\nRole Name: ${rolename}\nMember count: ${role.members.size}`);
      }
    }else if(action == "channel"){
      try{
        let info = await permissions.checkPermission(msg, ex.perm[3]);
        console.log("[Command] "+ info);
      }catch(err){
        if(!member.hasPermission(ex.customperm[0])){
          console.log("Rejected info channel to " + used.id);
          return msg.reply(err);
        }
      }
      if (!args[1]) return send("No channel given :<");
      else{
        let channel;
        try{
          channel = args[1].substring(2,args[1].length-1);
          console.log("Trying to find channel from link " + channel);
          channel = guild.roles.get(role);
          if(channel==null) throw "NotChannelId";
        }catch(err){
          let list = searchers[guild.id].searchChannel(channel);
          if(list.length>1) {await send("Multiple matches found, using first one.."); console.log(list);}
          else if(list.length<1) return await send(`Channel [${channel}] not found!`);
          channel = list[0];
        }
        let cname = channel.name.replace('@','(at)');
        return await send(`Channel Id: ${channel.id}\nChannel Name: ${cname}\nMember count: ${channel.members.size}`);
      }
    }
  }
};

module.exports = ex;
