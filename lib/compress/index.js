'use strict';

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

  let codings = acceptEncodingValue.split(',');

  let preferableEncoding;

  // Handle empty field-value
  if (codings.length === 1 && codings[0] === '') {
    preferableEncoding = 'identity';
  } 
  else if (codings.length === 1) {
    const coding = codings[0];
    // Handle matching any content-coding by single "*" symbol
    if (coding === '*') {
      preferableEncoding = 'identity';
    } 
    else if (coding.split(';')[0] === '*') {
      // Hdnle case when single content-coding restricts 'identity'
      if (coding.split(';')[1] === 'q=0') {
        preferableEncoding = 'gzip';
      } else {
        preferableEncoding = 'identity';
      }
    }
  }
  // Handle multiple content-codings and select one with the highest 
  // non-zero qvalue
  else {
    let mostQValuedCodingObj = codings.reduce((init, item) => {
      const keyval = item.split(';')
      const curCoding = keyval[0],
          curQvalue = parseFloat(keyval[1].slice(2));

      if (init.q < curQvalue)
        return init = {
          coding: curCoding,
          q: curQvalue
        };
      else 
        return init;
      
    }, {coding: 'identity', q: 0});

     preferableEncoding = mostQValuedCodingObj.coding.trim();     
  }
  
  return preferableEncoding === '*' ? 
    'identity' :
    preferableEncoding;
}

module.exports = {
  getEncoding: getEncoding
};