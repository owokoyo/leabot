module.exports = (user, message, idresult)=>{
if (parseInt(user)) {
    if (idresult) {
      return user;
    }
    return message.guild.members.fetch(user)
  } else if (typeof user === "string") {
    const id = /^\<@\!?(\d+)\>$/.exec(user)
    if (idresult){
      return id[1];
    }
    return Promise.resolve(message.mentions.users.get(id[1]));
  } else {
    if (idresult){
      return user.id
    }
    return message.guild.members.fetch(user.id)
  }
}