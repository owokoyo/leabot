const last = {}

module.exports =  shared=>[
  {
    name: "recommend",
    description: "Post your recommendations to #recommendations.",
    syntax: "",
    function: async function(message, user){
        const time = Date.now()-(last[this.Data.message.author.id] || 0);
        if (time<3600000 && !this.Data.CheckPermission(this.Data.message.author, 2)) {
          this.Data.message.channel.send(`You must wait ${3600-Math.round(time/1000)} seconds before sending another recommendation.`)
          return;
        };
        if (this.Data.message.channel.id != "792329462599122944") {
          this.Data.message.channel.send(`Make sure to use submit-recommendations for submissions.`)
          return;
        };
        const channel = await this.Data.message.guild.channels.cache.get("773052032151715846");
        let u;
        if (user && this.Data.CheckPermission(this.Data.message.author, 2)) {
          u = await shared.getUser(user, this.Data.message);
        }
        const msgobj = await channel.send({
          "embed": {
            "title": "Discord Recommendation",
            "description": message,
            "color": 4261792,
            "fields":[
              {
              "name":"Suggestion by",
              "value":u || this.Data.message.author,
              }
            ],
            "footer": {
              "icon_url": "https://cdn.discordapp.com/avatars/785436366410481695/e5d1bc012ed48465a244a719d05f1c23.webp?size=256",
              "text": "Suggestion made with Lea"
            }
          }
        })
        last[this.Data.message.author.id] = Date.now();
        await msgobj.react("👍");
        await msgobj.react("👎");
    },
    permission: 0,
  }
]