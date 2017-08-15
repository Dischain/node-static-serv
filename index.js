const Server = require('./lib/server.js');

module.exports = Server;
new Server({
  cache: true, 
  encoding: true,
  cors: true, 
  name: 'dischain-serv'}).start();