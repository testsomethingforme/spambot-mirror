'use strict';

var _ = require('underscore');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');


/**
 * A base abstract class for other concrete proxy class to extend.
 * Add functionality to validate availability of a proxy and
 * periodically update proxy list.
 *
 * @param {Object} options
 * @param {logger} logger
 */
var ProxyBase = function(options, logger) {
  this.options = options;
  this.homeUrl = '';
  this.logger = logger;
  this.checkIpUrl = 'http://checkip.dyndns.com';
  this.proxy_list = {};
  this.interval = null;
}

/**
 * Update proxy list periodically with specific time interval.
 *
 * @param {Number} millisec Time interval for update.
 * @param {Number} number   Number of proxies.
 * @param {Function} cb  Callback function for proxies
 */
ProxyBase.prototype.setUpdateProxyInterval = function(millisec, number, cb) {
  var self = this;

  if(this.interval !== null) {
    this.clearUpdateProxyInterval();
  }

  function getProxies(){
    self.gatherWorkingProxies(self.options, number, function(proxies) {

      // Clear all existing proxies in list.
      self.proxy_list = {};

      proxies.forEach(function(proxy) {
        self.proxy_list[proxy.ipAddress] = proxy;
      });

      cb(proxies);
    });
  }

  // Invoke method immediately.
  getProxies();
  this.interval = setInterval(function() {
    getProxies();
  }, millisec);
};

/**
 * Clear update interval to stop update proxy list
 *
 * @return {undefined}
 */
ProxyBase.prototype.clearUpdateProxyInterval = function() {
  if(this.interval !== null) {
    clearInterval(this.interval);
  }
};

/**
 * Test if a given proxy is valid to use by sending request
 * to some ip checking website and check returned ip address.
 *
 * @param  {Object}   proxy
 * @param  {Function} callback
 * @return {undefined}
 */
ProxyBase.prototype.testProxy = function(proxy, callback) {
  request({
    method: 'GET',
    url: this.checkIpUrl,
    proxy: 'http://' + proxy.ipAddress + ':' + proxy.port,
    timeout: 3000
  }, function(error, response, html) {
    if(error) return callback(proxy, false);
    // Test if HTML contains proxy IP address.
    var regex = new RegExp(proxy.ipAddress);
    if(regex.test(html)) callback(proxy, true);
    else callback(proxy, false);
  });
};

/**
 * Grab a list of proxies from parsed HTML with filter options.
 *
 * @param  {Object}   options
 * @param  {Function} cb
 * @return {undefined}
 */
ProxyBase.prototype.getProxies = function(moreOptions, cb) {
  var options = Object.assign(this.options, moreOptions);
  var fn = async.seq(
    this._getListHtml,
    this._parseListHtml
  );

  fn(this.homeUrl, function(error, proxies) {
    if(error) return cb(error);
    var filtered_proxies = proxies.filter(function(proxy) {
      return (proxy.anonymityLevel === options.anonymityLevel || options.anonymityLevel == undefined)
                        && (proxy.isHttps === options.isHttps || options.isHttps == undefined);
    });
    cb(null, filtered_proxies);
  });
};

/**
 * Test every proxy in proxy list and only keep valid proxy
 * with short latency.
 *
 * @param  {Object}   options
 * @param  {Number}   n
 * @param  {Function} cb
 * @return {undefined}
 */
ProxyBase.prototype.gatherWorkingProxies = function(options, n, cb) {
  var self = this;
  var newOptions = Object.assign(this.options, options);

  this.getProxies(newOptions, function(err, proxies) {
    if(err) return;
    if(n > proxies.length) n = proxies.length;

    async.times(n, function(index, next) {
      self.testProxy(proxies[index], function(proxy, isWorking) {
        if(isWorking) next(null, proxy);
        else next(null, null);
      });
    }, function(err, workingProxies) {
      // Filter out null from proxy result list.
      workingProxies = workingProxies.filter(function(proxy) {
        return proxy !== null;
      });

      // Print out all working proxies
      // self.logger.info(workingProxies);

      cb(workingProxies);
    });
  });
};

/**
 * Get HTML content with proxy information from given url.
 *
 * @param  {String}   listUrl
 * @param  {Function} cb
 * @return {undefined}
 */
ProxyBase.prototype._getListHtml = function(listUrl, cb) {
  throw new Error("Not implemented yet. Implement this method in inherited class.");
  var html = '';
  cb(null, html);
};

/**
 * Parse HTML string and get back all proxies on page.
 *
 * @param  {String}   listHtml
 * @param  {Function} cb
 * @return {undefined}
 */
ProxyBase.prototype._parseListHtml = function(listHtml, cb) {
  throw new Error("Not implemented yet. Implement this method in inherited class.");
  var proxies = [];
  cb(null, proxies);
};

module.exports = ProxyBase;
