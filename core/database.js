/**
 * @author: xuweichen
 * @date: 12-12-26 上午11:28
 * @descriptions
 */
var fs = require('fs');

Database.CONNECTING = 1;
Database.CONNECTED = 2;
Database.CLOSED = 0;
/**
 * @event
 * onSaved, updated database successfully
 */

function Database(options){
    var self = this;

    self.options = options||{};
    self.status = Database.CLOSED;
}
Database.prototype = {
    constructor: Database,
    close: function (){
        var self = this,
            onSaved = self.options.onSaved;

        if(!self._data) throw new Error('no database opened');
        fs.writeFile(self.connection, JSON.stringify(self._data), function (err) {
            if(err) throw new Error(err);
            onSaved && onSaved.call(self, self._data);
            self._data = null;
        });

        self.status = Database.CLOSED;
    },
    /**
     *
     * @param {File|DBURI} source
     */
    connect: function(source, callback){
        var self = this;
        self.connection = source;
        self.status = Database.CONNECTING;
        fs.readFile(source, function (err, content){
            //JSON.parse is much more effecial, but will thow error when parsing comments text
            self._data = new Function('return '+content.toString())();
            self.status = Database.CONNECTED;
            callback && callback();
        });

        return self;
    },
    update: function(key, val, callback){
        if(!key || !val) return;

        var item = this._data[key]||{};
        item.last = item.version||1;
        item.version = val;
        item.timestamp = +new Date;
        this._data[key] = item;
        callback && callback(val);
        return this;
    },
    /**
     * insert is the same as update, because current database is a  hash-table
     * @param key
     * @param val
     */
    insert: function (key, val){
        //if(!!key || !!val) return;
        //this._data[key] = val;
    },
    query: function (key, callback){
        if(!key) return;
        callback(this._data[key]);
        return this;
    },
    queryAll: function (callback){
        callback(this._data);
        return this;
    }

}
module.exports = Database;