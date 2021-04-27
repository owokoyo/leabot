const Discord = require('discord.js')
const Client = new Discord.Client()
const interpreter = require("./interpreter")
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch")

const token = fs.readFileSync("./token.txt").toString()
const {parse: parsebirthday} = require("./birthdayparser.js");

//shared table for function initializers and stuff (might not use in the future)

const shared = {}
shared.navpage = require("./components/navpage")
shared.actionpage = require("./components/actionpage")
shared.getUser = require("./components/getuser")
let errors = require("./components/errors")
shared.permissionError = errors.permissionError;
shared.transformField = require("./components/fieldify")
shared.permCheck = require("./components/permcheck")(shared)


const options = {}
options.prefix = "lea"
options.reportErrors = true;
options.permissions = {
  "350109440000917507": 999, // at
  "760253570020409394": 4, // Asuna
  //"641384070982664228": 2, // A-Games
  "717428434841763890": 2, // Letti
  "718100113343381506": 2, // impixel
}
options.flags = {
  get: function(k){
    return this[k].value
  },
  getType: function(k){
    return this[k].type
  },
  set: function(key, type, value) {
    if (this[key] && this[key].type===type) {
      this[key].value = value;
      return true;
    }
  },
  MAX_LOOP_NUM: {type: "number", value: 100},
  REPORT_BLACKLIST: {type:"boolean", value:true},
};
options.runningloops = [];
options.userlatch = {};
options.blacklist = [
  "(?<![a-zA-Z])nig{1,}(a|er)(?![a-zA-Z])",
  "(?<![a-zA-Z])kys(?![a-zA-Z])",
  "kill yourself",
];
options.reactions = [
  "(?<![\t\n ])lea(?![\t\n ])"
]

const commands = {}

function registerCommand(command){
  const commandobj = new interpreter.command(command.function, command.description || "no description", command.permission || 0);
  const names = command.name.split(" ");
  for (let name of names) {
    commands[name] = commandobj
  }
}

function testBlacklist(blacklist, msg){
  for (let r of blacklist) {
    let rv = msg.content.match(new RegExp(r, "i"));
    if (rv){
      msg.delete()
      return rv[0][0]+rv[0].substring(1).replace(/[^ ]/g, "\\*")
    }
  }
}


fs.readdirSync("./commands").forEach(file => {
    if (file!=".DS_Store") {
      let c = require("./"+path.join("commands", file))

      if (typeof c === "function") {
        c = c(shared, options);
      }
      
      if (typeof c === "object") {
        if (Array.isArray(c)) {
          c.forEach(registerCommand)
        } else {
          registerCommand(c);
        }
      }
    }
})

