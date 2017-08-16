'use strict';

const zlib   = require('zlib')
    , fs     = require('fs')
    , stream = require('stream')
    
    , util  = require('../util')
    , cache = require('./cache.js');

const defaultOpts = {
  flush:    zlib.Z_NO_FLUSH,
  memlevel: zlib.Z_BEST_COMPRESSION,
  strategy: zlib.Z_DEFAULT_STRATEGY,
  defaultFunc: 'gzip'
};

function sendCompressedFile(fullPath, acceptEncodingValue, res/*, opts*/) {
  console.log('sendCompressedFile: starting compression')
  const path     = fullPath;

  const encoding = getEncoding(acceptEncodingValue) === 'identity'
                   ? defaultOpts.defaultFunc
                   : getEncoding(acceptEncodingValue);

  console.log('sendCompressedFile: encoding is ' + encoding);

  const options  = /*opts ? opts : */defaultOpts;
  console.log('sendCompressedFile: options are ' + options);

  const zlibFunc = zlib[util.getZlibFuncByEncoding(encoding)];
  console.log('sendCompressedFile: zlibFunc is ' + zlibFunc);

  res.headers['Content-Encoding'] = encoding;
  // use constant here
  res.writeHead(200, res.headers);
  console.log('sendCompressedFile: res headers wrote')
  if (cache.get(path)) {
    console.log('cache exists')
    pipeTo(cache.get(path), res, zlibFunc);
  } else {
    console.log('sendCompressedFile: cache not exists')
    let readStream = fs.createReadStream(path)
      , buffers    = [];

    readStream.on('data', (chunk) => {
      buffers.push(chunk);
    });

    readStream.on('end', () => {
      let resultBuffer = Buffer.concat(buffers);
      console.log(resultBuffer)
      cache.set(path, resultBuffer);
      pipeTo(resultBuffer, res, zlibFunc);
    });
  }
}

function pipeTo(buffer, writable, func) {
  console.log('pipeTo: start')
  /*fs.createReadStream(buffer)
      .pipe(func.call(null))
      .pipe(writable);*/
  let bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  writable.on('end', () => {
    console.log('end')
    writable.end();
  });

  bufferStream.pipe(func.call(null))
      .pipe(writable);
}

/**
 * This function pasre the 'Accept-Encoding' request header field and 
 * return most preferred content-coding according to RFC 2616 section 
 * 14.3 algorithm.
 *
 * @param {String} acceptEncoding
 * @returns {String} most preferred content-coding
 */
function getEncoding(acceptEncodingValue) {
  // Implementation notes:
  //   1. If the content-coding accompanied by a qvalue of 0 - it is 
  //      not acceptable.
  //   2. If special "*" symbol occures, then use default `identity` 
  //      encoding
  //   3. If multiple content-codings are acceptable, then the 
  //      content-coding with the highest non-zero qvalue is preferred
  //   4. If the field includes "*;q=0" and does not explicitly include 
  //      the "identity" content-coding, then its refused. If the 
  //      `Accept-Encoding` field-value is empty, then only the `identity` 
  //       encoding is acceptable.
  console.log('start getting encoding')
  console.log('acceptEncodingValue: ' + acceptEncodingValue)
  let codings = acceptEncodingValue.split(',');

  let preferableEncoding;

  // Handle empty field-value
  if (codings.length === 1 && codings[0] === '') {
    preferableEncoding = 'identity';
    console.log('getEncoding: ' + preferableEncoding)
  } 
  else if (codings.length === 1) {
    const coding = codings[0];
    // Handle matching any content-coding by single "*" symbol
    if (coding === '*') {
      preferableEncoding = 'identity';
      console.log('getEncoding: ' + preferableEncoding)
    } 
    else if (coding.split(';')[0] === '*') {
      // Hdnle case when single content-coding restricts 'identity'
      if (coding.split(';')[1] === 'q=0') {
        preferableEncoding = 'gzip';
        console.log('getEncoding: ' + preferableEncoding)
      } else {
        preferableEncoding = 'identity';
        console.log('getEncoding: ' + preferableEncoding)
      }
    }
  }
  // Handle multiple content-codings and select one with the highest 
  // non-zero qvalue
  else {
    console.log('getEncoding: multiple')
    console.log(codings)

    let mostQValuedCodingObj = codings.reduce((init, item) => {

      const keyval = item.split(';');
      const curCoding = keyval[0];
      
      let curQvalue;

      if (keyval.length === 1) {
        curQvalue = 0;
      } else {
        curQvalue = parseFloat(keyval[1].slice(2));
      }

      console.log('curCoding: ' + curCoding + ' curQvalue: ' + curQvalue);
      if (init.q < curQvalue)
        return init = {
          coding: curCoding,
          q: curQvalue
        };
      else 
        return init;
      
    }, {coding: 'identity', q: 0});
    console.log('mostQValuedCodingObj: ' + mostQValuedCodingObj);
    preferableEncoding = mostQValuedCodingObj.coding.trim();     
  }
  console.log('preferableEncoding: ' + preferableEncoding);
  return preferableEncoding === '*' ? 
    'identity' :
    preferableEncoding;
}

module.exports = {
  sendCompressedFile: sendCompressedFile
};

