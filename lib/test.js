'use strict';

const path = require('path') // <- remove
    , url  = require('url') // <- remove
    , http = require('http')
    , fs   = require('fs')
    , zlib = require('zlib')
    , stream = require('stream');

const root = path.resolve(path.normalize('./'));;

let _cache = {};

function set(key, val) { 
  console.log('set: ' + key);
  _cache[key] = val; 
}

function get(key) { 
  console.log('get: ' + key);
  console.log(Object.keys(_cache));
  return _cache[key]; 
}

function existsKey(key) {
  console.log(new Boolean(_cache[key]).valueOf());
  return new Boolean(_cache[key]).valueOf();
}

http.createServer((req, res) => {
  const fullPath = getFullPath(req, root);

  exists(fullPath)  
  .then(() => {
    res.writeHead(200, {'Content-Encoding': 'gzip'})
        
    try {
      if (existsKey(fullPath)) {
        console.log('getting cache');

        pipeTo(get(fullPath), res);
      } else {
        let readStream = fs.createReadStream(fullPath)
          , buffers = [];

        readStream.on('data', (chunk) => {
          buffers.push(chunk);
        });

        readStream.on('end', () => {
          let resultBuffer = Buffer.concat(buffers);

          set(fullPath, resultBuffer);
          pipeTo(resultBuffer, res);
        });
      }
    } catch (e) {
      console.log(e)
    }
  })
  .catch(() => {
    res.write('404 Not Found');
    res.writeHead(404)
    res.end();
  });

}).listen(4000, () => { console.log('listening on port 4000'); });

function pipeTo(buffer, writable) {
  
  let bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  writable.on('end', () => {
    console.log('end')
    writable.end();
  });

  bufferStream.pipe(zlib.createGzip())
      .pipe(writable);
}

function getFullPath (req, root) {
  const pathName = path.normalize(url.parse(req.url).pathname);

  return path.join(root, pathName);
}

function exists(fullPath) {
  return new Promise((resolve, reject) => {
    fs.exists(fullPath, (exist) => {
      if (!exist) return reject();
      resolve(exist);
    })
  })
}