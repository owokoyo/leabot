module.exports =  [
  {
    name: "blacklist.add",
    description: "Adds a keyword to the blacklist. Helps enforce a dictatorial server.",
    syntax: "keyword",
    function: function(keyword){
      if (keyword!=null) {
      this.opts.blacklist.push(keyword)
      }
    },
    permission: 3,
  },
  {
    name: "blacklist.remove",
    description: "Removes a keyword from the blacklist.",
    syntax: "keyword",
    function: function(keyword){
      this.opts.blacklist = this.opts.blacklist.filter(k=>k!=keyword)
    },
    permission: 3,
  },
  {
    name: "blacklist.removeindex",
    description: "Removes a keyword from the blacklist.",
    syntax: "index",
    function: function(i){
      const index = parseInt(i)
      if (isNaN(index)) {
        throw new Error(`"${i}" is not a valid index.`)
      }
      this.opts.blacklist.splice(index-1,1)
    },
    permission: 3,
  },
  {
    name: "blacklist.get",
    description: "Shows a list of blacklisted keywords.",
    syntax: "",
    function: function(){
      const embeds = this.shared.transformField(this.opts.blacklist);
      embeds.forEach(embed=>{embed.title="Blacklisted Keywords";embed.type = "rich"});
      return this.shared.navpage(this.message.channel, this.message.author, embeds)
    },
    permission: 1,
  },
]