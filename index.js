/**
 * @author: xuweichen
 * @date: 12-12-12 上午9:59
 * @descriptions
 */
var Version = require('./core/version.js'),
    Releaser = require('./core/releaser.js'),
    Path = require('./lib/util/path.js'),
    DB = require('./core/database.js');

var db = new DB({
        onSaved: function(data){
            var url;
            for(url in data){
                releaser.release(Path.realpath(url), data[url].version);
            }
        }
    }),
    releaser = new Releaser();
//go into directory, like cd-command in linux
Path.goto('E:\\cxw\\version-ctrl\\');
db.connect('E:\\cxw\\version-ctrl\\s\\j\\data\\version.json', function (){
    vers = new Version(db);
    vers.refresh('/s/j/app/promo.js');
    db.close();
});