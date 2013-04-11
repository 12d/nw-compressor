/**
 * @author: xuweichen
 * @date: 13-1-7 下午2:46
 * @descriptions
 */
var Util = require('../lib/util/helper.js'),
    Log = require('../lib/util/log.js'),
    fs = require('fs'),
    path = require('path'),
    rJsFile = /\.js$/;

const RELEASE_DIR = '\\min\\';

function Releaser(options){
    var DEFAULT_OPTIONS = {
            releaseDir: ''
        },
        self = this;

    self.compressor = options.compressor;
    self.options = Util.mix(DEFAULT_OPTIONS, options||{});

};

function mkdirs(dirpath, mode, callback){
    fs.exists(dirpath, function(isExist ) {
//        console.log(isExist);
        if(isExist) {
            callback && callback(dirpath);
        } else {
            mkdirs(path.dirname(dirpath), mode, function(){
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
}
function makeReleaseDir(baseDir){
    console.log(path.dirname(baseDir));
    return path.dirname(baseDir) + RELEASE_DIR + path.basename(baseDir);
}
function copyFile(dir, newDir){
  /*  fs.readFile(dir, function(err, data){
        if(err) throw new Error('err');
        newDir = makeReleaseDir(newDir);
        mkdirs(path.dirname(newDir), 777, function (){
            console.log(data);
            fs.writeFile(newDir, data);
            Log.currentLogger.log('<<'+newDir+'>> [done]');
        });
    });*/

}
function addVersion(file, version){
    return file.replace(rJsFile, '.v'+version+'.js');
}
Releaser.prototype = {
    constructor: Releaser,
    release: function (file, version, beforeRelease, afterRelease){
        var self = this;
        self.compressor.compress(file, function (stdout){
            var newDir = addVersion(file, version);
            newDir = makeReleaseDir(newDir);
            beforeRelease && beforeRelease(newDir);
            mkdirs(path.dirname(newDir), 777, function (){
                fs.writeFile(newDir, stdout);
                afterRelease && afterRelease(newDir);
                Log.currentLogger.log('<<'+newDir+'>> [done]');
            });
        });
//        copyFile(file, addVersion(file, version));
    }
}

module.exports = Releaser;
