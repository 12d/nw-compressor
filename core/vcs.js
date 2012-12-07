/**
 * @author: xuweichen
 * @date: 12-12-6 下午4:52
 * @descriptions
 */
function VCS (plugin){
    this.plugin = plugin;
}


function runProcess(runner, onSuccess, onError){
    var exitHandler = function (){
        onSuccess && onSuccess();
    };

    runner.stdout.on('data', function(data){
        logger.log(data, Log.NORMAL);
        runner.removeListener('exit', exitHandler);
        onSuccess && onSuccess(data);
    });
    runner.stderr.on('data', function(data){
        //console.log(data);
        logger.log(data, Log.ERROR);
        onError && onError(data);
    });
    runner.on('exit', exitHandler);
}
var exec = require('child_process').exec,
    Log = require('../lib/util/log.js'),
    logger = new Log();


VCS.prototype = {
    checkout: function (files, callback){
        runProcess(exec(this.plugin.checkout(files)), function(data){
            callback && callback();
        }, function(data){
            console.log(data);
        });
    },
    checkin: function (files, callback){
        runProcess(exec(this.plugin.checkin(files)), function(data){
            callback && callback();
        }, function(data){

        });
    },
    add: function (files, callback){
        runProcess(exec(this.plugin.add(files)), function(data){
            logger.log(data);
            callback && callback();
        }, function(data){

        });
    }
}
module.exports = VCS;