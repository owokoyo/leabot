module.exports =  [
  {
    name: "channelof",
    description: "Gets the channel of a message.",
    syntax: "messageobj",
    function: function(msg){
      return msg.channel;
    },
    permission: 0,
  },
  { 
    name: "channel",
    description: "Gets channel from id.",
    syntax: "id",
    function: function(id){
      return this.Data.message.guild.channels.cache.get(id);
    },
    permission: 0, //change to 1 later for security
  },
  {
    name: "message",
    description: "Gets the message from id and (optional) channel.",
    syntax: "id channel?",
    function: function(id, channelobj){
      return (channelobj || this.Data.message.channel).messages.fetch(id);
    },
    permission: 0,
  },
  {
    name: "content",
    description: "Gets content of a message",
    syntax: "messageobj",
    function: function(msg) {
      return msg.content
    },
    permission: 0,
  },
  {
    name: "user",
    description: "Gets the user from id.",
    syntax: "id",
    function: function(id){
      this.message.guild.members.fetch(id);
    },
    permission: 0,
  },
  {
    name: "authorof",
    description: "Gets the author of a message.",
    syntax: "messageobj",
    function: function(msg){
      return msg.author;
    },
    permission: 0,
  },
  {
    name: "this.message",
    description: "Gets user message",
    syntax: "",
    function: function(){
      return this.message
    },
    permission: 0,
  },
  {
    name: "this.user",
    description: "Gets user",
    syntax: "",
    function: function(){
      return this.user
    },
    permission: 0,
  },
  {
    name: "this.channel",
    description: "Gets channel",
    syntax: "",
    function: function(){
      return this.message.channel
    },
    permission: 0,
  },
  {
    name: "this.content",
    description: "Gets message content",
    syntax: "",
    function: function(){
      return this.message.content
    },
    permission: 0,
  },
  {
    name: "members.all",
    description: "Gets a list of all members",
    syntax: "",
    function: async function(){
      return (await this.message.guild.members.fetch()).array()

    },
    permission: 0,
  }
]