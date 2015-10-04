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

var cradle = require('cradle');

var l10n_db = new (cradle.Connection)('127.0.0.1:5984', 5984, {
	cache	: false,
	raw		: false
}).database('l10n');

module.exports = function (grunt) {

	"use strict";

	grunt.registerTask('do_l10n', function () {

		grunt.combine.logger.write([{'taskhead': 'Localization'}]);

		var 
			pkg		= grunt.pkg,
			done	= this.async(),
			inj		= grunt.option('inj'),
			conf	= inj.get('conf'),
			mf		= conf.data.manifest,
			locales	= mf.locales;

		var procResult = function (err, result) {

			// Update the dependency object
			inj.set('locales', Object.keys(result));

			// Clobber the build if the extractor throws an error
			err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });

			// Iterate over the compiled source, and build a new source package
			// that contains (themes * locales)
			var tmpArr = [];

			inj.remove('source').add('source', pkg.source);

			pkg.source.forEach(function (theme) { 

				// Iterate over locales
				Object.keys(result).forEach(function (locale) {
					tmpArr.push({
						name: theme.name,
						l10n: locale,
						data: theme.data.replace(/%([\w\.])+%/g, function (key) {
							return result[locale][key.replace(/[%]+/g, "")] || key;
						})
					});
				});

			});

			// Update the source package
			pkg.source = tmpArr;

			// Log out the discovered locales
			locales.forEach(function (item) {
				if (result[item]) {
					grunt.combine.logger.write([{
						'custom': 'Locale: ' + item.bold
					}]);
				}
			});

			// And we're done
			grunt.combine.logger.write([{
				'pass': 'Passed'
			}, {
				'duration': 'Duration: '
			}]);

			done();
		};

		l10n_db.get(conf.data.manifest.application, function (err, doc) {

			if (err || !doc[conf.data.manifest.component]) {

				inj.remove('source').set('locales', ['en-US']).add('source', pkg.source);

				grunt.combine.logger.write([{
					'custom': 'Localization database connection error: \n' + JSON.stringify(err, null, 2)
				}, {
					'duration': 'Duration: '
				}]);

				done();
			}

			else {
				procResult(null, doc[conf.data.manifest.component]);
			}
		});

	});

};