'use strict';

const http = require('http')
    , fs   = require('fs')
    , mime = require('mime')

    , util      = require('./util')
    , compress  = require('./compress')
    , constants = require('./constants.js')
    , Logger    = require('./logger').Logger;

// Options:
//
// cache: {Boolean} - false by default
// cacheHeaders: {String} - if not specified and if cache is true, the default max-age header 
//                          should be 3600 seconds
//
// encoding: {Boolean} - accept encoding.
// 
// cors: {Boolean}
// corsHeaders: {String}
//
// host: {String} - if not specified, default host should be `127.0.0.1`
// port: {Number} - if not specified, default port should be 3000
// root: {String} - if not specified, default path to directory is './'
// name: {String}
//
// notFound: {String} - path to default 404 answer; should be placed into the `root`folder

const defaultOpts = {
  cache: false,
  cacheHeaders: 'private, max-age=3600, must-revalidate',
  encoding : false,
  host: '127.0.0.1',
  port: 3000,
  root: './',
  cors: false,
  corsHeaders: '',
  name: 'node.js',
  notFound: '',
  logToFile: false,
  logFile: '',
  logToConsole: false
}

function Server(opts) {
  if (!opts) {
    this.options = defaultOpts;
  } else {
    this.options = Object.keys(defaultOpts).reduce((init, key) => {
      if (!opts[key] || opts[key] === '') {
        init[key] = defaultOpts[key]
      } else {
        init[key] = opts[key];
      }
  
      return init;
    }, {});
  }

  this.options.root = util.resolve(this.options.root);
  if (this.options.notFound) {
    this.options.notFound = util.join(this.options.root, this.options.notFound);
  }

  this.logger = new Logger(this.options);
}

Server.prototype.start = function start(callback) {
  this._server = http.createServer(handler(this))
                     .listen(this.options.port, this.options.host, () => {

                      this.logger.log(this.options);

                      if (callback) callback.call(null);
                     });
};

Server.prototype.stop = function stop() {
  if (this._server) {
    this._server.close();
    this._server = null;
    this.logger.log('closed');
  }
};

function handler(server) {
  return function(req, res) {
    let fullPath = util.getFullPath(req, server.options.root);

    res.headers = {};
    
    if (server.options.name) {
        res.headers['X-Powered-By'] = server.options.name;
    }

    if (server.options.cors) {
      res.headers['Access-Control-Allow-Origin'] = '*';
      res.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Range';
      if (server.options.corsHeaders) {
        server.options.corsHeaders.split(',')
          .forEach((header) => { 
            res.headers['Access-Control-Allow-Headers'] += ', ' + header; 
          });
      }
    }

    util.getStat(fullPath).then((stat) => {      
      if (stat.isDirectory()) {
        const dirIndex = util.join(fullPath, 'index.html');
        if (fs.existsSync(dirIndex)) {
          sendFile(dirIndex, stat, req, res, server);
        } else {
          sendError(res, constants.HTTP_STATUS_NOT_FOUND, dirIndex, server);
        }
      } else {
        sendFile(fullPath, stat, req, res, server);
      }
    }).catch((err) => {
      if (err.code == 'ENOENT') {
        sendError(res, constants.HTTP_STATUS_NOT_FOUND, fullPath, server);
      } else {
        sendError(res, constants.HTTP_STATUS_INTERNAL_SERVER_ERROR, fullPath, server);
      }
    });
  }
}

function validateCache(req, res, stat, fullPath, server) {
  const lastModified = stat.mtime.toUTCString()
      , notModified  = (lastModified === util.getHeader(req, 'if-modified-since'));
      
  res.headers['Date']          = new Date().toUTCString();
  res.headers['Last-Modified'] = lastModified;
  res.headers['Cache-Control'] = server.options.cacheHeaders;

  if (notModified) {  
    res.writeHead(constants.HTTP_STATUS_NOT_MODIFIED, res.headers);
    res.end();
    server.logger.collectAndLog(res.statusCode, fullPath, res.headers);
    return true;
  } else {
    return false;
  }
}

function sendFile(fullPath, stat, req, res, server) {
  res.headers['Content-Type'] = mime.lookup(fullPath);
  //res.headers['Content-Length'] = stat.size;

  if (server.options.cache) {
    let notModified = validateCache(req, res, stat, fullPath, server);
    if (notModified) return;
    else {
      if (server.options.encoding) {
        compress.sendCompressedFile(fullPath, util.getHeader(req, 'Accept-Encoding'), res, server.logger);
      } else {
        pipeFile(fullPath, res, null, server);
      }
      return;
    }
  } else if (server.options.encoding) {
    compress.sendCompressedFile(fullPath, util.getHeader(req, 'Accept-Encoding'), res);
    return;
  } else {
    pipeFile(fullPath, res, null, server);
  }
}

function sendError(res, code, fullPath, server) { 
  res.writeHead(code);
  if (code === 404 && server.options.notFound !== '') {
    pipeFile(server.options.notFound, res, code, server);
  } else {
    server.logger.collectAndLog(res.statusCode, fullPath, res.headers);

    res.end();
  } 
}

function pipeFile(fullPath, res, code, server) {
  res.writeHead(code || constants.HTTP_STATUS_OK, res.headers);

  fs.createReadStream(fullPath)
    .pipe(res);
  server.logger.collectAndLog(res.statusCode, fullPath, res.headers);
}

module.exports = Server;