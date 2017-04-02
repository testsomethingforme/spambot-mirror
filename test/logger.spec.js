'use strict'

var Readable = require('stream').Readable;
var assert = require('assert');
var Logger = require('../src/utils/logger');

describe('Test Logger functionality', function() {

  it('Should print log to stdout', function(done) {
    var logger = new Logger();
    var text = 'helloworld';

    var printText = '';
    logger._emitter.on('info', function(data) {
      printText += data.toString();
    });

    logger.info(text);

    setTimeout(function() {
      assert.equal(text, printText);
      done();
    }, 100);
  });

  it('Should print Readable stream to stdout', function(done) {
    var logger = new Logger();
    var stream = new Readable();
    stream._read = function() {};

    var printText = '';
    logger._emitter.on('info', function(data) {
      printText += data.toString();
    });

    logger.infoStream(stream);
    stream.push('Hello\nHi\nHey');
    stream.push(null);

    setTimeout(function() {
      assert.equal(printText, 'HelloHiHey');
      done();
    }, 100);
  });
});
