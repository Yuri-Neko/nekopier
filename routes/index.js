require('../bin/www')
var express = require('express');
var router = express.Router();
var util = require('util'),
exec = require('child_process').exec;
var chalk = require("chalk")
var archiver = require('archiver');
var fs = require('fs');
const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};
const moment = require('moment-timezone')
const jam = moment().tz('Asia/Jakarta').format('HH:mm:ss')
/* GET home page. */
router.get('/', async function(req, res, next) {
res.render('index', { title: 'Nekopier - Take any website offline.' });
});
router.get('/api', async function(req, res, next) {
let url = req.query.url
if(!url) return res.json({status:404, msg: "Insert URL"})
let website ="";
const child = exec(`wget -mkEpnp --no-if-modified-since ${url}`);
// read stdout from the current child.
child.stderr.on("data",(response)=>{
if(response.startsWith("Resolving "))
    {
        website= response.substring(response.indexOf('Resolve ')+11,response.indexOf(' ('))
    }
})
child.stderr.on('close',(response)=>{
var output = fs.createWriteStream("./public/sites/" +website+ '.zip');
var archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});
output.on('close', function() {
  exec(`rm -rf ${website}`);
  exec(`rm -rf ./public/sites/.zip`);
  console.log(color(`[ • ${jam} - https://${website} | ${bytesToSize(archive.pointer())} • ]` ,'white'))
  let jjx = {
  	filename : website,
      size : bytesToSize(archive.pointer()),
      compres_level: 9,
      url : `https://web.neko.pe/sites/${website}.zip`
  }
  return res.json(jjx)
});
// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
  console.log('Data has been drained');
});
 
// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err;
  }
});
// good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});
// pipe archive data to the file
archive.pipe(output);
// append files from a sub-directory and naming it `new-subdir` within the archive
archive.directory('./'+website,false);
// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize(); 
})
});

module.exports = router;
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function bytesToSize(bytes, decimals = 2) {
if (bytes === 0) return '0 Bytes';
const k = 1024;
const dm = decimals < 0 ? 0 : decimals;
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));
return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}