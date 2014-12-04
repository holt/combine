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

// Normalize paths to RFC 3986.3.3
module.exports = function (path) {

    path = path.replace(/\\+/g, '\\');
    path = path.split(/[\\+]|[/+]/g);

    path[path.length - 1] || path.pop();
    return path.join('/') + '/';
};