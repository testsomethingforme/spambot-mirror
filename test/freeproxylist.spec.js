'use strict'

// var assert = require('assert');
var assert = require('chai').assert;
var sinon = require('sinon');
var nop = require('nop');
var FreeListProxy = require('../src/proxy').Freeproxylist;
var Logger = require('../src/utils/logger');

var options = {};

// Only print error logs, but ignore lower logs.
var logger = new Logger();
logger.setLogLevel('error');

describe('Test Proxies on free-proxy-list.net', function() {

  // Do not put setInterval in before(), otherwise test will be invoked forever.
  before(function(done) {
    this.proxyManager = new FreeListProxy(options, logger);
    done();
  });

  it('Should return a list of proxies after parsing web page', function(done) {
    this.proxyManager.getProxies({}, function(err, proxies) {
      assert.notEqual(Object.keys(proxies).length, 0);
      done();
    });
  });

  it('Should return a list of working proxies after checking proxy validation', function(done) {
    this.timeout(5000);
    this.proxyManager.gatherWorkingProxies({}, 10, function(workingProxies) {
      assert.notEqual(workingProxies.length, 0);
      done();
    });
  });

  it('Should be able to periodically update proxy list', function(done) {
    this.timeout(20000);
    var self = this;
    var callback = sinon.spy();

    this.proxyManager.setUpdateProxyInterval(4000, 10, callback);

    var originProxyObject, updatedProxyObject;
    setTimeout(function() {
      originProxyObject = Object.assign({}, self.proxyManager.proxy_list);
      originProxyObject['0.0.0.0'] = {};
      assert.isAbove(Object.keys(originProxyObject).length, 1);
    }, 6000);

    setTimeout(function() {
      updatedProxyObject = Object.assign({}, self.proxyManager.proxy_list);
      assert.isAbove(Object.keys(updatedProxyObject).length, 0);
      assert.notDeepEqual(originProxyObject, updatedProxyObject);
      assert.isAbove(callback.callCount, 1); // Callback is invoked at lease twice
      done();
    }, 12000);
  });

  // Clean out interval after the end of test suite.
  after(function(done) {
    this.proxyManager.clearUpdateProxyInterval();
    done();
  });

});
