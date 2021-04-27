const assert = require("assert");
module.exports =  [
  {
    name: "kick",
    description: "Kicks a user",
    syntax: "user reason?",
    function: async function(user){
      const target = await this.cast("user", user);
      assert(this.Data.CheckPermission(this.Data.message.author, target, true), "You need to be cooler.")
      assert(target.kick, "Can't kick soz (prob missing perms)")
      return target.kick({
        reason: reason || "No reason specified",
      })
    },
    permission: 3,
  },
  {
    name: "ban",
    description: "Bans user with optional reason",
    syntax: "user reason?",
    function: async function(user, reason){
      const target = await this.cast("user", user);
      assert(this.Data.CheckPermission(this.Data.message.author, target, true), "You need to be cooler.")
      assert(target.ban, "Can't ban soz (prob missing perms)")
      return target.ban({
        reason: reason || "No reason specified",
      })
    },
    permission: 4,
  },
  {
    name: "nick",
    description: "Sets nickname",
    syntax: "nickname user? reason?",
    function: async function(nick){
        const target = await this.cast("user", this.Arguments.user || this.Data.message.author);
        assert(target.setNickname, "Can't set nickname soz (prob missing perms)")
        return target.setNickname(nick, this.Arguments.reason || "No reason specified")
    },
    permission: 2,
  },
  {
    name: "copy",
    description: "Copies user",
    syntax: "user",
    permission: 3,
    function: async function(){
      const custom = {

      }
      const target = await this.cast("user", this.Arguments.user || this.Data.message.author);
      this.opts.userlatch[target.id] = this.opts.userlatch[target.id] || [];
      this.opts.userlatch[target.id].push({
        expired: ()=>false,
        func: (msg)=>{
          let content = msg.content;
          if (custom[content]) {
            content = custom[content];
          }

          msg.channel.send(content);
          return true;
        },
        type: "copy",
      });
    }
  },
  {
    name: "copy.stop",
    description: "Stops Copying user",
    syntax: "user",
    permission: 3,
    function: async function(){
      const target = await this.cast("user", this.Arguments.user || this.Data.message.author);
      if (this.opts.userlatch[target.id]){
        this.opts.userlatch[target.id] = this.opts.userlatch[target.id].filter(e=>e.type!="copy");
      }

    }
  }
]