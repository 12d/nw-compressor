/**
 * @author: xuweichen
 * @date: 12-12-6 下午2:54
 * @descriptions
 */

var
    Compressor,
    vcs, engine;

Compressor = function(engine, vcs){
    this.vcs = vcs;
    this.engine = engine;
};

Compressor.prototype = {
    /**
     * @param {File|Directory} files, files need to compress
     */
  /*  compress: function(files){
        var self = this,
            vcs = self.vcs;

        vcs.checkout(files, function(){
            self.engine.compile(files, function(){
                vcs.add(files, function(){
                    vcs.checkin(files);
                });
            });
        });
    },*/
    /**
     *
     * @param file
     * @param callback
     */
    compress: function (file, callback){
        var self = this;

        self.engine.compile(file, function(stdout){
            callback && callback(stdout);
        });
    }

};
//var compressor = new Compressor(vcs, engine);

module.exports = Compressor;

