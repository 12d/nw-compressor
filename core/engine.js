/**
 * @author: xuweichen
 * @date: 12-12-6 下午3:02
 * @descriptions
 */

function Engine(plugin){
    this.compiler = plugin;
}

function getFileData(file, gap){
    var name, fileStr;

    fileStr =  file;
    if(isArray(file)){
        fileStr = file.join(gap);
        file = file[0];
    }
    name = file.replace(/\.js$/, '');
    return {
        name: name,
        file: fileStr
    }
};
var exec = require('child_process').exec,
    Util = require('../lib/util/helper.js'),
    isArray = Array.isArray,
    Log = require('../lib/util/log.js'),
    logger = Log.currentLogger;

Engine.prototype={
    /**
     * @param file
     * @param {Function} [callback]
     */
    compile: function(file, callback){
        var compiler = this.compiler,
            exitHandler = function (){
                callback && callback();
            },
            out;

        out = exec(Util.replace(compiler.commandLine, getFileData(file, compiler.gap)));
        out.stdout.on('data', function(data){
            callback && callback(data);
            out.removeListener('exit', exitHandler);
            Log.currentLogger.log(data, Log.NORMAL);
        });
        out.stderr.on('data', function(data){
            Log.currentLogger.log(data, Log.ERROR);
        });
        out.on('exit', exitHandler);
    },
    /**
     *
     * @param {Buffer} fileData
     * @param callback
     */
    compileData: function (fileData, callback){

    },
    setCompiler: function(compiler){
       this.compiler = compiler;
    }
}
module.exports = Engine;