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
    /**
     *
     * @param {File|Directory} files, files need to compress
     */
    compress: function(files){
        var vcs = this.vcs;
        vcs.checkout(files);
        this.engine.compiler(files);
        vcs.checkin(files);
    }
};

var compressor = new Compressor(vcs, engine);
engine.setCompiler('google');
compressor.compress('a.js');






