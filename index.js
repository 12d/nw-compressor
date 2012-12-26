/**
 * @author: xuweichen
 * @date: 12-12-12 上午9:59
 * @descriptions
 */
var Version = require('./core/version.js'),
    DB = require('./core/database.js');

var db = new DB();
db.connect('E:\\cxw\\version-ctrl\\s\\j\\data\\version.json', function (){
    vers = new Version(db);
    vers.refresh('/s/j/app/promo.js');
    //db.close();
});


