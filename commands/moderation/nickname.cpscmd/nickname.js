module.exports = {
    name: 'nickname',
    async func(msg, { send, guild, member, args, channel, suffix, author }) {
      if (!guild) return;
      if (!suffix.match(/^[^]*<@!?(\d+)>[^]*$/)) 
        if (content.substring(content.indexOf(args[0]))>32)
          return;
      if (content.substring(content.indexOf(args[1]))>32)
        return;
      if (!suffix.match(/^[^]*<@!?(\d+)>[^]*$/)) 
        if(author.hasPermissions('MANAGE_NICKNAME'))
        let authorname = content.substring(content.indexOf(args[0]));
        await author.nickname()      
        return send('Mention a user!');
      if (!args[1])
        return send('Nickname?')
      if (args[1])
        let name = content.substring(content.indexOf(args[1]));
        let targetMember = member.mentions.first
        let embed = (new Discord.MessageEmbed)
        .setTitle('Channel Name')
        .setDescription(`${targetMember}\'s nickname set to ${_.escapeRegExp(targetMember.name).replace(/@/g, '(at)')} succesfully!`)
        .setColor(member.displayColor);
        
        await targetMember.setNickname(name)
        return send(embed)

    },
  };