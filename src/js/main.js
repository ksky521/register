var URL_LOGIN = 'http://wx-beiyi3.bjguahao.gov.cn/pekingthird/tologin.htm';
var URL_REG = 'http://wx-beiyi3.bjguahao.gov.cn/pekingthird/dpt/appoint/200039604.htm';
var URL_USERS = 'http://wx-beiyi3.bjguahao.gov.cn/pekingthird/p/info.htm';

var $login = document.getElementById('login');
var $register = document.getElementById('register');
var COUNT = 0;
var $count = document.getElementById('count');
var DATA = {};
Object.defineProperties(DATA, {
    'users': {
        set: function(newVal) {
            if (Array.isArray(newVal)) {
                var arr = [];
                newVal.forEach(function(v) {
                    var html = '<input type="radio" name="userName" value="' + v + '"> ' + v;
                    arr.push(v);
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
                    arr.push(v);

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
    account: '',
    password: '',
    dates: {
        planA: '',
        planB: ''
    }
};
['account', 'password'].forEach(function(v) {
    $('#' + v).keypress(function(v) {
        return function() {
            CONFIG[v] = this.value;
        }
    }(v));

});
['docType', 'docName', 'userName'].forEach(function(v) {
    $('#' + v + ' input').click(function(v) {
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
                    break;
            }
        }
    }(v));
});


var timer = setInterval(function() {
    $count.innerText = ++COUNT;
    $register.reloadIgnoringCache();
}, 3e3);

$autoLoginBtn.addEventListener('click', function() {
    if (CONFIG.account && CONFIG.password) {
        var code = getCode(exec_login, CONFIG);
        $register.executeJavaScript(code);
    } else {
        alert('账号或密码为空');
    }
}, true);


//开始require
var electron = require('electron');
var template = require('./lib/javascript')
var ipcRenderer = electron.ipcRenderer;
ipcRenderer.on('hostChannel', function(event, msg) {
    switch (msg.type) {
        case 'clearTimer':
            clearInterval(timer);
            break;
        case 'login':
            var code = getCode(exec_login, CONFIG);
            $register.executeJavaScript(code);
            break;
        case 'users':
        case 'doctors':
            DATA.users = msg.data;
            break;
    }
});


$register.addEventListener('did-finish-load', function() {
    var code = getCode(exec_checkCanRegisterDom);
    $register.executeJavaScript(code);
});

// $login.addEventListener('did-finish-load', function() {
//   var code = getCode(login);
//   // $login.executeJavaScript(code);
// });

//检验
function exec_checkCanRegisterDom() {
    var element = null,
        event = null;
    if ($('#mobileQuickLogin').length && $('#pwQuickLogin').length) {
        __nightmare.send('login');
        return;
    } else if ($('select[name=hzr]').length) {
        $('select[name=hzr]').val('xxxxxx');

        element = document.getElementById('btnSendCodeOrder');
        event = document.createEvent('MouseEvent');
        event.initEvent('click', true, true);
        element.dispatchEvent(event);
        return;
    }

    var FIRST = 'xxx';
    var $list = $('.wp .signal_source_l a');
    var len = $list.length;
    if (len > 0) {
        var f = 0;
        $('.wp .signal_source_l a').each(function(i, v) {
            if (v.innerText.indexOf(FIRST) !== -1) {
                f = i;
            }
        });
        element = $list.eq(f)[0];
        event = document.createEvent('MouseEvent');
        event.initEvent('click', true, true);
        element.dispatchEvent(event);
        __nightmare.send('clearTimer');
    }
}

//自动登录
function exec_login() {
    var PASSWORD = '{{!password}}';
    var ACCOUNT = '{{!account}}';

    $('#tab_my .hosi_login_my span:eq(1)').click();
    $('#mobileQuickLogin').val(ACCOUNT);
    $('#pwQuickLogin').val(PASSWORD);
    var element = document.querySelector('#quick_login_button');
    var event = document.createEvent('MouseEvent');
    event.initEvent('click', true, true);
    element.dispatchEvent(event);
}

//获取医生列表
function exec_getDoctors() {
    var users = [];
    $('.signal_source_l .signal_source_l_ul').find('li:eq(1)').find('span:first-child').each(function(i, v) {
        var user = $(v).text();
        users.push(user);

    });
    __nightmare.send('doctors', users);
}

//获取用户列表
function exec_getUsers() {
    //http://wx-beiyi3.bjguahao.gov.cn/pekingthird/p/info.htm
    var users = [];
    $('.account_box_l h4 b').each(function(i, v) {
        var user = $(v).text();
        users.push(user);
    });
    __nightmare.send('users', users);
}

function getCode(fn, data) {
    var code = fn.toString();
    data = data || {};
    data.src = code;
    code = template.execute(data);

    return code;
}
