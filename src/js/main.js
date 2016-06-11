//开始require
var electron = require('electron');
var template = require('./lib/javascript');
var ipcRenderer = electron.ipcRenderer;
var minstache = require('minstache');
var Path = require('path');
var ss = sessionStorage;

var INTERVAL = 3000;
var URL_LOGIN = 'http://yyghwx.bjguahao.gov.cn/tologin.htm';
var URL_HOME = 'http://yyghwx.bjguahao.gov.cn';
var _URL_REG = 'http://yyghwx.bjguahao.gov.cn/common/dutysource/appoint/{{!hid}},{{!dptid}}.htm?dutyDate=&departmentName=';
var URL_REG = ss.url_reg || 'http://yyghwx.bjguahao.gov.cn/common/dutysource/appoint/142,200039484.htm?dutyDate=&departmentName=';
//http://yyghwx.bjguahao.gov.cn/common/dutysource/appoints/142,200039484.htm?departmentName=%25E4%25BA%25A7%25E7%25A7%2591%25E9%2597%25A8%25E8%25AF%258A
var URL_USERS = 'http://yyghwx.bjguahao.gov.cn/p/info.htm';


var $login = document.getElementById('login');
var $register = document.getElementById('register');

var DATA = {};

Object.defineProperties(DATA, {
  'users': {
    set: function(newVal) {
      if (Array.isArray(newVal)) {
        var arr = [];
        newVal.forEach(function(v) {
          var html = '<input type="radio" name="userName" value="' + v + '"> ' + v;
          arr.push(html);
        });
        var html = '<label class="checkbox-inline">';
        html += arr.join('</label><label class="checkbox-inline">');
        html += '</label>';
        $('#userName').html(html);
      }
    }
  },
  'doctors': {
    set: function(newVal) {
      if (Array.isArray(newVal)) {
        var arr = [];
        newVal.forEach(function(v) {
          var html = '<input type="checkbox" value="' + v + '"> ' + v;
          arr.push(html);

        });
        var html = '<label class="checkbox-inline">';
        html += arr.join('</label><label class="checkbox-inline">');
        html += '</label>';
        $('#docName').html(html);
      }

    }
  }
});
DATA.users = [];
DATA.doctors = [];
var CONFIG = {
  docType: [],
  docName: [],
  userName: '',
  account: ss.account || '',
  password: ss.password || '',
  planA: '',
  planB: '',
  hid: 0,
  dptid: 0
};

['planB', 'planA'].forEach(function(v) {
  $('#' + v).change(function(v) {
    return function() {
      CONFIG[v] = this.value;
    }
  }(v));
});
['account', 'password'].forEach(function(v) {
  $('#' + v).keyup(function(v) {
    return function() {
      ss[v] = CONFIG[v] = this.value;
    }
  }(v)).val(ss[v] || '');
});
['docType', 'docName', 'userName'].forEach(function(v) {
  $('#' + v).delegate('input', 'click', function(v) {
    return function() {
      switch (this.type) {
        case 'radio':
          CONFIG[v] = this.value
          break;
        case 'checkbox':
          var cf = CONFIG[v];

          if (this.checked) {
            cf.push(this.value);
          } else {
            var val = this.value;
            cf.splice(cf.indexOf(val), 1);
          }
          console.log(cf);
          break;
      }
    }
  }(v));
});
$('#power').click(function() {
  ipcRenderer.send('powerSaveBlocker', !!this.checked);
});
//点击获取医生列表
$('#btnDoctors').click(function() {
  $register.loadURL(URL_REG);
  var cb = function() {
    var code = getCode(exec_getDoctors);
    $register.executeJavaScript(code);
    $register.removeEventListener('did-finish-load', cb);
  }
  $register.addEventListener('did-finish-load', cb);
});

//自动登录
$('#autoLogin').click(function() {
  ['account', 'password'].forEach(function(v) {
    ss[v] = CONFIG[v] = $('#' + v).val()
  });

  if (CONFIG.account && CONFIG.password) {
    $register.loadURL(URL_LOGIN);

    var cb = function() {
      var code = getCode(exec_login, CONFIG);
      $register.executeJavaScript(code);
      $register.removeEventListener('did-finish-load', cb);

    }
    $register.addEventListener('did-finish-load', cb);

  } else {
    alert('账号或密码为空');
  }
});

