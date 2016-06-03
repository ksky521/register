var URL_LOGIN = 'http://wx-beiyi3.bjguahao.gov.cn/pekingthird/tologin.htm';
var URL_REG = 'http://wx-beiyi3.bjguahao.gov.cn/pekingthird/dpt/appoint/200039484.htm';
var URL_USERS = 'http://wx-beiyi3.bjguahao.gov.cn/pekingthird/p/info.htm';

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
    account: '',
    password: '',
    planA: '',
    planB: ''
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
            CONFIG[v] = this.value;
        }
    }(v));
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
        CONFIG[v] = $('#' + v).val()
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
$('#btnStart').click(function() {
    var $count = document.getElementById('count');
    var count = 0;
    $register.loadURL(URL_REG);
    timer && clearInterval(timer);
    timer = setInterval(function() {
        $count.innerText = ++count;
        $register.reloadIgnoringCache();
    }, 3e3);

    $register.addEventListener('did-finish-load', checkIt);

});

$('#btnStop').click(function() {
    timer && clearInterval(timer);
    $register.removeEventListener('did-finish-load', checkIt);
});


function checkIt() {
    console.log(CONFIG);
    var code = getCode(exec_checkCanRegisterDom, { config: JSON.stringify(CONFIG) });
    $register.executeJavaScript(code);
}

//开始require
var electron = require('electron');
var template = require('./lib/javascript');
var ipcRenderer = electron.ipcRenderer;
var minstache = require('minstache');

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
                CONFIG[v] = $('#' + v).val()
            });
            var code = getCode(exec_login, CONFIG);
            $register.executeJavaScript(code);
            break;
        case 'users':
        case 'doctors':
            DATA[msg.type] = msg.data;
            break;
    }
});




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
    } else if ($('select[name=hzr]').length) {
        var $opts = $('select[name=hzr] option');
        for (var i = 0, len = $opts.length; i < len; i++) {
            var txt = $opts.eq(i).html();
            if (txt === config.userName) {
                $('select[name=hzr]').val($opts.eq(i).val());
            }
        }

        element = document.getElementById('btnSendCodeOrder');
        event = document.createEvent('MouseEvent');
        event.initEvent('click', true, true);
        element.dispatchEvent(event);
        return;
    }

    var $list = $('.wp .signal_source_l a');
    var len = $list.length;
    if (len > 0) {
        var $l;
        while (len--) {
            $l = $list.eq(len).find('li');
            var date = $l.eq(0).text();
            var name = $l.eq(1).text();
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

    $('#tab_my .hosi_login_my span:eq(1)').click();
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
    $('.signal_source_l .signal_source_l_ul').find('li:eq(1)').find('span:first-child').each(function(i, v) {
        var user = $(v).text();
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
    $('.account_box_l h4 b').each(function(i, v) {
        var user = $(v).text();
        if (users.indexOf(user) === -1) {
            users.push(user);
        }
    });
    __nightmare.send('users', users);
}

function getCode(fn, data) {
    var code = fn.toString();
    data = data || {};
    code = minstache.compile(code);
    code = code(data);
    data.src = code;
    code = template.execute(data);

    return code;
}
