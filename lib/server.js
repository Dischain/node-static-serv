'use strict';

const path = require('path') // <- remove
    , url  = require('url') // <- remove
    , http = require('http')
    , fs   = require('fs')
    , mime = require('mime')

    , util     = require('./util')
    , compress = require('./compress');

const HTTP_STATUS_OK           = 200
    , HTTP_STATUS_NOT_MODIFIED = 304
    , HTTP_STATUS_NOT_FOUND    = 404;

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
  name: 'node.js'
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

  this.options.root = path.resolve(path.normalize(this.options.root));
  console.log(this.options)
}

Server.prototype.start = function start(callback) {
  this._server = http.createServer(handler(this))
                     .listen(this.options.port, this.options.host, callback);
};

Server.prototype.stop = function stop() {
  if (this._server) {
    this._server.close();
    this._server = null;
  }
};

function handler(server) {
  return function(req, res) {
    // const pathname  = url.parse(req.url).pathname
    //   , fullPath = path.join(server.options.root, pathname);
    const fullPath = util.getFullPath(req, server.options.root);

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
        sendFile(path.join(fullPath, 'index.html'), stat, req, res, server);
      } else {
        sendFile(fullPath, stat, req, res, server);
      }
    }).catch((err) => {
      if (err.code == 'ENOENT') {
        console.log(err);

        sendError(res, server);
      }
    });
  } 
}

function validateCache(req, res, stat, server) {
  console.log('validateCache: start validate')

  const lastModified = stat.mtime.toUTCString()
      , notModified  = (lastModified === util.getHeader(req, 'if-modified-since'));
  
  console.log(lastModified + ' ' + notModified);
    
  res.headers['Date']          = new Date().toUTCString();
  res.headers['Last-Modified'] = lastModified;
  res.headers['Cache-Control'] = server.options.cacheHeaders;

  console.log('validateCache: notModified value is ' + notModified);

  if (notModified) {

    console.log('validateCache: notModified');

    res.writeHead(HTTP_STATUS_NOT_MODIFIED, res.headers);
    res.end();
    return true;
  } else {
    console.log('validateCache: modified');
    return false;
  }
}

function sendFile(fullPath, stat, req, res, serv) {
  console.log('sendFile: sending file ' + fullPath);

  res.headers['Content-Type'] = mime.lookup(fullPath);
  res.headers['Content-Length'] = stat.size;
  if (serv.options.cache) {

    console.log('sendFile: cache available')

    if (!validateCache(req, res, stat, serv)) {
      if (serv.options.encoding) {
        console.log('sendFile: encoding available');
        compress.sendCompressedFile(fullPath, util.getHeader(req, 'Accept-Encoding'), res);
      } else {
        console.log('sendFile: encoding not available');
        pipeFile(fullPath, res);
      }
    }
  } else {
    pipeFile(fullPath, res);
  }
}

function pipeFile(fullPath, res) {
  console.log('pipeFile: start piping')
  
  res.writeHead(HTTP_STATUS_OK, res.headers);

  fs.createReadStream(fullPath)
    .pipe(res);
  
  console.log('pipeFile: piping complete')
}

module.exports = Server;