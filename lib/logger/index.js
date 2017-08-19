'use strict';

const fs      = require('fs')
    , winston = require('winston');

function Logger(opts) {
  this._logToConsole = opts.logToConsole;

  this._logToFile    = opts.logToFile;
  this._logFile      = opts.logFile; 

  this._tempData     = {};

  this._logger = new winston.Logger();

  if (this._logToConsole) {
    this._logger.add(winston.transports.Console, {
      timestamp: tsFormat,
      colorize: true,
      level: 'info'      
    });
  }

  if (this._logToFile) {
    this._logger.add(winston.transports.File, {
      filename: this._logFile,
      timestamp: tsFormat,
      eol: '\r\n',
      level: 'info'
    });    
  }
}

Logger.prototype._add = function(key, value) {
  if (arguments.length === 2) {
    this._tempData[key] = value;
  } else if (arguments.length === 1 && key instanceof Object) {
    let data = key;
    this._tempData = Object.keys(data).reduce((init, item) => {
      init[item] = data[item];

      return init;
    }, this._tempData);

    data = null;
  }
}

Logger.prototype.log = function(data) {
  let dataToLog = data ? data : this._tempData;

  this._logger.info(dataToLog);
  
  this._tempData = {};
}

Logger.prototype.collectAndLog = function(status, fullPath, headers) {
      this._add('status', status)      
      this._add('path', fullPath);
      this._add(headers);

      this.log();
}

const tsFormat = () => (new Date()).toLocaleTimeString();

module.exports = { Logger };