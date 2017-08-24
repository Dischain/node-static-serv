# [node-static-serv](https://github.com/Dischain/node-static-serv)

[node-static-serv](https://github.com/Dischain/node-static-serv) is a small configurable static server written on pure [node.js](https://nodejs.org). It allows you caching http responses, content encoding, CORS and simple logging to console or file. You may use it from your back-end code with multiple instances or serve static files with cli command.

## CLI usage

In order to run [node-static-server] from console, use command with next
syntax:

nss [path_to_config] | [path_to_root]

[path_to_config] - is the path to your `config.js` file, which determines
same options, as you may provide to configure server from JavaScript code.

// congig.js

module.exports = {
	root: './root',
	cache: true,
	gzip: true,
	port: 3000
}

[path-to-root] - path to your root folder, which static server should serve

Simple example:

```
nss ../myconf.js
```

In this case, you provide all nesessary data for server in `./myconf.js` file.
If no `root` field specified, the default root path should used (`./`).

```
nss ./public
```

In this case, you provide only the path to your public directory which you want
[node-static-server] serve. Default server configurations should be applied.

```
nss
```

Here [node-static-server] should run static server fully with the default configs.