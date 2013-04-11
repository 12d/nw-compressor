/**
 * @author: xuweichen
 * @date: 12-12-6 下午4:44
 * @descriptions
 */
var NOOP = function(){};

function Log(panel){
    this.log = !panel? console.log: this._writeLine;
    this.panel = panel;
    Log.currentLogger = this;
//    panel.val('');
}
Log.ERROR = 0;
Log.NORMAL = 1;
Log.prototype = {
    constructor: Log,
    log: NOOP,
    _writeLine: function (txt){
        var panel = this.panel;
        panel.val("["+new Date().toLocaleString()+"] :"+txt+"\n"+panel.val());
    }
};
module.exports = Log;