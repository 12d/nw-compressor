/**
 * @author: xuweichen
 * @date: 12-12-6 下午2:57
 * @descriptions
 */
function serializeFiles(files){
    return '';
}

var Utils = require('../util/helper.js'),
    VCSPlugin = function (options){
        var DEFAUT_OPTIONS = {
            path: 'tfs'
        }
        this.options = Utils.mix(DEFAUT_OPTIONS, options);
        this.path = this.options.path;
    }
VCSPlugin.prototype = {
    /** tf command line: tf checkout /recursive D://a//b//c.js */
    checkout: function(files){
        return this.path + serializeFiles(files);
    },
    checkin: function(files){
        return this.path + serializeFiles(files);
    }
}