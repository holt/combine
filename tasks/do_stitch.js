/* jshint bitwise:true, curly:false, eqeqeq:true, forin:true, immed:false, 
latedef:true, newcap:true, noarg:true, noempty:false, nonew:true, plusplus:false, 
regexp:false, undef:true, unused:vars, strict:false, trailing:false, asi:false, 
boss:true, debug:false, eqnull:false, es5:false, esnext:false, evil:false, expr:true, 
funcscope:true, globalstrict:false, iterator:false, lastsemic:false, laxbreak:true, 
laxcomma:true, loopfunc:false, multistr:false, onecase:false, proto:false, 
regexdash:false, scripturl:false, smarttabs:true, shadow:false, sub:false, esnext:true,
supernew:false,  browser:true, couch:false, devel:false, dojo:false, jquery:true, 
mootools:false, node:false, nonstandard:false, prototypejs:false, rhino:false, strict:false,
wsh:false, nomen:false, onevar:false, passfail:false, white:true, indent:4 */
/* global require, module */

var 
	stitch		= require('stitch'),
	normpath	= require('../utils/normpath');

// Used to determine if a normalized file path for an entry in the Stitch compileCache
// object is also present in the manifest.json whitelist...
var test = function (arr, file) {
	return arr.some(function (element) {
		element = normpath(element).slice(0, -1).toLowerCase();
		return normpath(file).toLowerCase().indexOf(element) !== -1;
	});
};

module.exports = function (grunt) {

	"use strict";

	grunt.registerTask('do_stitch', function () {

		grunt.combine.logger.write([{ 'taskhead': 'Stitch' }]);

		var 
			inj			= grunt.option('inj'),
			conf		= inj.get('conf'),
			done		= this.async(),
			pkg			= {},
			manifest	= conf.data.manifest,
			include		= manifest.include || false;

		if (include) {

			var mainjs = (manifest.main || 'main') + '.js',
				maincf = (manifest.main || 'main') + '.coffee';

			include.push(mainjs);
			include.push(maincf);

		}

		pkg = stitch.createPackage({
			paths: [conf.paths.src]
		});

		/* This step isn't really to compile the JS into a stitched package, but allows us
		to access a "compileCache" - an array of all the files we have stitched. This is 
		useful if we want to modify individual files first... */
		pkg.compile(function (err) {

			err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });

			var file = null;

			for (file in pkg.compileCache) {

				if (pkg.compileCache.hasOwnProperty(file)) {

					if (include ? test(include, file) : true) {
						pkg.compileCache[file].source = '' 
							+ '\n\n'
							+ '/* Original CommonJS module source: ' + file.replace(/\\/g, '/').replace(conf.paths.src, '') + ' */\n'
							+ '(function () {\'use strict\';\n'
							+   pkg.compileCache[file].source 
							+ '}.call(window));'
							+ '\n\n';
					}
					else {
						delete pkg.compileCache[file].source;
					}
				}
			}
			
			// This step *actually* stitches the newly updated compileCache
			pkg.compile(function (err, source) {

				err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });

				pkg.source  = source;
				grunt.pkg   = pkg;

				grunt.combine.logger.write([{
					'pass': 'Passed'
				}, {
					'duration': 'Duration: '
				}], {
					silent: true
				});

				done();
				
			});
		});
	});
};