/**
 * @author: xuweichen
 * @date: 12-12-6 下午4:52
 * @descriptions
 */
function VCS (plugin){
    this.plugin = plugin;
}
function runProcess(runner, onSuccess, onError){
    runner.on('stdout', function(data){
        logger.log(data, Log.NORMAL);
        onSuccess && onSuccess(data);
    });
    runner.on('stderr', function(data){
        logger.log(data, Log.ERROR);
        onError && onError(data);
    });
}
var exec = require('child_process').exec,
    Log = require('../lib/util/log.js'),
    logger = new Log();

VCS.prototype = {
    checkout: function (files){
        runProcess(exec(this.plugin.checkout(files)), function(data){

        }, function(data){

        });
    },
    checkin: function (files){
        runProcess(exec(this.plugin.checkin(files)), function(data){

        }, function(data){

        });
    }
}
module.exports = VCS;