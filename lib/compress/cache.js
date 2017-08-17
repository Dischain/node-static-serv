'use strict';

let _cache = {};

function set(key, val) { 
  _cache[key] = val; 
}

function get(key) { 
  return _cache[key]; 
}

function existsKey(key) { 
  console.log('exists: ' + new Boolean(_cache[key]).valueOf());
  return new Boolean(_cache[key]).valueOf(); 
}

module.exports = {
  set: set,
  get: get,
  existsKey: existsKey
};