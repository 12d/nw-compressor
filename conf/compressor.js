/**
 * @author: xuweichen
 * @date: 12-12-6 下午2:57
 * @descriptions
 */
module.exports = {
    compilers: {
        google:{
            gap: ' --js ',
            commandLine: 'java -jar E:\\tools\\compiler-latest\\compiler.jar --js ${file}'
        },
        yui: {
            gap: '',
            commandLine: ''
        }
    },
    vcs: 'tfs',
    compiler: 'googleclosure'
}