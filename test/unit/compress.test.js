'use strict';

const expect = require('chai').expect
    , compress = require('../../lib/compress/');
    
describe('Compress', () => {
  describe('getEncoding', () => {
    const getEncoding = compress.getEncoding;
  
    it ('Should handle cases when passed an empty field value', () => {
      expect(getEncoding('')).to.equal('identity');
    });
    
    it ('Should handle cases when passed only a "*" symbol', () => {
      expect(getEncoding('*')).to.equal('identity');
    });
    
    it ('Should handle cases when passed single content-coding which '
      + 'restricts "identity"', () => {
      expect(getEncoding('*;q=0')).to.equal('gzip');
      expect(getEncoding('*;q=1.0')).to.equal('identity');
    });

    it ('Should handle cases when passed multiple content-codings', () => {
      expect(getEncoding('*;q=0, compress;q=0.5, gzip;q=0.7')).to.equal('gzip');
      expect(getEncoding('*;q=0, compress;q=0.8, gzip;q=0.7')).to.equal('compress');
    });
  });
});