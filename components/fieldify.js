function doArr(arr, transform) {
  let field;
  const fields = [];
  
  for (let i = 0; i<arr.length; i++){
    if (i%10===0) {
      field = [];
      fields.push({
        fields: field
      });
    }
    let v = arr[i];
    if (typeof v === "string") {
      v = {name:i+1,value:v}
    }
    if (!v.name){
      v.name = i+1;
    }
    transform(v)
    field.push(v)
  }
  if (fields.length===0){
    return [{}]
  }
  return fields;
}
module.exports = function(arrorobj, transform=function(){}){
  if (Array.isArray(arrorobj)) {
    return doArr(arrorobj, transform);
  } else {
    const keys = Object.keys(arrorobj);
    keys.forEach(function(v, i){
      keys[i] = {name:v, value:arrorobj[v]}
    })
    return doArr(keys, transform)
  }
}