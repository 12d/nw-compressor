/**
 * @author: xuweichen
 * @date: 12-12-6 下午2:57
 * @descriptions
 */
function serializeFiles(files){
    !Array.isArray(files) && (files = [files]);
    return files.join(' ');
}
function appendMinSuffix(files){
    !Array.isArray(files) && (files = [files]);
    files.forEach(function(value, key){
        files[key] = value.replace(/\.js$/, '.min.js');
    });
    return files;
}
var Utils = require('../util/helper.js'),
    VCSPlugin = function (options){
        var DEFAUT_OPTIONS = {
            path: 'tf'
        }
        this.files = '';
        this.options = Utils.mix(DEFAUT_OPTIONS, options);
        this.path = this.options.path;
    };
/**
 * @class
 * vcs pugin for tfs, generate command line for tf
 */
VCSPlugin.prototype = {
    /**
     * @public
     * @param {Array}, files list
     * @returns {String}, command line for tf
     *  <code> tf checkout /recursive D://a//b//c.js </code>
     */
    checkout: function(files){
        this.files = serializeFiles(appendMinSuffix(files));
        return this.path + ' checkout /recursive '+ this.files;
    },
    checkin: function(files){
        return this.path + ' checkin '+files+' /recursive /comment:"Compiler: compress javascript!" '+ this.files;
    },
    add: function(files){
        return this.path + ' add /recursive '+ files;
    }
}

module.exports = VCSPlugin;