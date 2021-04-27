module.exports =  [
  {
    name: "roles.remove",
    description: "Removes a role",
    syntax: "role user?",
    function: async function(role, user){
      role = this.guild.roles.cache.find(r=>r.name===role)
      user = await this.cast("user", user || this.user);
      return user.roles.remove(role);
    },
    permission: 4,
  },
  {
    name: "roles.add",
    description: "Adds a role",
    syntax: "role user?",
    function: async function(role, user){
      role = this.guild.roles.cache.find(r=>r.name===role)
      user = await this.cast("user", user || this.user);
      console.log(user)
      return user.roles.add(role);
    },
    permission: 4,
  },
]