'use strict';

const path = require('path')
	, url  = require('url');

/*                         Cache
********************************************************************/

function capitalizeFirst (str) { 
	return str.charAt(0).toUpperCase() + str.slice(1); 
}

function getZlibFuncByEncoding (encoding) { 
	return 'create' + capitalizeFirst(encoding); 
}

function getFullPath (req, root) {
	const pathName = path.normalize(url.parse(req.url).pathname)
	return path.join(root, pathName);
}