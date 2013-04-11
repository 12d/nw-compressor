/**
 * @author: xuweichen
 * @date: 12-12-6 下午2:58
 * @descriptions
 */

var defaultConfig = {
    gap: ' --js ',
    commandLine: 'java -jar E:\\tools\\compiler-latest\\compiler.jar --js ${file}'
}
function Compiler(){
    var conf = defaultConfig;
    this.commandLine = conf.commandLine;
    this.gap = conf.gap;
}
Compiler.prototype = function(){
    constructor: Compiler
};

module.exports = Compiler;