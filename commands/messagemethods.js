module.exports = [
  {
    name: "delete",
    description: "Deletes a message",
    syntax: "messageobj",
    function: function(msg){
      return msg.delete()
    },
    permission: 2,
  },
  {
    name: "clearreactions",
    description: "Removes all reactions from a message.",
    syntax: "messageobj",
    function: function(msg){
      return msg.reactions.removeAll()
    },
    permission: 2,
  },
  {
    name: "bulkdelete purge prune",
    description: "Purges messages and stuff",
    syntax: "num channel?",
    function: function(num, channelobj){
      const channel = (channelobj || this.Data.message.channel);
      /*
      if (this.Arguments.user) {
        this.cast(this.Arguments.user, "user");
      }
      */
      num = parseInt(num);
      return channel.bulkDelete(num)
    },
    permission: 3,
  }
]