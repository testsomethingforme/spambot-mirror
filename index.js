'use strict'

var Proxy = require('./src/proxy');
var Attacker = require('./src/attacker');

/**
 * Provide a interface to expose some reusable modules
 * like Proxy and Attacker in 'spambot' package.
 *
 */
module.exports = {
  Proxy: Proxy,
  Attacker: Attacker
};
