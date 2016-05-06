const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;


var window = null;
var wc = null;

app.on('ready', function() {
  window = new BrowserWindow({
    width: 800,
    height: 700
  });
  //打开登录页面
  window.loadURL('file://' + __dirname + '/index.html');

});
