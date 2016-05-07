var electron = require('electron');
var template = require('./lib/javascript')
var ipcRenderer = electron.ipcRenderer;
var $login = document.getElementById('login');
var $register = document.getElementById('register');
var timer = setInterval(function () {
  $register.reloadIgnoringCache();
}, 3e3);


ipcRenderer.on('hostChannel', function (event, msg) {
  switch (msg.type) {
    case 'clearTimer':
      clearInterval(timer);
      break;
    case 'login':
      var code = getCode(login);
      $register.executeJavaScript(code);
      break;
  }
});


$register.addEventListener('did-finish-load', function () {
  var code = getCode(checkCanRegisterDom);
  $register.executeJavaScript(code);
});

$login.addEventListener('did-finish-load', function () {
  var code = getCode(login);
  // $login.executeJavaScript(code);
});

//检验
function checkCanRegisterDom() {
  if ($('#mobileQuickLogin').length && $('#pwQuickLogin').length) {
    __nightmare.send('login');
    return;
  }else if($('select[name=hzr]').length){
    $('select[name=hzr]').val('226255766');

    var element = document.getElementById('btnSendCodeOrder');
    var event = document.createEvent('MouseEvent');
    event.initEvent('click', true, true);
    element.dispatchEvent(event);
    return;
  }

  var FIRST = '杨孜';
  var $list = $('.wp .signal_source_l a');
  var len = $list.length;
  if (len > 0) {
    var f = 0;
    $('.wp .signal_source_l a').each(function (i, v) {
      if (v.innerText.indexOf(FIRST) !== -1) {
        f = i;
      }
    });
    var element = $list.eq(f)[0];
    var event = document.createEvent('MouseEvent');
    event.initEvent('click', true, true);
    element.dispatchEvent(event);
    __nightmare.send('clearTimer');
  }
}

function login() {
  var PASSWORD = 'l98605l3';
  var ACCOUNT = '13436319443';

  $('#tab_my .hosi_login_my span:eq(1)').click();
  $('#mobileQuickLogin').val(ACCOUNT);
  $('#pwQuickLogin').val(PASSWORD);
  var element = document.querySelector('#quick_login_button');
  var event = document.createEvent('MouseEvent');
  event.initEvent('click', true, true);
  element.dispatchEvent(event);
}

function getCode(fn) {
  var code = fn.toString();
  code = template.execute({
    src: code
  });

  return code;
}
