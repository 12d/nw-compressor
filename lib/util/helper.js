/**
 * @author: xuweichen
 * @date: 12-12-6 下午4:37
 * @descriptions
 */
/**
 * copy all properties in the supplier to the receiver
 * @param r {Object} receiver
 * @param s {Object} supplier
 * @param or {boolean=} whether override the existing property in the receiver
 * @param cl {(Array.<string>)=} copy list, an array of selected properties
 */
function mix(r, s, or, cl) {
    if (!s || !r) return r;
    var i = 0, c, len;
    or = or || or === undefined;

    if (cl && (len = cl.length)) {
        for (; i < len; i++) {
            c = cl[i];
            if ( (c in s) && (or || !(c in r) ) ) {
                r[c] = s[c];
            }
        }
    } else {
        for (c in s) {
            if (or || !(c in r)) {
                r[c] = s[c];
            }
        }
    }
    return r;
};

function replace(tpl, data){
    var key;
    for(key in data){
        tpl = tpl.replace(new RegExp("\\$\\{"+key+"\\}", 'gi'), data[key]);
    }
    return tpl;
};

module.exports = {
    mix: mix,
    replace: replace,
    formatDate: function (date, format) { //author: meizz
        var self = date,
            fmt = format;

        var o = {
            "M+": self.getMonth() + 1, //月份
            "d+": self.getDate(), //日
            "h+": self.getHours(), //小时
            "m+": self.getMinutes(), //分
            "s+": self.getSeconds(), //秒
            "q+": Math.floor((self.getMonth() + 3) / 3), //季度
            "S": self.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (self.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
}