//获取就诊人信息
$('#btnUsers').click(function() {
  $register.loadURL(URL_USERS);
  var cb = function() {
    var code = getCode(exec_getUsers);
    $register.executeJavaScript(code);
    $register.removeEventListener('did-finish-load', cb);
  }
  $register.addEventListener('did-finish-load', cb);
});

var timer;
$('#btnStart').click(start);

$register.addEventListener('did-stop-loading', findDpt);


$('#power').click(function() {
  ipcRenderer.send('powerSaveBlocker', !!this.checked);
});

$('#interval').change(function() {
  INTERVAL = this.value * 1000;
  if (doing) {
    start();
  }
});

$('#btnStop').click(stop);
var doing = false;

//开始刷新
function start() {
  stop();
  $('#btnStart').attr('disabled', 'disabled');

  doing = true;
  var $count = document.getElementById('count');
  var count = 0;
  $register.loadURL(URL_REG);
  timer = setInterval(function() {
    $count.innerText = ++count;
    $register.reloadIgnoringCache();
  }, INTERVAL);

  $register.addEventListener('did-finish-load', checkIt);
}

//停止
function stop() {
  $('#btnStart').removeAttr('disabled');

  timer && clearInterval(timer);
  $register.removeEventListener('did-finish-load', checkIt);
  doing = false;
}

$('#navTools').delegate('a[data-id]', 'click', function() {
  var $t = $(this);
  var action = $t.data('id');
  stop();
  switch (action) {
    case 'back':
      $register.goBack();
      break;
    case 'reload':
      $register.reloadIgnoringCache();
      break
    case 'home':
      $register.loadURL(URL_HOME);
      break;
  }
});

//发现Dpt
function findDpt() {
  var code = getCode(exec_findDpt);
  $register.executeJavaScript(code);
}

//循环查找合适的号
function checkIt() {
  // console.log(CONFIG);
  var code = getCode(exec_checkCanRegisterDom, { config: JSON.stringify(CONFIG) });
  $register.executeJavaScript(code);
}

function showBtn() {
  var code = getCode(exec_showBtn);
  $register.executeJavaScript(code);
}
//菜单点击
ipcRenderer.on('menu', function(event, msg) {
  switch (msg) {
    case 'donation':
      $('#qrcodeWechat').modal();
      break;
    case 'about':
      break;
    case 'help':
      break;
  }
});
ipcRenderer.on('hostChannel', function(event, msg) {
  switch (msg.type) {
    case 'loginSuccess':
      setTimeout(function() {
        $('#btnUsers').click();

      }, 1000)
      break;
    case 'clearTimer':
      clearInterval(timer);
      break;
    case 'login':
      ['account', 'password'].forEach(function(v) {
        ss[v] = CONFIG[v] = $('#' + v).val()
      });
      var code = getCode(exec_login, CONFIG);
      $register.executeJavaScript(code);
      break;
    case 'users':
    case 'doctors':
      DATA[msg.type] = msg.data;
      break;
    case 'findIt':
      ['hid', 'dptid'].forEach(function(v) {
        CONFIG[v] = msg.data[v];
      });
      var code = minstache.compile(_URL_REG);
      URL_REG = code(msg.data);
      ss.url_reg = URL_REG;
      showBtn(); //显示按钮
      console.log(URL_REG);
      break;
    case 'startThisPage':
      start();
      break;
    case 'haveTel':
      showNotify();
      break;
  }
});

var lastNotifyTime = Date.now();

function showNotify() {
  var lt = Data.now() - lastNotifyTime;
  //1分钟发一次
  if (lt > 60 * 1000 * 1000) {
    new Notification('发现114号源', {
      title: '发现114号源',
      body: '你监控的号源有114号源；快拨打010114进行挂号'
    });
  }
}


