const Server = require('./lib/server.js');

module.exports = Server;
new Server({
  root: '../',
  cache: true, 
  encoding: true,
  cors: true, 
  name: 'dischain-serv',
  notFound: './404.html',
  logToConsole: true,
  logToFile: true,
  logFile: './syslog.log'
}).start();