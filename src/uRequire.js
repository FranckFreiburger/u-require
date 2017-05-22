// equivalent to require from node.js
require.cache = [];

function require(url) {
	
	var filenamePos = url.lastIndexOf('/')+1;
	var extDotPos = url.indexOf('.', filenamePos);

	if ( extDotPos === -1 )
		url += '.js';
	
	var exports = require.cache[url];
	
	if ( !exports ) {
		
		try {
			exports = {};
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, false); // sync
			xhr.send();
			if ( xhr.status < 200 || xhr.status >= 300 )
				throw new Error( xhr.statusText );
			
			var module = { id: url, uri: url, exports: exports };

			function childRequire(childUrl) {
				
				return require((childUrl.substr(0,2) === './' ? url.substr(0, filenamePos) : '') + childUrl);
			}

			Function('exports', 'require', 'module', xhr.responseText).call(module.exports, module.exports, childRequire, module);
			require.cache[url] = exports = module.exports;
		} catch (err) {
			
			throw new Error( 'Error loading module '+url+': '+err );
		}
	}
	
	return exports;
}
