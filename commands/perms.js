module.exports = [
  {
    name: "setperm",
    description: "Changes permission value of user.",
    syntax: "setperm user rank",
    function: function(user, rank){
      rank = parseInt(rank)
      user = this.cast("userId", user);
      if (this.Data.CheckPermission(this.user, user, "greater") && this.Data.CheckPermission(this.user, rank, "greater")) {
        if (rank>0) {
          this.opts.permissions[user] = rank;
        } else {
          delete this.opts.permissions[user];
        }
      } else {
        throw new Error("u cant do that lmao")
      }
    },
    permission: 2,
  },
  {
    name: "getperm",
    description: "Returns the permission number of a user",
    syntax: "getperm user",
    function: function(user){
      user = this.cast("userId", user);
      return this.opts.permissions[user];
    },
    permission: 1,
  },
  {
    name: "listadmins",
    description: "Shows a list of admins",
    syntax: "",
    function: function(context){
      const permissionsByPerm = {}
      for (let id in this.opts.permissions) {
        let r = this.opts.permissions[id];
        if (!permissionsByPerm[r]) {
          permissionsByPerm[r] = ""
        }
        permissionsByPerm[r]+=`<@${id}>\t`;
      }
      const embeds = this.shared.transformField(permissionsByPerm, pair=>{
        
      });
      embeds.forEach(embed=>{embed.title="List of Admins";embed.type = "rich";embed.fields.sort(r=>-parseInt(r.name))});
      return this.shared.navpage(this.channel, this.user, embeds)
    },
    permission: 0,
  },
]