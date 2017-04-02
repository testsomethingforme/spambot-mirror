/**
 * Provide some util functions to generate trash words or sentence randomly.
 *
 * The bad words can be specified by country code. By default it
 * use English ('en') as default language.
 *
 */

'use strict'

var geoip = require('geoip-lite');
var naughty_words = require('./naughty-words');

module.exports = {

  getCodeByIP: function(ip) {
    var code = geoip.lookup(ip).country.toLowerCase();
    return code;
  },

  getNaughtyWordByCode: function(code) {
    if(!naughty_words.hasOwnProperty(code)) code = 'en';
    if(code === 'cn') code = 'zh';
    if(code === 'us') code = 'en';

    var words = naughty_words[code];
    var index = Math.floor(words.length * Math.random());

    return words[index];
  },

  getNaughtySentenceByCode: function(count, code) {
    var stringText = '';
    for(var i=0; i<count; i++) {
      stringText += this.getNaughtyWordByCode(code) + ' ';
    }
    return stringText;
  }

};
