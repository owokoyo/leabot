function getUser(user, message, idresult){
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
        return Promise.resolve(message.mentions.users.get(id[1])).then(u=>message.guild.members.fetch(u));
    } else {
        if (idresult){
            return user.id
        }
        return message.guild.members.fetch(user.id)
    }
}

module.exports = {
    channel: function(channel){
        if (parseInt(channel)) {
            return this.guild.channels.cache.get(channel);
        } else if (typeof channel === "string") {
            const id = /^\<#(\d+)\>$/.exec(channel)
            return this.message.mentions.channels.get(id[1])
        } else {
            return channel;
        }
    },
    userId: function(user){
        return getUser(user, this.message, true)
    },
    user: function(user){
        return getUser(user, this.message)
    },
}