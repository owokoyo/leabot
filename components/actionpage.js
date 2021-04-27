module.exports = function (channel, auser, msg, reactions){
    return new Promise(async (res, rej)=>{
      const messageobj = await channel.send(msg)
      res(messageobj)
      const filter = (reaction, user) => (!auser || auser===auser)&&reactions[reaction.emoji.name];
      for (const reaction in reactions) {
        await messageobj.react(reaction)
      }
      var end = function(){
        for (const emoji in reactions){
        message.reactions.cache.get(emoji).remove()
        }
      }
  
      let collector = message.createReactionCollector(filter, { time: 60000 });
      collector.on('collect', (reaction, user) => {
        let users = reaction.users
        users.remove(user)
        let nt = reactions[reaction.emoji.name](message, user)
        if (nt){
          messageobj.edit(nt)
        }
  
      });
  
      collector.on('end', collected => end);
  
    })
  }