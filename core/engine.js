/**
 * @author: xuweichen
 * @date: 12-12-6 下午3:02
 * @descriptions
 */
function Engine(options){
    this.options = options;
}

function getFileData(file, gap){
    var info, fileStr;

    if(isArray(file)){
        fileStr = file.join(gap);
        file = file[0];
    }
    info = file.split('.');
    return {
        name: info[0],
        file: fileStr
    }
};
var exec = require('child_process').exec,
    Log = require('../lib/util/log.js'),
    Util = require('../lib/util/helper.js'),
    isArray = Array.isArray,
    logger = new Log();

Engine.prototype={
    compile: function(file, callback){
        var options = this.options,
            out;

        out = exec(Util.replace(options.commandLine, getFileData(file, options.gap)));
        out.on('stdout', function(data){
            callback && callback(data);
            logger.log(data, Log.NORMAL);
        });
        out.on('stderr', function(data){
            logger.log(data, Log.ERROR);
        });
    },
    setCompiler: function(){

    }
}