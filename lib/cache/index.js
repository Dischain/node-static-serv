'use strict';

let _cache = {};

function set(key, val) { _cache[key] = val; }

function get(key) { return _cache[key]; }

module.exports = {
  set: set,
  get: get
};