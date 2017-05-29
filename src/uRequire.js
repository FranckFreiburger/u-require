// equivalent to require from node.js
require.cache = {};

require.httpRequest = function(url) {

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false); // sync
	xhr.send();
	if ( xhr.status < 200 || xhr.status >= 300 )
		throw new Error( xhr.statusText );
	return xhr.responseText;
}

require.extensions = {
	'.js': function(module, url) {
		
		var responseText = require.httpRequest(url);

		try {

			Function('exports', 'require', 'module', responseText).call(module.exports, module.exports, module.require, module);
		} catch (err) {
			
			throw new Error( 'Error loading module '+url+': '+err );
		}
	}
}

function require(url) {
	
	var exports = require.cache[url];
	
	if ( !exports ) {
		
		var filenamePos = url.lastIndexOf('/')+1;
		var extDotPos = url.indexOf('.', filenamePos);
		var extension = extDotPos !== -1 ? url.substr(extDotPos) : '.js';
		
		function childModuleRequire(childUrl) {

			var isRelative = childUrl.substr(0,2) === './' || childUrl.substr(0,3) === '../';
			return require((isRelative ? url.substr(0, filenamePos) : '') + childUrl);
		}

		exports = {};
		var module = { id: url, exports: exports, require:childModuleRequire };
		require.extensions[extension](module, url);
		require.cache[module.id] = exports = module.exports;
	}
	
	return exports;
}
