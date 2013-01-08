/**
 * @author: xuweichen
 * @date: 13-1-7 下午2:46
 * @descriptions
 */
var Util = require('../lib/util/helper.js'),
    fs = require('fs'),
    rJsFile = /\.js$/;

function Releaser(options){
    var DEFAULT_OPTIONS = {
            releaseDir: ''
        },
        self = this;

    self.options = Util.mix(DEFAULT_OPTIONS, options||{});

}
function copyFile(dir, newDir){
    fs.readFile(dir, function(err, data){
        console.log(err);
        console.log(newDir);
        fs.writeFile(newDir, data);
    });
}
function addVersion(file, version){
    return file.replace(rJsFile, '.v'+version+'.js');
}
Releaser.prototype = {
    constructor: Releaser,
    release: function (file, version){
//        var self = this;
        copyFile(file, addVersion(file, version));
    }
}

module.exports = Releaser;
