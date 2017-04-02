'use strict'

var _ = require('underscore');
var cheerio = require('cheerio');
var request = require('request');
var ProxyBase = require('./base-proxy');

var TorProxy =  function(options, logger) {
  ProxyBase.call(this, options, logger);

  this.homeUrl = '';
}

_.extend(TorProxy.prototype, ProxyBase.prototype);

TorProxy.prototype._getListHtml = function(listUrl, cb) {

};

TorProxy.prototype._parseListHtml = function(listHtml, cb) {

};

module.exports = TorProxy;
