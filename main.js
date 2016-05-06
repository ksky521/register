const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;


var window = null;
var wc = null;

app.on('ready', function() {
  window = new BrowserWindow({
    width: 800,
    height: 600
  });
  //打开登录页面
  // window.loadURL('http://wx-beiyi3.bjguahao.gov.cn/pekingthird/tologin.htm?redirectUrl=' + encodeURIComponent('http://wx-beiyi3.bjguahao.gov.cn/pekingthird/dpt/appoint/200039484.htm'));
  window.loadURL('file://' + __dirname + '/index.html');


});
