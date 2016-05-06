// $('#hosi_login_dqls .hosi_login_my span').eq(1).click();
// $('#mobileQuickLogin').val(13436319443);
// $('#pwQuickLogin').val('');
// $('#quick_login_button').click();
$('#index-kw').val('test');
$(document).on('mousedown', function(e) {
  alert(e.target.innerText);
});
var pos = $('#index-bn').offset();
var ipc = require('electron').ipcRenderer;
ipc.send('position', pos);
