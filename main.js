const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = require('electron').dialog;
var renderer = require('electron').ipcMain;
var parent = require('./lib/ipc')(process);
var sliced = require('sliced');
var PowerID;
var powerSaveBlocker = electron.powerSaveBlocker;

var window = null;
var wc = null;

app.on('ready', function() {
    window = new BrowserWindow({
        width: 1000,
        height: 700
    });
    //打开登录页面
    window.loadURL('file://' + __dirname + '/index.html');
});
renderer.on('powerSaveBlocker', function(e, msg) {
    // console.log(msg);
    if (msg) {
        PowerID = powerSaveBlocker.start('prevent-app-suspension');
    } else {
        PowerID && powerSaveBlocker.stop(PowerID);
    }
});
renderer.on('error', function(sender) {
    console.log(sliced(arguments, 1));
});

renderer.on('powerSaveBlocker', function(e, msg) {
    // console.log(msg);
    if (msg) {
        PowerID = powerSaveBlocker.start('prevent-app-suspension');
    } else {
        PowerID && powerSaveBlocker.stop(PowerID);
    }
});

renderer.on('hostChannel', function(e, msg) {
    window.webContents.send('hostChannel', msg);
});
renderer.on('message', function(e, msg) {
    var buttons = ['OK', 'Cancel'];
    var msg = sliced(arguments, 1)[0];
    dialog.showMessageBox({
        type: 'info',
        buttons: buttons,
        message: msg
    }, function(buttonIndex) {});
});

renderer.on('page', function(sender /*, arguments, ... */ ) {
    parent.emit.apply(parent, ['page'].concat(sliced(arguments, 1)));
});

renderer.on('console', function(sender, type, args) {
    console.log(type, args);
    parent.emit.apply(parent, ['console', type].concat(args));
});
