module.exports = shared=>(context, id, n=-100, disallowSameUser=false) => {
  const selfid = context.data.message.author.id;

  if (disallowSameUser && id===selfid) {
    throw new Error("Target user and executor can't be the same");
  }

  const permissions = context.data.options.permissions;
  if (permissions[selfid]<=(permissions[id]||0) || permissions[selfid]<=n) {
    let e = new Error("Permission too low.")
    e.details = {
      "Target Permission": permissions[id]||0,
      "User Permission": permissions[selfid],
      "New Permission": numr
    }
    throw e;
  }
  return true
}