//检验
function exec_checkCanRegisterDom() {
  var element = null,
    event = null;
  var url = location.href.split('#')[0];
  var config = '{{!config}}';
  config = JSON.parse(config);

  if ($('#mobileQuickLogin').length && $('#pwQuickLogin').length) {
    __nightmare.send('login');
    return;
  } else if ($('select#tjdd_bxlx').length) {
    var $opts = $('select#tjdd_bxlx option');
    for (var i = 0, len = $opts.length; i < len; i++) {
      var txt = $opts.eq(i).html();
      if (txt === config.userName) {
        $('select#tjdd_bxlx').val($opts.eq(i).val());
      }
    }
    window.alert = console.log;
    element = document.getElementById('btnSendCodeOrder');
    event = document.createEvent('MouseEvent');
    event.initEvent('click', true, true);
    element.dispatchEvent(event);
    return;
  }

  var $list = $('.wp .hyxzym_box a');
  var len = $list.length;
  if (len > 0) {
    var $l;
    while (len--) {
      $l = $list.eq(len);
      //刨除只能电话预约的
      if ($l[0].href.indexOf('tel:010114') !== -1) {
        __nightmare.send('haveTel');
        continue;
      }
      var date = $l.find('.hyxzym_b_sjp').text();
      var name = $l.find('.hyxzym_b_date').text();

      var step = 0;
      if (config.docName && config.docName.length) {
        step++;
        config.docName.forEach(function(v) {
          if (name.indexOf(v) !== -1) {
            step--;
          }
        });
      }
      if (config.planB || config.planA) {
        step++;
        ['planA', 'planB'].forEach(function(v) {
          if (config[v] && date.indexOf(config[v]) !== -1) {
            step--;
          }
        });
      }
      if (config.docType && config.docType.length) {
        step++;

        config.docType.forEach(function(v) {
          if (name.indexOf(v) !== -1) {
            step--;
          }
        });
      }

      if (step === 0) {
        break;
      }
    }
    if (len > -1) {
      element = $list.eq(len)[0];
      event = document.createEvent('MouseEvent');
      event.initEvent('click', true, true);
      element.dispatchEvent(event);
      __nightmare.send('clearTimer');
    }

  }
}

//自动登录
function exec_login() {
  var PASSWORD = '{{!password}}';
  var ACCOUNT = '{{!account}}';
  if ($('#tab_my .hosi_login_my span.Current').html() !== '快速登录') {
    $('#tab_my .hosi_login_my span:eq(1)').click();
  }
  $('#mobileQuickLogin').val(ACCOUNT);
  $('#pwQuickLogin').val(PASSWORD);
  var element = document.querySelector('#quick_login_button');
  var event = document.createEvent('MouseEvent');
  event.initEvent('click', true, true);
  element.dispatchEvent(event);
  __nightmare.send('loginSuccess');
}

//获取医生列表
function exec_getDoctors() {
  var users = [];
  $('.hyxzym_box .hyxzym_b_sjp').find('span:first-child').each(function(i, v) {
    var user = $(v).text().trim();
    if (users.indexOf(user) === -1) {
      users.push(user);
    }
  });

  __nightmare.send('doctors', users);
}

//获取用户列表
function exec_getUsers() {
  //http://wx-beiyi3.bjguahao.gov.cn/pekingthird/p/info.htm
  var users = [];
  $('.account_box_l h4:first-child').each(function(i, v) {
    var user = $(v).text();
    if (users.indexOf(user) === -1) {
      users.push(user);
    }
  });
  __nightmare.send('users', users);
}

function exec_findDpt() {
  var href = location.href;
  var reg = /^http[s]?:\/\/yyghwx\.bjguahao\.gov\.cn\/common\/dutysource\/appoints\/(\d+),(\d+)\.htm/i;
  var match = reg.exec(href);
  if (match && match[1]) {
    __nightmare.send('findIt', { hid: match[1], dptid: match[2] });
  }
}

function exec_showBtn() {
  var $div = document.createElement('address');
  var div = '<button style="position:fixed;z-index:999999;bottom:10px;right:10px;color:#fff;background-color: #d9534f;border-color:#d43f3a;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: 400;line-height: 1.45;text-align: center;white-space: nowrap;vertical-align: middle;cursor: pointer;border: 1px solid transparent;border-radius: 4px;font-family: Helvetica,tahoma,arial;font-weight: bold;" onclick="__nightmare.send(\'startThisPage\')">监控此号源</button>'
  $div.innerHTML = div;
  document.body.appendChild($div);
}

function getCode(fn, data) {
  var code = fn.toString();
  if (data && $.isPlainObject(data)) {
    code = minstache.compile(code);
    code = code(data);
  }
  data = data || {};

  data.src = code;
  code = template.execute(data);

  return code;
}
