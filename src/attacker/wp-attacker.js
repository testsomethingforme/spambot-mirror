'use strict'

// Swith from 'async' to 'Q' for consistency as webdriver uses Promise.
var Q = require('q');
var _ = require('underscore');
var cheerio = require('cheerio');
var request = require('request');
var nop = require('nop');
var proxyConfig = require('selenium-webdriver/proxy');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var Until = webdriver.until;
var sentence = require('../utils/sentence');

/**
 * Constructor for WordPress Attacker Class
 *
 * @param  {string} url
 * @param  {Object} options
 * @param  {Logger} logger
 */
var wpAttacker = function(url, options, logger) {
  this.options = options;
  this.url = url;
  this.logger = logger;
  this.storedArticleUrls = [];
  // Build a built-in driver in constructor and destroy it at the end.
  this.driver = this._build(this.options);
};

/**
 * Build webdriver instance with optional proxy and return
 * a promise at the end.
 * @param  {object} options
 * @return {promise}
 */
wpAttacker.prototype._build = function(options) {
  var driver = new webdriver.Builder().forBrowser('chrome');
  if(options.proxy) {
    var url = options.proxy.ipAddress + ':' + options.proxy.port;
    driver.setProxy(proxyConfig.manual({
      https: url,
      http: url
    }));
  }
  return driver.build();
};

/**
 * Get the content of HTML for a given url, use proxy to
 * connect if proxy is specified in options.
 *
 * @return {promise}
 */
wpAttacker.prototype._getHtml = function() {
  var deferred = Q.defer();
  var requestObj = {
    method: 'GET',
    url: this.url,
    timeout: 3000
  };
  var proxy = this.options.proxy;

  // Use proxy to get web page if proxy is in options.
  if(proxy) {
    _.extend(requestObj, { proxy: 'http://' + proxy.ipAddress + ':' + proxy.port });
  }

  request(requestObj, function(error, response, html) {
    if(error) return deferred.reject(error);
    else deferred.resolve(html);
  });

  return deferred.promise;
};

/**
 * Build a new instance of webdriver with new proxy and set default
 * driver with new driver.
 *
 * @param  {object} proxy
 * @return {promise}
 */
wpAttacker.prototype.switchProxy = function(proxy) {
  this.options = _.extend(this.options, {proxy: proxy});
  this.quit();
  this.driver = this._build(this.options);
  return this.driver;
};

/**
 * Spawn a new driver with proxy settings.
 *
 * @param  {Object} proxy
 * @return {webDriver}
 */
wpAttacker.prototype.spawnDriver = function(proxy) {
  var options = _.extend(this.options, {proxy: proxy});
  return this._build(options);
}

/**
 * Check if current driver has already quited, then
 * quit current builtin webdriver and clear things up.
 * After quit, the driver instance exists but not able
 * to issue any command anymore.
 *
 * @return {Promise}
 */
wpAttacker.prototype.quit = function() {
  return this.driver.getSession(function(session) {
    if(session) {
      return this.driver.quit();
    }
    else {
      var deferred = Q.defer();
      deferred.resolve(null);
      return deferred.promise;
    }
  });
};

/**
 * Check if url is a valid WordPress blog by naively searching
 * string "wordpress" in html content.
 *
 * @return {Boolean}
 */
wpAttacker.prototype.isWordPress = function() {
  var self = this;
  var promise = this._getHtml().then(function(html) {
    var isWordpress = (html.indexOf('wordpress') !== -1);
    return isWordpress;
  });
  return promise;
};

/**
 * Get a list of all articles under main url.
 *
 * @return {promise}
 */
wpAttacker.prototype.getArticles = function() {
  var self = this;
  var articles = [];
  var promise = this._getHtml().then(function(html) {
    var $ = cheerio.load(html);
    $('article').each(function(index, articleElement) {
      var href = $('a', articleElement).first().attr('href');
      // Only store matched href with current url in list.
      if(href.includes(self.url.replace(/^https?:\/\//, ''))) {
        articles.push(href);
      }
    });
    self.storedArticleUrls = articles;
    return articles;
  });
  return promise;
};

/**
 * Same functionality as getArticles(), but return cached
 * article urls instead of making new request on home page
 * everytime when this.storedArticleUrls is not empty.
 *
 * @return {promise} Thenable<articles>
 */
wpAttacker.prototype.getCachedArticles = function() {
  var self = this;
  var deferred = Q.defer();
  if(this.storedArticleUrls.length === 0) {
    return this.getArticles();
  }
  else {
    deferred.resolve(this.storedArticleUrls);
    return deferred.promise;
  }
}

/**
 * Send a comment to one of the articles in wordpress using a separate
 * webdriver instance.
 *
 * @param  {string} email
 * @param  {string} user
 * @param  {string} comment
 * @return {promise}
 */
wpAttacker.prototype.sendComment = function(email, user, comment, proxy) {
  var self = this;

  var errorHandler = function(err) {
    self.logger.error('Failed to find specified element on page (may be caused by anti-spam filter)');
  };

  var conditionPromise = this.getCachedArticles().then(function(articles) {
    // Select random article as target.
    var article = _.sample(articles);

    if(!article) {
      self.logger.error('Cannot find any articles to send comment and quit...');
      process.exit(0);
    }

    // Spawn a new driver for each new comment.
    var driver = self.spawnDriver(proxy || {});

    // Use errorHandler or nop to swallow errors and continue, in order to avoid interruption.
    driver.get(article).then(null, nop);
    driver.findElement(By.id('comment')).sendKeys(comment).then(null, nop);
    driver.findElement(By.id('email')).sendKeys(email).then(null, nop);
    driver.findElement(By.id('author')).sendKeys(user).then(null, nop);

    // Element may have different id in different wordpress blog.
    driver.findElement(By.id('comment-submit')).click().then(null, nop);
    driver.findElement(By.id('submit')).click().then(null, nop);

    // Return a Thenable<Condition> promise when comment becomes blank
    // after submission within 10s timeout.
    var promise = driver.findElement(By.id('comment')).then(function(commentElement) {
      return driver.wait(Until.elementTextIs(commentElement, ''), 10000);
    }, nop).then(function(element) {
      if(element) return true;
      else return false;
    }, nop);

    // Destroy driver instance after per usage, and all errors before quit should
    // be swallowed, otherwise the new instance will not be closed after interruption.
    driver.quit();

    // Thenable <Boolean>
    return promise;
  });

  return conditionPromise;
};

module.exports = wpAttacker;
