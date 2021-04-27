module.exports =  [
  {
    name: "flags.enable",
    description: "enables a flag by setting it to true, must be a boolean",
    syntax: "flag",
    function: function(flag){
      if (this.opts.flags.set(flag, "boolean", true, this.author)) {
        this.message.react("✅")
      }
    },
    permission: 3,
  },
  {
    name: "flags.disable",
    description: "disables a flag by setting it to false, must be a boolean",
    syntax: "flag",
    function: function(flag){
      if (this.opts.flags.set(flag, "boolean", false, this.author)) {
        this.message.react("✅")
      }
    },
    permission: 3,
  },
]