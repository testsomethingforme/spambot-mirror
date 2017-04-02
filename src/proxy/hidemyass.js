'use strict'

var _ = require('underscore');
var cheerio = require('cheerio');
var request = require('request');
var ProxyBase = require('./base-proxy');

var HidemyassProxy =  function(options, logger) {
  ProxyBase.call(this, options, logger);

  this.homeUrl = 'http://proxylist.hidemyass.com';
}

_.extend(HidemyassProxy.prototype, ProxyBase.prototype);

HidemyassProxy.prototype._getListHtml = function(listUrl, cb) {

};

HidemyassProxy.prototype._parseListHtml = function(listHtml, cb) {

};

module.exports = HidemyassProxy;
