'use strict'

var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var Logger = require('../src/utils/logger');

var logger = new Logger();
var platform = os.platform().toLowerCase();

logger.info(`Start to install dependencies on ${platform} Platform`);

var proc;

if(platform.includes('darwin')) {
  proc = spawn('bash', [path.join(__dirname, './bash/mac_install.sh')]);
}
else if(platform.includes('win')) {
  proc = spawn('cmd', [path.join(__dirname, './bash/win_install.bat')]);
}
else {
  // Run linux installation script
  proc = spawn('bash', [path.join(__dirname, './bash/linux_install.sh')]);
}

// Redirect process stdout and stderr stream.
logger.infoStream(proc.stdout);
logger.errorStream(proc.stderr);
