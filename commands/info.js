module.exports = [
  {
    name: "help",
    description: "Brings up help menu.",
    syntax: "",
    function: function(){
      return this.navpage([
        {
          title: "Syntax - Commands",
          description: `
**Lea is a bot with a parser that allows for both simple and complex commands.**

Commands follow this syntax: lea [command]
Ex: \`lea ping\` - Replies "pong"
Ex: \`lea help\` - Help menu

Commands can have arguments as well, separated by spaces.
Ex: \`lea send hello\` - Sends "hello"
Ex: \`lea kick @user trolling\` - Kicks user with "trolling" as reason

For arguments that have spaces in them, you can surround them in quotes. Quotes can be escaped using backslash.
Ex: \`lea send "hello world"\` - Sends "hello world"
Ex: \`lea send "I said \\"Hello\\""\` - Sends 'I said "Hello"'.

Commands can be chained using newlines or semicolon.
Ex:
\`lea send start\`
\`send hi\`
\`send end\` - Sends "start", "hi", "end" in order. *Keep in mind this is all one message.*

You can run commands as an argument and get the result using brackets {}.
Ex: \`lea send {this.content}\` - Runs "this.content" command, and sends the result. Basically sends "lea send {this.content}"

Ex: \`lea send {this.content} {this.channel}\` - Redundant command; Runs "this.content" command, and sends the result in a channel of "this.channel" command's result. Basically sends "lea send {this.content} {this.channel}".

Ex: \`lea send {content {this.message}}\` - Sends the content of the result of "this.message". "content {this.message}" is equivalent to "this.content".

Ex: \`lea delete {this.message}\` - Deletes the user's message.
`
        },
        {
          title: "Syntax - Special Stuff",
          description: `
Functions can be created by placing a "@" in front of brackets. They are treated as a value.
Ex: \`lea loop @{send "hello wold"} 10\` - Sends "hello world" 10 times.

Values can be stored in variables using the equals sign. Variables can be retrieved using the "$" sign.
Ex:
\`lea a=3\`
\`send $a+2\` - Sends "5".

Ex:
\`lea hello = @{send hello}\`
\`hello\` Sends "hello".

Arguments passed to functions can be used with "&" followed by the argument's index. Numerical arguments are zero-indexed.
Ex:
\`lea welcome = @{send "welcome, "..&0.. " and "..&1}\`
\`welcome @user1 @user2\` Sends "welcome, @user1 and user2".

Named/Keyword arguments are similar to assignments. They can be retrieved with "&" followed by the argument name.
Ex:
\`lea welcome = @{send "welcome, "..&user}\`
\`welcome user=@user1\` Sends "welcome, @user1".


Math can be performed using operators. (Order of operations applies) 
\`*\` - Multiplies left and right values.
\`+\` - Adds L and R values.
\`-\` - Subtracts L and R values.
\`/\` - Divides L and R values.
\`,\` - Creates a list; Useless currently.
\`..\` - Concatenates L and R values..
Ex: \`lea send 5*7+1\` - sends "36"
Ex: \`lea send 5*(7+1)\` - sends "40"
Ex: \`lea send yes..no\` - sends "yesno"
          `
        }
      ])
    },
    permission: 0,
  },
]