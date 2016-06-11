var minstache = require('minstache');
var today = new Date().getFullYear() + '-' + ('00' + (new Date().getMonth() + 1)).slice(-2) + '-' + ('00' + (new Date().getDate())).slice(-2);
var package = require('../package.json');
var version = package.version;

var fs = require('fs');
var path = require('path');

var data = fs.readFileSync(path.join(__dirname, '../tpl/about.html'));

var tpl = minstache.compile(data.toString());
var content = tpl({
  version: version,
  date: today
});

fs.writeFileSync(path.join(__dirname, '../about.html'), content);