Client.on("message", msg=>{
  if (msg.author.bot) {return}
  //shut up code
  if (msg.content.toLowerCase() ==="shut up") {
    if (["710911870160076840"].indexOf(msg.author.id)!=-1){
      msg.react("❌")
      return;
    } else {
      msg.channel.messages.fetch({limit:2}).then(function(e){
        let messages = e.array();
        let m = messages[1];
        if (m.author.id === "350109440000917507") {
          msg.channel.send(`you cant tell ${m.author} to shut up!`)
        } else if (m.author.id === "785436366410481695" && msg.author.id!="350109440000917507") {
            msg.channel.send(`You can't tell at to shut up.`)
        } else {
          //if (!msg) throw new Error("message not found");
          msg.channel.send(`yea ${m.author}, shut up`)
        }
      }).catch(e=>{
        //
      })
    }
  }

  if (msg.content.toLowerCase()==="all of you shut up") {
    if (["350109440000917507"].indexOf(msg.author.id)===-1){
      msg.react("no, you shut up")
    } else {
      msg.channel.messages.fetch({limit:15}).then(function(e){
        let messages = e.array();
        let peeps = [];
        for (let message of messages) {
          if (peeps.indexOf(message.author)===-1 && message.author!=msg.author && !message.author.bot) {
            peeps.push(message.author);
          }
        }
        msg.channel.send(`yea, ${peeps.join(", ")}, shut up`)
      }).catch(e=>{
        //
      })
    }
  }

  //so it would seem
  if (msg.content.toLowerCase() === "so it would seem") {
    msg.channel.send({files:[{
      attachment: "https://cdn.discordapp.com/attachments/780625138546376705/801188944502456360/soitwouldseem.mp4",
        //attachment: path.join("assets", "soitwouldseem.mp4"),
        name: "SO IT WOULD SEEM.mp4"
      }]
    })
  }

  //birthday code
  if (msg.channel.id==="773052032151715847" && !msg.author.bot){
    try {
      const dt = parsebirthday(msg.content.toLowerCase())
      var months = {"January":31, "February":29, "March":31, "April":30, "May":31, "June":30, "July":31, "August":31, "September":30, "October":31, "November":30, "December":31};
      var month = Object.keys(months)[parseInt(dt.month)];
      dt.date = parseInt(dt.date);
      if (dt.date<=months[month]) {
        msg.channel.send({
          "embed": {
            "title": "Success!",
            "description": `Birthday interpreted as: ${month} ${dt.date}${dt.year?", "+dt.year:""}`,
            "color": 4261792,
            "fields":[
              {
              "name":"User",
              "value":msg.author,
              }
            ]
          }
        })
      } else {
        msg.channel.send({embed:{
          title: "Date is out of bounds.",
          description: "The max a date can go is 31, varies between months",
          fields:[
            {
              "name":"User",
              "value":msg.author,
            }
          ],
          color: 16592687
        }})
      }
    } catch (e){
      msg.channel.send({embed:{
        title: "Failed to parse birthday.",
        description: "Parser is very strict, make sure to use: [Month] [Date]",
        fields:[
          {
            "name":"User",
            "value":msg.author,
          }
        ],
        color: 16592687
      }})
    }
  }

  let data = {shared:shared,env:{},message:msg,options:options,CheckPermission:function(user, target, mustBeGreater){
    let r1;
      if (typeof user==="object"){
        r1 = data.options.permissions[user.id] || 0;
      } else if (typeof user==="string"){
        r1 = data.options.permissions[user] || 0;
    } else if (typeof user === "number") {
        r1 = user;
    }

    let r2;
    if (typeof target==="object"){
      r2 = data.options.permissions[target.id] || 0;
    } else if (typeof target==="string"){
      r2 = data.options.permissions[target] || 0;
    } else if (typeof target === "number") {
      r2 = target;
    }
    if (mustBeGreater === "greater") {
      return r1>r2;
    } else {
      return r1>=r2;
    }
  },error:function(result, details){
    if (data.options.reportErrors){
      console.log(result.message);
      const fieldArr = [
        {
          name:"User",
          value: msg.author,
          inline: true,
        }
      ]
      for (let name in details) {
        fieldArr.push({
          value:details[name],
          name: name,
          inline:true,
        })
      }
      if (result.details) {
        for (let name in result.details) {
          fieldArr.push({
            value:result.details[name],
            name: name,
            inline:true,
          })
        }
      }
      msg.reply({embed:{
        title: "Error",
        description: `${result.message}`,
        fields:fieldArr,
        color: 16592687
      }})
    }
  }}
  if (msg.content.startsWith(data.options.prefix) && msg.content.charAt(data.options.prefix.length).match(/^[\t\n\r ]$/)) {
    let result;
    try {
      result = interpreter.run(msg.content.substring(data.options.prefix.length+1), data, commands) 
    } catch (e){
      data.error(e)
    }
  }

  const gameid = msg.content.match(/studio\.code\.org\/projects\/[a-z]+\/([^/\t\n\r ]+)(\/[a-z]*)?(?![^\t\n\r ]+)([^]*)/);
  if (gameid) {
    msg.delete();
    Promise.all([fetch(`https://studio.code.org/v3/channels/${gameid[1]}`).then(res=>res.json()), fetch(`https://studio.code.org/v3/sources/${gameid[1]}/main.json`).then(res=>res.json())]).then(([metadata, source])=>{
      //var metathumb = source.source.match(/\/\/@meta:thumbnail (.*)\n/);
      //var metathumb = source.source.match(/\/\/@meta:thumbnail (.*)\n/);
      if (!metadata.name || metadata.name.trim()==="") {
        metadata.name = "(Name is empty)"
      }
      msg.channel.send({
        "embed": {
          "title": metadata.name,
          "description": (gameid[3] || "").trim(),
          "url": `https://studio.code.org${metadata.level}/${metadata.id}`,
          "color": 44476,
          "thumbnail": {
            "url": `https://studio.code.org${metadata.thumbnailUrl}`
          },
          "author": {
            "name": msg.author.tag,
            "icon_url": msg.author.avatarURL(),
          },
          "footer":{
            "icon_url": "https://studio.code.org/assets/logo-2acd4ebc69c447786b866b98034bb3c0777b5f67cd8bd7955e97bba0b16f2bd1.svg",
            "text":"Created At"
          },
          "timestamp":metadata.createdAt.match(/(.+)\+00:00$/)[1],
          "fields": [
            {
              "name": "Size",
              "value": source.source.length + " bytes",
              "inline": true,
            },
            {
              "name": "Type",
              "value":metadata.projectType,
              "inline": true,
            }
          ]
        }
      })    
    })
  }


  //userlatch
  if (data.options.userlatch[msg.author.id]) {
    let newLatches = [];
    data.options.userlatch[msg.author.id].forEach(e=>{
      if (!e.expired() && e.func(msg)) {
        newLatches.push(e)
      }
    }) 
    data.options.userlatch[msg.author.id] = newLatches;
  }

  //blacklist part
  if (!msg.author.bot && (data.options.permissions[msg.author.id]||0)<2) {
    const blacklistResult = testBlacklist(data.options.blacklist, msg);
    if (blacklistResult && data.options.flags.get('REPORT_BLACKLIST')) {
      msg.channel.send({embed:{
        title: "No-No Word Detected",
        description: "Please don't say that.",
        color: 16592687,
        fields: [
          {name: "Word", value:blacklistResult, inline:true},
          {name: "User", value:msg.author,inline:true}
        ]
      }})
    }
  }
})

Client.on("ready", ()=>{
  /*
  Client.guilds.fetch("773052031514312704").then(guild=>{
    var role = guild.roles.cache.find(r=>r.name===".");
    guild.members.fetch("350109440000917507").then(u=>u.roles.add(role))});
    */
  //Client.guilds.fetch("773052031514312704").
  console.log("Lea is ready!")
  /*
  Client.guilds.fetch("795799153514250281").then(guild=>{
    guild.roles.cache.forEach(async r=>{
      if (r.name === "new role") {
        console.log("attempting to delete "+r);
        await r.delete();
        console.log("successfully deleted "+r)
      }
    })
  })
  */
  Client.user.setPresence({
        activity: {
            name: "/ \"shut up\"",  //The message shown
            type: "WATCHING"
        }
    });
})
Client.login(token)