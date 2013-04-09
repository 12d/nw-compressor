/**
 * @author: xuweichen
 * @date: 12-12-12 上午9:59
 * @descriptions
 */
(function ($){


var Version = require('./core/version.js'),
    Releaser = require('./core/releaser.js'),
    Path = require('./lib/util/path.js'),
    Log = require('./lib/util/log.js'),
    DB = require('./core/database.js'),

    logger = new Log($('#J_logger'));

var db = new DB({
        onSaved: function(){
            var url,
                data = vers.getUpdated();

            for(url in data){
//                console.log(data[url].version);
                releaser.release(Path.realpath(url), data[url].version);
            }
        }
    }),
    vers,
    releaser = new Releaser();

//go into directory, like cd-command in linux
Path.goto('E:\\cxw\\version-ctrl\\');


app = {
    init: function (){
        var btn = $('#J_compile'),
            list = $('#J_fileList'),
            self = this;

        btn.bind('click', function(e){
            e.preventDefault();

            var fileList = list.val().split('\n');
            fileList && self.compile(fileList);
        });
        logger.log('app ready!');
    },
    compile: function (files){
        logger.log('database connecting');
        db.connect('E:\\cxw\\version-ctrl\\s\\j\\data\\version.json', function (){
            logger.log('database connected');
            var len = files.length,
                file;

            vers = new Version(db);
            while(len--){
                file = files[len];
                file && vers.refresh(file, function(){
                    logger.log(file+" [ok]");
                });
            }
            db.close();
        });
    }
}


})(jQuery)