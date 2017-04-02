'use strict'

// Use a nifty way to extend String.prototype, like "hello".green
// var colors = require('colors'); // Unsafe!
var colors = require('colors/safe');
var EventEmitter = require('events').EventEmitter;
var LOG_LEVELS = ['info', 'warn', 'error'];
var LOG_COLORS = ['green', 'yellow', 'red'];

var Logger = function() {
  this._emitter = new EventEmitter();
  // When log level is set to higher, lower level log will be ignored.
  // Log level is set to lowest to print all logs by default
  this.loglevel = 0;

  var levelname;
  for(var i=0; i<LOG_LEVELS.length; i++) {
    // Add event listeners.
    this._addLogLevelListener(i);

    // Add event emitters.
    levelname = LOG_LEVELS[i];
    this[levelname] = this._emitter.emit.bind(this._emitter, levelname);
    this[levelname + 'Stream'] = this._setLogStream.bind(this, i);
  }
}

Logger.prototype._addLogLevelListener = function(level) {
  var name = LOG_LEVELS[level];
  this._emitter.on(name, this._onLogEvent.bind(this, level));
}

Logger.prototype._onLogEvent = function(level, message) {
  if(level >= this.loglevel) {
    var color = LOG_COLORS[level];
    console.log(colors[color](message));
    // console.log(message[color]); // Unsafe!
  }
}

Logger.prototype.setLogLevel = function(name) {
  var index = LOG_LEVELS.indexOf(name);
  if(index !== -1) {
    this.loglevel = index;
  }
}

/**
 * Print out logs from other stream handlers like child process.
 *
 * @param {Number} level
 * @param {Object} stream
 */
Logger.prototype._setLogStream = function(level, stream) {
  var self = this;
  var text = '';
  var levelname = LOG_LEVELS[level];

  // "\n" is removed from text before printing out to stdout.
  stream.on('data', function(newText) {
    text += newText.toString();
    var list = text.split('\n');

    if(list.length > 1) {
      for(var i=0; i<list.length-1; i++) {
        self[levelname](list[i]);
      }
      text = list[list.length-1];
    }
  });

  stream.on('end', function() {
    if(text) {
      self[levelname](text);
    }
  });
}

module.exports = Logger;
