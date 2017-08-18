'use strict';

const http = require('http')
    , fs   = require('fs')
    , mime = require('mime')

    , util      = require('./util')
    , compress  = require('./compress')
    , constants = require('./constants.js');

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
  notFound: ''
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
}

Server.prototype.start = function start(callback) {
  this._server = http.createServer(handler(this))
                     .listen(this.options.port, this.options.host, () => {

                      console.log('Server started with params: ')
                      console.log(this.options);
                      
                      if (callback) callback.call(null);
                     });
};

Server.prototype.stop = function stop() {
  if (this._server) {
    this._server.close();
    this._server = null;
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
                res.headers['Access-Control-Allow-Headers'] += ', ' + header; });
      }
    }

    util.getStat(fullPath).then((stat) => {      
      if (stat.isDirectory()) {
        //////
        const dirIndex = util.join(fullPath, 'index.html');
        if (fs.existsSync(dirIndex)) {
          sendFile(dirIndex, stat, req, res, server);
        }
        else {
          console.log('asdas')
          sendError(res, server, constants.HTTP_STATUS_NOT_FOUND);
        }
        //////
        
        //sendFile(util.join(fullPath, 'index.html'), stat, req, res, server);
      } else {
        sendFile(fullPath, stat, req, res, server);
      }
    }).catch((err) => {
      console.log(err)
      if (err.code == 'ENOENT') {
        console.log('enoent')
        sendError(res, server, constants.HTTP_STATUS_NOT_FOUND);
      } else {
        sendError(res, server, constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
    });
  }
}

function validateCache(req, res, stat, server) {
  const lastModified = stat.mtime.toUTCString()
      , notModified  = (lastModified === util.getHeader(req, 'if-modified-since'));
      
  res.headers['Date']          = new Date().toUTCString();
  res.headers['Last-Modified'] = lastModified;
  res.headers['Cache-Control'] = server.options.cacheHeaders;

  if (notModified) {  
    res.writeHead(constants.HTTP_STATUS_NOT_MODIFIED, res.headers);
    res.end();
    
    return true;
  } else {
    return false;
  }
}

function sendFile(fullPath, stat, req, res, serv) {
  res.headers['Content-Type'] = mime.lookup(fullPath);
  //res.headers['Content-Length'] = stat.size;

  if (serv.options.cache) {
    let notModified = validateCache(req, res, stat, serv);
    if (notModified) return;
    else {
      if (serv.options.encoding) {
        compress.sendCompressedFile(fullPath, util.getHeader(req, 'Accept-Encoding'), res);
      } else {
        pipeFile(fullPath, res);
      }
      return;
    }
  } else if (serv.options.encoding) {
    compress.sendCompressedFile(fullPath, util.getHeader(req, 'Accept-Encoding'), res);
    return;
  } else {
    pipeFile(fullPath, res);
  }
}

function sendError(res, server, code) { 
  res.writeHead(code);
  if (code === 404 && server.options.notFound !== '') {
    pipeFile(server.options.notFound, res, code);
  } else {
    res.end();
  } 
}

function pipeFile(fullPath, res, code) {
  res.writeHead(code || constants.HTTP_STATUS_OK, res.headers);

  fs.createReadStream(fullPath)
    .pipe(res);
}

module.exports = Server;