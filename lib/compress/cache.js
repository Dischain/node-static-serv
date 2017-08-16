'use strict';

let _cache = {};

function set(key, val) { _cache[key] = val; }

function get(key) { 
	console.log('cache: get')
	return _cache[key]; 
}

module.exports = {
  set: set,
  get: get
};