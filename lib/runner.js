var renderer = require('electron').ipcMain;
var parent = require('./ipc')(process);
var sliced = require('sliced');



renderer.on('page', function (sender /*, arguments, ... */ ) {
  parent.emit.apply(parent, ['page'].concat(sliced(arguments, 1)));
});

renderer.on('console', function (sender, type, args) {
  parent.emit.apply(parent, ['console', type].concat(args));
});
