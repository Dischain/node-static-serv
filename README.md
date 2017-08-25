# [node-static-serv](https://github.com/Dischain/node-static-serv)
[node-static-serv](https://github.com/Dischain/node-static-serv) is a small configurable static server written on pure [node.js](https://nodejs.org). It allows you caching http responses, content encoding, CORS and simple logging to console or file. You may use it from your back-end code with multiple instances or serve static files with cli command.
Simple example:
```javascript
var Server = require('node-static-serv');

var options = { root: './public', cache: true, encoding: true, port: 3000}

var server = new Server(options);
server.start();
```

## API

### Class Server([options])

Create new instance of [node-static-serv](https://github.com/Dischain/node-static-serv)with the given options. All options are optional.
- ```options <Object>```
    - ```cache <Boolean>``` - enables caching mechanism. Allows to use conditional ```GET``` semantics for request messages, which includes ```If-Modified-Since```  field by providing ```Last-Modified``` value. Also uses ```Cache-Control``` header to provide explicit directives to the HTTP caches. By default this field value set to  ```false```    
    - ```cacheHeaders <String>``` - value of ```Cache-Control``` header. Bu default set to ```private, max-age=3600, must-revalidate```  
    - ```encoding <Boolean>``` - allows documents to be compressed without loss of information. Server fully implements an [RFC-2616](https://tools.ietf.org/html/rfc2616) algorithm to select most preferred content-coding from client request header field ```Accept-Encoding```.  Also it uses local in-memory cache to store already compressed documents, which reduces cpu-intensive compression algorithms calls. This value is ```false``` by default   
    - ```cors <Boolean>``` enables cross-origin requests. ```false``` by default    
    - ```host <String>``` by default set to ```127.0.0.1```    
    - ```port <Number>``` by default set to ```3000```  
    - ```root <String>``` path to directory to serve. By default set to ```./```   
    - ```name <String>``` value of ````X-Powered-By``` header. Set to ```node.js``` by default   
    - ```logToFile <Boolean>``` enable logging to file. If ```logFile``` options field not specified, shold log to file with defalut path    
    - ```logFile <String>``` path to log file. By defalut set to ```syslog.file```   
    - ```logToConsole <Boolean>``` enable console logging   
    - ```notFound <String>``` path to standart '404 Not Found' html file. If not specified, server should respond with empty body and ```404``` code

### server.start([callbacl])

- ```callback <Function>```
Start server instance and call the given callback.

### server.stop([callbacl])

- ```callback <Function>```
Stop the server and call the given callback.

## CLI usage

In order to run [node-static-serv](https://github.com/Dischain/node-static-serv) from console, use command with next syntax:

```nss [path_to_config] | [path_to_root]```

- ```[path_to_config]``` - is the path to your ```config.js``` file, which determines same options, as you may provide to configure server from JavaScript code.

```javascript
// config.js

module.exports = { root: './root', cache: true, gzip: true, port: 3000}
```

- ```[path-to-root]``` - path to your root folder, which static server should serve.
Simple example:

```shell
nss ../myconf.js
```

In this case, you provide all nesessary data for server in `./myconf.js` file. If no `root` field specified, the default root path should used (`./`)

```shell
nss ./public
```

In this case, you provide only the path to your public directory which you want [node-static-server](https://github.com/Dischain/node-static-serv) to serve. Default server configurations should be applied.

```shell
nss
```
Here [node-static-server](https://github.com/Dischain/node-static-serv) should run static server with fully default configs.