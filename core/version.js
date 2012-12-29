/**
 * @author: xuweichen
 * @date: 12-12-26 上午11:13
 * @descriptions
 */
function Version (database, options){
    var self = this;

    self.database = database;
    self.options = options||{};
}
Version.prototype = {
    constructor: Version,
    /**
     * refresh version of file specified
     * @param {String} file, file path
     * @param {int} [version], version number
     * @param {Function} [callback]
     */
    refresh: function (file, version, callback){
        var db = this.database;
        if(typeof version == 'function'){
            callback = version;
            version = undefined;
        }
        !version && db.query(file, function (item){
            db.update(file, parseInt(item && item.version||0)+1, callback);
        }) || db.update(file, version, callback);
        return this;
    },
    rollback: function (callback){
        this.database.update(file, version, callback);
        return this;
    },
    save: function(){
        this.database.close();
    }
}
module.exports = Version;
