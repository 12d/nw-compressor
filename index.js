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
    Helper = require('./lib/util/helper.js'),
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
    releaser = new Releaser(),
    configs = {
        DB_PATH : 'E:\\cxw\\version-ctrl\\s\\j\\data\\version.json',
        versionTableTpl: $('#J_versionTableTpl').html()
    },
    Pages;

//go into directory, like cd-command in linux
Path.goto('E:\\cxw\\version-ctrl\\');


function makeRender(tpl){
    var renderOne = function (data){
        var key,
            oneHtml = tpl;

        for(key in data){
            oneHtml = oneHtml.replace(new RegExp('\\${'+key+'}',"ig"), data[key]);
        }
        return oneHtml;
    };

    return function (data){
        var html="";
        if(Array.isArray(data)){
            data.forEach(function (item){
                html+=renderOne(item);
            });
        }else{
            html = renderOne(data);
        }
        return html;
    }
};

function renderVersionTable(data){
    var tpl = configs.versionTableTpl,
        render = makeRender(tpl),
        formatDate = Helper.formatDate,
        formatTpl = 'yyyy-MM-dd hh:mm:ss',
        html="",
        item,
        key;

    for(key in data){
        item = data[key];
        item.file = key;
        item.date = formatDate(new Date(item.timestamp), formatTpl);
        html+=render(item);
    }
    return html;
}

//init function for each sub-page
Pages = {
    queryVersion: function (){
        db.connect(configs.DB_PATH, function (){
            console.log(this);
            db.queryAll(function(data){
                $('#J_queryVersionList').html(renderVersionTable(data));
            });
        })
    }
}

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

        //init tab for homepage
        $('#J_menuIndex a').on('click', function (e){
            var self = $(this);

            e.preventDefault();
            self.tab('show');
            console.log(self.attr('href'));
            if(self.attr('href')==='#J_queryVersion'){
                Pages.queryVersion();
            }
        })

    },
    compile: function (files){
        logger.log('database connecting');
        db.connect(configs.DB_PATH, function (){
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