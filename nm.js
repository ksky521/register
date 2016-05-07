var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true })

nightmare
  .goto('http://wx-beiyi3.bjguahao.gov.cn/pekingthird/tologin.htm')
  .click('#tab_my .hosi_login_my span:eq(1)')
  .type('#mobileQuickLogin', '13436319443')
  .type('#pwQuickLogin', 'l98605l3')
  .click('#quick_login_button')
  .wait('#main')
  .end()
