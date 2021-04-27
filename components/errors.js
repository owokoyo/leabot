module.exports = {
  permissionError:(context, commandname)=>{
    return (e)=>{
      if (context.data.options.reportErrors) {
        
        const err = new Error("This bot would like more permission to ~~rule~~ **administrate** your server!");
        err.details = {
          Command: commandname || "Unknown",
          Message: e.message
        }
        context.data.error(err)
      }
    }
  }
}