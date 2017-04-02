'use strict'

var Q = require('q');
var assert = require('chai').assert;
var FreeListProxy = require('../src/proxy/freeproxylist');
var Attacker = require('../src/attacker/wp-attacker');
var Logger = require('../src/utils/logger');
var Utils = require('../src/utils/utils');

var logger = new Logger();
var options = {};
var testblog = 'http://testsomethingforme.wordpress.com';
var attacker = new Attacker(testblog, {}, logger);
var proxyManager = new FreeListProxy(options, logger);

/**
 * Warning: Test cases will fail sometimes because the proxy is not stable or
 * under maximum connections.
 */
describe('Test WordPress attacker script', function() {

  it('Should correctly check if a given url is WordPress blog', function() {
    return attacker.isWordPress().then(function(isWordpress) {
      assert.equal(isWordpress, true);
    });
  });

  it('Should get a list of articles url', function() {
    return attacker.getArticles().then(function(articles) {
      assert.notEqual(articles.length, 0);
      assert.include(articles[0], testblog.replace(/^https?:\/\//, ''));
    });
  });

  it('Should be able to quit driver', function() {
    return attacker.quit().then(function() {
      attacker.driver.getSession(function(session) {
        assert.equal(session, null);
      });
    });
  });

  it('Should correctly use proxy to get content', function() {
    // It's really slow (more than 6s) and leave it more time to finish.
    this.timeout(30000);
    // Must support HTTPS, otherwise fail to establish secure tunnel connection.
    var options = {isHttps: 'yes'};

    // Turn async function to Promise for consistency.
    function getProxyPromise() {
      var deferred = Q.defer();
      proxyManager.gatherWorkingProxies(options, 10, function(proxies) {
        if(proxies.length === 0 || proxies == null)
          deferred.reject(new Error('Failed to find any working proxies to test webdriver.'));
        else
          deferred.resolve(proxies);
      });
      return deferred.promise;
    }

    var promise = getProxyPromise().then(function(proxies) {
      var proxy = proxies[0];
      attacker.switchProxy(proxy);
      attacker.driver.get('http://checkip.dyndns.com');
      var source = attacker.driver.getPageSource();
      // Must return a promise.
      return source.then(function(page) {
        assert.include(page, proxy.ipAddress);
      });
    });

    return promise;
  });

  // Proxy from previous test case is not cleaned out yet.
  it('Should successfully send a comment to blog article without login', function() {
    this.timeout(30000); // Super slow sometimes.

    var email = 'testsomethingforme@gmail.com';
    var user = 'testsomethingforme';
    // Duplicate comment is blocked on WordPress.
    var comment = 'I am testsomethingforme with ID ' + Utils.randomString(10) + ' and hope you pass my test.';

    return attacker.sendComment(email, user, comment).then(function(success) {
      assert.equal(success, true);
    });
  });

  // TODO
  //it('Should successfully send a comment to blog article with login', function() {});

  // Clean up internal driver after testing.
  after(function() {
    attacker.quit();
  });
});
