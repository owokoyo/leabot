module.exports = function(channel, auser, pages){
    return new Promise((res,rej)=>{
      let page = 0;
  
      var embed = {}
      embed.footer = {text:`Page (${page+1}/${pages.length})`}
      Object.assign(embed, pages[page])
      channel.send({embed:embed}).then(async message=>{
        const filter = (reaction, user) => user===auser&&["⬅️", "➡️", "🚫"].indexOf(reaction.emoji.name)!=-1;
  
        await message.react("⬅️")
        await message.react("➡️")
        await message.react("🚫")
  
        res(message)
  
        var end = function(){
          message.reactions.cache.get("⬅️").remove()
          message.reactions.cache.get("➡️").remove()
          message.reactions.cache.get("🚫").remove()
        }
  
        let collector = message.createReactionCollector(filter, { time: 120000 });
        collector.on('collect', (reaction, user) => {
          let users = reaction.users
          users.remove(user)
          var lastpage = page;
          if (reaction.emoji.name === "⬅️") {
            page=Math.max(0, page-1);
          } else if (reaction.emoji.name==="➡️"){
            page=Math.min(pages.length-1, page+1);
          } else {
            collector.stop()
            end()
          }
          if (lastpage!=page) {
            var embed2 = {}
            embed2.footer = {text:`Page (${page+1}/${pages.length})`}
            Object.assign(embed2, pages[page])
            message.edit({embed:embed2})
          }
        });
        collector.on('end', collected => end);
      }).catch(e=>{
        throw new Error(e)
      })
    })
  }