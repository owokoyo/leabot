// v2index.js
// author - at#5005 / Ethan
// after parsing command to AST, it then uses the tree to run commands and stuff
const parser = require("./v2parser.js");
const assert = require("assert");
const CastingFunctions = require("./helpers/castingfunctions")

function Select(arr, num){
  return [...arr].splice(num)
}

const CoreCommands = {}
CoreCommands.wait = new Command(function(time){
  return new Promise(resolve=>setTimeout(resolve, parseInt(time)))
})
CoreCommands.print = new Command(async function(){
  console.log(this.Arguments)
});
CoreCommands.foreach = new Command(async function(command, list){
  for (const args of list) {
    if (command instanceof Command) { 
      await command.Run(this.Interpreter, args);
    } else {
      await this.RunCommand(command, args);
    }
  }
})

CoreCommands.return = new Command(function(){
  return this.Arguments[0];
})

CoreCommands.eval = CoreCommands.return;

CoreCommands.async = new Command(function(command){
  if (command instanceof Command) { 
    command.Run(this.Interpreter, Select(this.Arguments, 1));
  } else {
    this.RunCommand(command, Select(this.Arguments, 1));
  }
})
CoreCommands.killloops = new Command(function(user){
  var killedloops = 0;
  this.opts.runningloops = this.opts.runningloops.filter(function(inst){
    if (!inst.active) return false;
    if (this.Data.CheckPermission(this.user, inst.user)) {
      inst.active = false;
      killedloops++;
    } else {
      return true;
    }
  }.bind(this))
  this.respond({
    title: "Killed "+killedloops+" loop(s).",
    color: 9764641,
  })
});
CoreCommands.loop = new Command(async function(command, num){
  const loopNum = Math.min(this.opts.flags.get('MAX_LOOP_NUM'), parseInt(num));

  var ref = {user: this.user,active:true};
  this.opts.runningloops.push(ref);
  
  if (command instanceof Command) { 
    for (let i = 0; i<loopNum; i++) {
      if (!ref.active) break;
      await command.Run(this.Interpreter, Select(this.Arguments, 2));
    }
  } else {
    for (let i = 0; i<loopNum; i++) {
      if (!ref.active) break;
      await this.RunCommand(command, Select(this.Arguments, 2));
    }
  }
  ref.active = false;
}, "Runs a command multiple times", 2)

const Actions = {}
Actions.ResolveList = function(args){
  return Promise.all(args.map(function(a){
    return this.ResolveAmbiguous(a);  
  }.bind(this)))
}
Actions.ResolveCommand = async function(name, args){
  const named = {}
  const newArgs = (await Promise.all(args.map(function(a){
    if (a.type === "named") {
      named[a.name] = this.ResolveAmbiguous(a.arg) //note to self: please change {name,type,arg} to {name,type,value} for the love of god
      return null;
    }
    return this.ResolveAmbiguous(a);
  }.bind(this)))).filter(v=>v)

  //named will be full or promises so we handle that here? bad coding but dont care
  for (let narg in named) {
    newArgs[narg] = await named[narg];
  }

  return this.RunCommand(name, newArgs)
}
Actions.ResolveWrapper = function(value){
  return new Command(function(){
    return this.ResolveInstructions(value);
  })
}
Actions.ResolveVariable = function(variable){
  const result = variable.match(/([a-zA-Z0-9]+)(?:\:([a-z]+))?/);
  assert(result, "Failed to parse variable");
  let arg = this.Environment[result[1]]
  if (result[2]) {
    arg = this.cast(result[2], arg)
  }
  return arg;
}
Actions.ResolveInstructions = async function(instructions){
  let lastValue;
  for (let instruction of instructions){
    try {
      lastValue = await this.ResolveAmbiguous(instruction);
    } catch (e){
      this.Data.error(e);
      break;
    }
  }
  return lastValue;
}

Actions.ResolveOperation = async function(left, right, operator){
  [left, right] = await Promise.all([left, right].map(function(a){
    return this.ResolveAmbiguous(a);
  }.bind(this)))
  switch(operator){
    case "..":
      return String(left)+String(right)
    case "+":
      return parseFloat(left)+parseFloat(right)
    case "-":
      return parseFloat(left)-parseFloat(right)
    case "*":
        return parseFloat(left)*parseFloat(right)
    case "/":
        return parseFloat(left)/parseFloat(right)
    case ",":
      if (!Array.isArray(left)) left = [left];
      if (!Array.isArray(right)) right = [right];
      return [...left, ...right]
      //equivalent to right(left)
    case ">>":
      console.log(right)
      if (right instanceof Command) {
        return right.Run(this.Interpreter?this.Interpreter:this, [left])
      } else {
        return this.RunCommand(right, [left])
      }
      //equivalent to left.map(right)
    case ">>*":
      console.log(left, right)
      if (!Array.isArray(left)) left = [left];
      return Promise.all(left.map(item=>{
        if (right instanceof Command) {
          return right.Run(this.Interpreter?this.Interpreter:this, [item])
        } else {
          return this.RunCommand(right, [item])
        }
    }))
  }
}

Actions.ResolveAssignment = function(variable, statement){
  return this.Environment[variable] = this.ResolveAmbiguous(statement);
}

Actions.cast = function(type, value){
  return CastingFunctions[type].call(this, value);
}

/**
 * @param {string} func Command function
 * @param {string} description Useless rn
 * @param {number} permission
 */

