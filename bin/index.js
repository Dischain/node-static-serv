#!/usr/bin/env node

'use strict';

const fs = require('fs');

const Server = require('../lib/server.js');

function createServer(opts) { 
  new Server(opts).start(() => {
    if (Object.keys(opts).length === 0) {
      console.log('Server started on default port at this folder');
    }
  }); 
}

// @returns false if no errors, true if contains errors
function checkErrors(args, output) {
  if (args.length === 1 && !fs.existsSync(args[0])) {
    output('nss: no such file or directory, ' + args[0]);

    return true;
  } else if (args.length >= 2) {
    output('nss: wrong arguments\n' + getHelpMsg());

    return true;
  } else {
    return false; 
  }
}

function getOpts(path) {
  let opts = {};

  if (fs.statSync(path).isDirectory()) {
    opts.root = path ;
  } else {
    opts = require(path);
  }

  return opts;
}

function getHelpMsg() {
  return 'nss is a simple static server based on Node.js\n'
                        + 'Syntax:\n\n'
                        + 'nss [path_to_config] | [path_to_root]\n\n'
                        + '[path-to-root]   - path to your root folder, which static server should serve\n'
                        + '[path_to_config] - is the path to your `config.js` file\n\n'
                        + '--help - print this help and exit';
}

function parseArgs(consoleArgs, output) {
  const args = Array.prototype.slice.call(consoleArgs, 1);

  if (args[0] === '--help') {
    return output(getHelpMsg());
  }

  if (!checkErrors(args, output)) {
    const opts = getOpts(args[0]);

    createServer(opts);
  }
}

parseArgs(process.argv, console.log);