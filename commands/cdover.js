const fetch = require("node-fetch");
module.exports =  [
  {
    name: "cdoverify",
    description: "Verifies user for code.org",
    syntax: "code",
    function: function(code){
      if (code) {
        if (code.match(/g$/)) {
          fetch("https://app.owokoyo.com/cdover", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({
              user: {
                avatar: this.user.avatarURL,
                id: this.user.id,
                tag: this.user.tag,

              },
              code: code,
            })
          }).then(e=>e.text()).then(msg=>{
            this.respond({
              title: ""+msg,
            })
          })
        } else if (code.match(/a$/)) {
          console.log("heroku")
          fetch("https://owokoyoimg.herokuapp.com/cdover", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({
              user: {
                avatar: this.user.avatarURL,
                id: this.user.id,
                tag: this.user.tag,
              },
              code: code,
            })
          }).then(e=>e.text()).then(msg=>{
            this.respond({
              title: ""+msg,
            })
          })
        }
      }
    },
    permission: 0,
  }
]