function Command(func, description, permission){
  this.Name = "Anonymous";
  this.Function = func;
  this.Description = description;
  this.Permission = permission || 0;
}
Command.prototype.Run = function(interpreter, args, extra, name){
  if (!interpreter.Data.CheckPermission(interpreter.Data.message.author, this.Permission)){
    const e = new Error(`You can't run "${name}" because you aren't cool enough. (You don't have permission to run this command.)`);
    e.details = {Target:this.Permission};
    throw e;
  }
  const context = new CommandContext(interpreter, args, this, extra)
  return context.Run();
}

function CommandContext(interpreter, args, command, extra){
  this.Interpreter = interpreter;
  this.Arguments = args;
  this.Command = command;
  this.Extra = extra;
  this.Data = interpreter.Data;
  this.opts = interpreter.Data.options;
  this.Environment = interpreter.Environment;
  this.user = interpreter.Data.message.author;
  this.message = interpreter.Data.message;
  this.guild = interpreter.Data.message.guild;
  this.channel = interpreter.Data.message.channel;
  this.shared = interpreter.Data.shared;
}

CommandContext.prototype.cast = Actions.cast;

CommandContext.prototype.navpage = function(embeds){
  this.shared.navpage(this.channel, this.user, embeds)
}

CommandContext.prototype.respond = function(args){
  this.message.channel.send({
    embed: {
      title: args.title,
      color: args.color,
      fields: [{
        name: "User",
        value: this.user,
      },...(args.fields||[])]
    }
  })
};

CommandContext.prototype.Run = function(){
  //forces this thing to become a promise
  return new Promise(async (resolve, reject)=>{
    try {
      const result = await this.Command.Function.apply(this, this.Arguments)
      resolve(result);
    } catch (e){
      this.Data.error(e)
    }
  })
}
CommandContext.prototype.RunCommand = function(name, args, extra){
  return this.Interpreter.RunCommand(name, args, extra);
}

CommandContext.prototype.ResolveAmbiguous = function(object){
  switch (object.type){
    case "instruction":
      return this.ResolveInstructions(object.value);
    case "operation":
      return this.ResolveOperation(object.left, object.right, object.operator)
    case "assignment": 
      return this.ResolveAssignment(object.variable, object.statement)
    case "string":
      return object.value;
    case "variable":
      return this.ResolveVariable(object.value);
    case "word":
      return object.value;
    case "command":
      return this.ResolveCommand(object.name, object.args)
    case "wrappedinstruction":
      return this.ResolveWrapper(object.value);
    case "list":
      return this.ResolveList(object.value);
    case "argument":
      const result = object.value.match(/([a-zA-Z0-9]+)(?:\:([a-z]+))?/);
      assert(result, "Failed to parse argument");
      let arg = this.Arguments[result[1].toLowerCase()]
      if (result[2]) {
        arg = this.cast(result[2], arg)
      }
      return arg;
    default:
      throw new Error(`you did a big bad: ${object.type}`)
  }
}

CommandContext.prototype.ResolveList = Actions.ResolveList;
CommandContext.prototype.ResolveCommand = Actions.ResolveCommand;
CommandContext.prototype.ResolveWrapper = Actions.ResolveWrapper;
CommandContext.prototype.ResolveVariable = Actions.ResolveVariable
CommandContext.prototype.ResolveInstructions = Actions.ResolveInstructions;
CommandContext.prototype.ResolveAssignment = Actions.ResolveAssignment;
CommandContext.prototype.ResolveOperation = Actions.ResolveOperation;

function Interpreter(str, data, commands){
  this.String = str;
  this.Data = data;
  this.Commands = commands;
  this.Environment = {};
  this.Functional = true;
}

Interpreter.prototype.RunCommand = function(name, args, extra){
  assert(this.Functional)
  if (CoreCommands[name]){
    return CoreCommands[name].Run(this, args, extra, name);
  } else if (this.Environment[name]){
    if (this.Environment[name] instanceof Command) {
      return this.Environment[name].Run(this, args, extra, name);
    } else {
      throw new Error(`Variable "${name}" is not a command`);
    }
  } else if (this.Commands[name]) {
    return this.Commands[name].Run(this, args, extra, name);
  } else {
    throw new Error(`Command not found "${name}"`)
  }
}
Interpreter.prototype.ResolveAmbiguous = function(object){
  switch (object.type){
    case "instruction":
      return this.ResolveInstructions(object.value);
    case "operation":
      return this.ResolveOperation(object.left, object.right, object.operator)
    case "assignment": 
      return this.ResolveAssignment(object.variable, object.statement)
    case "string":
      return object.value;
    case "variable":
      return this.ResolveVariable(object.value);
    case "word":
      return object.value;
    case "command":
      return this.ResolveCommand(object.name, object.args)
    case "wrappedinstruction":
      return this.ResolveWrapper(object.value);
    case "list":
        return this.ResolveList(object.value);
    default:
      throw new Error(`you did a big bad: ${object.type}`)
  }
}
Interpreter.prototype.cast = Actions.cast
Interpreter.prototype.ResolveList = Actions.ResolveList;
Interpreter.prototype.ResolveCommand = Actions.ResolveCommand;
Interpreter.prototype.ResolveWrapper = Actions.ResolveWrapper;
Interpreter.prototype.ResolveVariable = Actions.ResolveVariable
Interpreter.prototype.ResolveInstructions = Actions.ResolveInstructions;
Interpreter.prototype.ResolveAssignment = Actions.ResolveAssignment;
Interpreter.prototype.ResolveOperation = Actions.ResolveOperation;

Interpreter.prototype.Execute = function(){
  const tree = parser.parse(this.String);
  this.Tree = tree;
  this.ResolveInstructions(this.Tree.value);
}

module.exports = {
  command: Command,
  run:function(str, data, commands){
    const i = new Interpreter(str, data, commands);
    i.Execute();
    return i;
  }
}