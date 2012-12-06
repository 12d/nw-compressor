/**
 * @author: xuweichen
 * @date: 12-12-6 下午2:54
 * @descriptions
 */

var config = require('./conf/compressor.js'),
    Engine = require('./core/engine.js'),
    VCS = require('.core/vcs.js'),
    VCSPlugin = require('./lib/vcs/'+config.vcs+'.js'),
    Compressor,
    vcs, engine;

vcs = new VCS(new VCSPlugin);
engine = new Engine({

});

Compressor = function(vcs, engine){
    this.vcs = vcs;
    this.engine = engine;
};

Compressor.prototype = {
    compress: function(dir){
        vcs.checkout();
        engine.compiler('dir');
        vcs.checkin();
    }
};

var compressor = new Compressor(vcs, engine);
engine.setCompiler('google');
compressor.compress();






