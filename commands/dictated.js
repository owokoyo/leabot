module.exports = [
  {
    name: "send echo repeat say",
    description: "Sends a message",
    syntax: "message channel=channel?",
    function: function(msg, channelobj){
      const channel = this.cast("channel", this.Arguments.channel || channelobj || this.channel)
      return channel.send(msg)
    },
    permission: 1,
  },
  {
    name: "ping test",
    description: "Replies with \"pong\"",
    syntax: "",
    function: function(){
      return this.channel.send("pong")
    },
    permission: 1,
  },
  {
    name: "reply",
    description: "Replys to message",
    syntax: "message messageobj",
    function: function(msg, msgobj){
      return msgobj.reply(msg)
    },
    async: true,
    permission: 1,
  },
  {
    name: "react",
    description: "React to message.",
    syntax: "emoji messageobj",
    function: function(emoji, msgobj){
      return msgobj.react(emoji)
    },
    async: true,
    permission: 1,
  },
]