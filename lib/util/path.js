/**
 * @author: xuweichen
 * @date: 13-1-7 下午5:36
 * @descriptions
 */
var platform = require('os').platform(),
    current='/',
    rSlash = /\//g;
    isWin = /win/.test(platform);

var realpath = (function (){
    return isWin ? function (relative){
        console.log(current);
        return (current+relative).replace(rSlash, '\\');
    } : function (relative){   //mac or linux

    }
})();
/**
 *
 * @param {String} path, realpath like 'D:/a/b'
 */
function goto(path){
    current = path||'/';
}
exports.realpath = realpath;
exports.goto = goto;