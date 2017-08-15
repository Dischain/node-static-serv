'use strict';

const path = require('path')
    , url  = require('url')
    , fs   = require('fs');

/*                           Cache
********************************************************************/
function getHeader(message, header) {
  return message.headers[header];
}

/*                         Gzip Cache
********************************************************************/

function getZlibFuncByEncoding (encoding) { 
  return 'create' + _capitalizeFirst(encoding); 
}

function getFullPath (req, root) {
  const pathName = path.normalize(url.parse(req.url).pathname)
  return path.join(root, pathName);
}

function _capitalizeFirst (str) { 
  return str.charAt(0).toUpperCase() + str.slice(1); 
}

/*                           Common
********************************************************************/

function getStat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stat) => {
      if (err) return reject(err)
      resolve(stat);
    });
  });
}

module.exports = {
  getHeader: getHeader,

  getZlibFuncByEncoding: getZlibFuncByEncoding,
  getFullPath: getFullPath,

  getStat: getStat
};