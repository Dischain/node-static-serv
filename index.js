'use strict';

const http = require('http')
        , path = require('path')
        , url    = require('url')
        , fs      = require('fs');

let publicDir = './public';
//publicDir = path.normalize(path.resolve(root || '.'));
// for testing:
const publicDirPath = path.normalize(path.resolve(publicDir));;

http.createServer(function (req, res) {
  const reqPath = url.parse(req.url).pathname;
  const reqFullPath = path.join(publicDirPath, reqPath);

  fs.exists(reqFullPath, function(exists) {
    if (!exists) { 
      res.statusCode = 404; 
      res.end(`File ${reqFullPath} not foud, mother fucker! :)`);
      return;
    }

    /*if (fs.statSync(pathName).isDirectory()) {
      reqFullPath += '/index.html';
    }*/

    fs.readFile(reqFullPath, function(err, data) {
      if (err) { res.statusCode(500); res.end(`Error getting file: ${err}`); }
      else {
        const ext  = path.parse(reqFullPath).ext;

        res.end(data);
      }
    });
  });
}).listen(3000, function() { console.log('server is now  running on port 3000'); });

/*******************************************************/

// options passed to constructorL
// cache - max cache life time
// host, port, root, defaults for index.html,
// x-powered-by (Boolean)
// gzip

// available methods - get and head.

// in constructor check minimum required data - only root.
// if it not specified, throw an error
  /*if (!root) {
    throw new TypeError('root path required')
  }

  if (typeof root !== 'string') {
    throw new TypeError('root path must be a string')
  }*/


// inherit from EventEmitter

Server.prototype.run = function start() {
  this._server = http.createServer(handler).listem(opts.port);  
}

StaticServer.prototype.stop = function stop() {
  if (this._socket) {
    this._socket.close();
    this._socket = null;
  }
}

function handler(req, res) {
  // handle req.url`s (dont forget normalize path) etc...
    
  // emit on request
  
  // check whether http-method is valid
  // if not, send 
  /*res.statusCode = 405
  res.setHeader('Allow', 'GET, HEAD')
  res.setHeader('Content-Length', '0')
  res.end()*/

  // get stat
  // - handle dir and file
  // if this is dir, check index.html. if exists only .htm,
  // send this .htm with 301.
  // implement sendFile func via stream.pipe().

  // implement sendError(req,res, err) func.
  /*if (err) {
    sendError(server, req, res, null, HTTP_STATUS_NOT_FOUND);
  } else {
    res.status = HTTP_STATUS_NOT_FOUND;
    sendFile(server, req, res, stat, file);
  }*/

  // set headers 'X-Powered-By', 'Cache-Control', cors etc...
  /*res.setHeader('Content-Type', currentMime)
  res.setHeader('Content-Length', Buffer.byteLength(doc))
  res.setHeader('Content-Security-Policy', "default-src 'self'")
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if x-powered by specified, set it with `name`*/
}

// validate http method
// validate path
// get path
// get stats
// handle error
// send response (return only headers if it is HEAD)