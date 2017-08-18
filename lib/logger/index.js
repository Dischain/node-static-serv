'use strict';

const fs      = require('fs')
    , winston = require('winston');

function Logger(opts) {
  this._logToConsole = opts.logToConsole;
  this._logToFile    = opts.logToFile;
  this._logFile      = opts.logFile; 

  this._logger = new winston.Logger();

  if (this._logToConsole) {
    this._logger.add(winston.transports.Console, {
      timestamp: tsFormat,
      colorize: true,
      level: 'info'      
    });
  }

  if (this._logToFile) {
    /*if (!fs.existsSync(this._logFile)) {
      fs.closeSync(fs.openSync(this._logFile, 'a'));;
    }*/

    this._logger.add(winston.transports.File, {
      filename: this._logFile,
      timestamp: tsFormat,
      level: 'info'
    });    
  }
}

Logger.prototype.log = function(data) {
  let logInfo = Object.keys(data).reduce((init, key) => {
    return init += (key + ': ' + data[key] + '\n');
  }, '\n');

  this._logger.info(logInfo);
}

const tsFormat = () => (new Date()).toLocaleTimeString();

module.exports = { Logger };