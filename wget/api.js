var util = require('util'),
exec = require('child_process').exec;
var archiver = require('../archiver/api')


module.exports=(data)=>{
let website ="";
const child = exec(`wget -mkEpnp --no-if-modified-since ${data.website}`);
// read stdout from the current child.
child.stderr.on("data",(response)=>{
    if(response.startsWith("Resolving "))
    {
        website= response.substring(response.indexOf('Resolve ')+11,response.indexOf(' ('))
    }
})
child.stderr.on('close',(response)=>{
    archiver(website)
})
return website
}
