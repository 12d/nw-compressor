/**
 * @author: xuweichen
 * @date: 12-12-12 上午9:59
 * @descriptions
 */
var Version = require('./core/version.js'),
    Releaser = require('./core/releaser.js'),
    Path = require('./lib/util/path.js'),
    DB = require('./core/database.js');

var db = new DB(),
    releaser = new Releaser();

db.connect('E:\\cxw\\version-ctrl\\s\\j\\data\\version.json', function (){
    vers = new Version(db);
    vers.refresh('/s/j/app/promo.js');
    releaser.release(Path.realpath('/s/j/app/promo.js'), 8);
    //db.close();
});