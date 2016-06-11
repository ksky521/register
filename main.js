const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const renderer = electron.ipcMain;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
var onceWindow = null;
var menuTpl = [{
  label: '帮助',
  role: 'help',
  submenu: [{
    label: '使用说明',
    click: function() {
      onceWindow && onceWindow.destroy();
      onceWindow = new BrowserWindow({
        title: '帮助文档',
        width: 400,
        height: 160,
        minimizable: false,
        maximizable: false,
        resizable: false,
        backgroundColor: '#263238'
      });
      //打开登录页面
      onceWindow.loadURL('file://' + __dirname + '/help.html');

    }
  }, {
    label: '捐赠本软件',
    click: function() {
      window.webContents.send('menu', 'donation');
    }
  }, {
    label: '关于',
    click: function() {

      onceWindow && onceWindow.destroy();
      onceWindow = new BrowserWindow({
        title: '关于',
        width: 400,
        height: 126,
        minimizable: false,
        maximizable: false,
        resizable: false,
        backgroundColor: '#263238'
      });
      //打开登录页面
      onceWindow.loadURL('file://' + __dirname + '/about.html');
    }
  }]
}];


var parent = require('./lib/ipc')(process);
var sliced = require('sliced');
var PowerID;
var powerSaveBlocker = electron.powerSaveBlocker;

var window = null;
var wc = null;

app.on('ready', function() {
  const menu = Menu.buildFromTemplate(menuTpl);
  Menu.setApplicationMenu(menu);
  window = new BrowserWindow({
    width: 1000,
    height: 700,
    maximizable: false,
    resizable: false
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
