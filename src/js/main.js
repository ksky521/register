var electron = require('electron');

var $login = document.getElementById('login');
var $register = document.getElementById('register');
$register.openDevTools()
var timer = setInterval(function() {
  $register.reloadIgnoringCache();
}, 3e3);

alert(12);
$register.addEventListener('did-finish-load', function() {
  alert(1);
  // var code = checkCanRegisterDom.toString();
  // alert(code);
  // $register.executeJavaScript(code);
});


function checkCanRegisterDom() {
  var len = $('.wp .signal_source_l a').length;
  if (len > 0) {
    alert(1);
  }
}
