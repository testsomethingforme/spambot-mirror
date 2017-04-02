'use strict'

var RandString = require('randomstring');
var mailProviders = [
  'gmail.com', 'yahoo.com', 'aol.com', 'apple.com', '163.com',
  'outlook.com', 'mail.ru', 'inbox.com', 'hushmail.com'
];


module.exports = {
  
  randomString: function(n) {
    return RandString.generate(n);
  },

  fakeEmail: function() {
    var index = Math.floor(Math.random() * mailProviders.length);
    return RandString.generate(8) + '@' + mailProviders[index];
  },

  fakeUsername: function(count) {
    return RandString.generate(count);
  }
};
