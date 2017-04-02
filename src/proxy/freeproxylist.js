'use strict'

var _ = require('underscore');
var cheerio = require('cheerio');
var request = require('request');
var ProxyBase = require('./base-proxy');

var FreeListProxy =  function(options, logger) {
  ProxyBase.call(this, options, logger);

  this.homeUrl = 'http://free-proxy-list.net';
}

_.extend(FreeListProxy.prototype, ProxyBase.prototype);

FreeListProxy.prototype._getListHtml = function(listUrl, cb) {
  request({
    method: 'GET',
    url: listUrl
  }, function(error, response, data) {
    if(error) {
      return cb(error);
    }
    cb(null, data);
  });
}

FreeListProxy.prototype._parseListHtml = function(listHtml, cb) {
  var proxies = [];
  var $ = cheerio.load(listHtml);
  var colIndexes = {};

  var headerElement = $('table thead tr').first();
  $('th', headerElement).each(function(index, th) {
    // th -> DOM element, $(th) -> JQuery object
    var key = $(th).text().toLowerCase().replace(/ /g, '_');
    colIndexes[key] = index;
  });

  $('table tbody tr').each(function(index, tr) {
    var ipAddress = $('td', tr).eq(colIndexes['ip_address']).text();
    var port = $('td', tr).eq(colIndexes['port']).text();
    var anonymityLevel = $('td', tr).eq(colIndexes['anonymity']).text();
    var isHttps = $('td', tr).eq(colIndexes['https']).text();

    proxies.push({
      ipAddress: ipAddress,
      port: port,
      anonymityLevel: anonymityLevel,
      isHttps: isHttps
    });
  });

  cb(null, proxies);
}

module.exports = FreeListProxy;
