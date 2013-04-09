console.log('pack');
cQuery.config('allowDebug',true);
window.replace = function() {
    return ''
};
window.replace = function() {
    return ""
};
;(function($){
    var cls={
        name:'address',
        version:'1.0',
        init:function(){},
        uninit:function(){},
        module:address
    };

    // * @cfg {integer} FOCUS_INTERVAL 检测输入延迟
    // * @default 100
    var FOCUS_INTERVAL=100;
    // * @cfg {object} ADDITION_EVENT 自定义事件列表
    var ADDITION_EVENT={
        'change':1,
        'userinput':1
    };
    // * @cfg {string} EVENT_TAIL 自定义事件后缀
    var EVENT_TAIL='_'+cls.name+'_'+cls.version;

    function address(obj,opt){
        this._init(obj,opt);
    }

    $.extend(address.prototype,{
        //public property

        /**
         * @cfg {htmlElement} target input元素
         */
        target:null,
        target_get:function(){
            return this.target;
        },

        /**
         * @cfg {htmlElement} name input元素
         */
        name:null,
        name_get:function(){
            return this.name;
        },
        name_set:function(t){
            this.name=t;
            this._checkEnable();
        },

        delay:0,

        /**
         * @cfg {object} source 数据源
         * <pre>
         格式
         {
             //别名
             alias:['pinyin','cityName','cityId'],
             //推荐城市
             suggestion:{
                 '热门城市':[
                     {display:'北京',data:'Beijing|北京|2'},
                     {display:'上海',data:'Shanghai|上海|2'}
                 ],
                 '常用城市':[
                     {display:'天津',data:'Tianjin|天津|3'}
                 ],
             },
             data:'@Aletai|阿勒泰|AAT|@Xingyi|兴义|ACX|@Baise|百色|AEB|@Ankang|安康|AKA|@...@'	//完整数据
         }
         </pre>
         */
        source:null,
        source_get:function(key){
            if (key){
                if (key in this.source){
                    return $.copy(this.source[key]);
                }else{
                    $.error('mod ('+cls.name+','+cls.version+') source_get','invalid key '+key);
                    return null;
                }
            }else{
                return $.copy(this.source);
            }
        },
        source_set:function(val){
            if (val){
                this.source=$.extend(this.source||{},val);
            }else{
                this.source=null;
            }
            this._refresh();
        },

        /**
         * @cfg {string} jsonpSource jsonp数据源url
         */
        jsonpSource:null,
        jsonpSource_get:function(){
            return this.jsonpSource;
        },
        jsonpSource_set:function(val){
            this.jsonpSource=val;
            //refresh display
            if (val){
                this.source=null;
                this.jsonpSource=val;
                $.loader.jsonp(this.jsonpSource,{
                    charset:this.charset,
                    onload:(function(data){
                        //alert(this.jsonpSource+"\r\n\r\n"+data.data);
                        this.source_set(data);
                    }).bind(this)
                });
            }else{
                if (this.source){
                    this.jsonpSource=null;
                }else{
                    $.error('mod ('+cls.name+','+cls.version+') jsonpSource_set','invalid source '+val);
                }
            }
            //todo
        },

        /**
         * @cfg {string} jsonpFilter jsonp过滤数据源url
         * <pre>
         包含
         ${key} {string} 查询关键词
         ${accurate} {string} 是否精确匹配，0或1

         返回格式
         {
             //查询值
             key:'xx',
             //数据
             data:"@...@",
         //缓存时间，分钟(todo)
         cache:60
         }
         </pre>
         */
        jsonpFilter:null,
        jsonpFilter_get:function(){
            return this.jsonpFilter;
        },
        jsonpFilter_set:function(val){
            this.jsonpFilter=val;
            //refresh display
            //todo
        },

        /**
         * @cfg {array} sort 数据排序方式，对jsonpFilter数据无效
         * <pre>
         格式
         [^]列号|别名[+][$]
         ^ 头部匹配
         $ 尾部匹配
         + 当前及之后字段匹配
         </pre>
         * @default ['^0$','^1$','^3+$','^0','^1','^3+','0','1','3+']
         */
        sort:['^0$','^1$','^3+$','^0','^1','^3+','0','1','3+'],
        sort_get:function(){
            return $.copy(this.sort);
        },
        sort_set:function(val){
            this.sort=$.copy(val);
            this._sortReString=null;
            this._refresh();
        },

        /**
         * @cfg {object} display 数据展示方式
         * <pre>
         left 左栏显示列号或别名
         right 右栏显示列号或别名
         suggestion 推荐栏显示列号或别名
         value 填入值显示列号或别名
         </pre>
         * @default <pre>
         {
             left:0,
             right:1,
             suggestion:1,
             value:1
         }</pre>
         */
        display:{
            left:0,
            right:1,
            suggestion:1,
            value:1
        },
        display_get:function(key){
            if (key){
                if (key in this.display){
                    return $.copy(this.display[key]);
                }else{
                    $.error('mod ('+cls.name+','+cls.version+') display_get','invalid key '+key);
                    return null;
                }
            }else{
                return $.copy(this.display);
            }
        },
        display_set:function(val){
            if (val){
                $.extend(this.display,val);
            }else{
                this.display={};
            }
            this._refresh();
        },

        /**
         * @cfg {object} relate 关联元素
         * <pre>
         格式
         列号|别名:选择器|dom对象|cQuery对象

         样例
         {
             0:'#hidden1',
             1:'#hidden2'
         }
         </pre>
         */
        relate:{},
        relate_get:function(key){
            if (key){
                if (key in this.relate){
                    return $.copy(this.relate[key]);
                }else{
                    $.error('mod ('+cls.name+','+cls.version+') relate_get','invalid key '+key);
                    return null;
                }
            }else{
                return $.copy(this.relate);
            }
        },
        relate_set:function(val){
            if (val){
                this.relate=$.copy(val);
            }else{
                this.relate={};
            }
            this._refresh();
        },

        /**
         * @cfg {object} message 提示文字
         * <pre>
         suggestion 推荐城市提示文字
         filterResult 过滤结果提示文字
         noFilterResult 过滤无结果提示文字
         </pre>
         * @default <pre>
         {
             suggestion:'从下列城市选择',
             filterResult:'${val}，按拼音排序',
             noFilterResult:'对不起，找不到：${val}'
         }
         </pre>
         */
        message:{
            suggestion:'从下列城市选择',
            filterResult:'${val}，按拼音排序',
            noFilterResult:'对不起，找不到：${val}',
            sort:[]
        },
        message_set:function(val){
            if (val){
                $.extend(this.message,val);
            }else{
                this.message={};
            }
            this._refresh();
        },
        message_get:function(key){
            if (key){
                if (key in this.message){
                    return $.copy(this.message[key]);
                }else{
                    $.error('mod ('+cls.name+','+cls.version+') message_get','invalid key '+key);
                    return null;
                }
            }else{
                return $.copy(this.message);
            }
        },

        /* offset todo */
        offset:null,
        offset_set:function(val){
            if (val){
                this.offset=$.copy(val);
            }else{
                this.offset=null;
            }
            this._refresh();
        },
        offset_get:function(val){
            return $.copy(this.offset);
        },

        /**
         * @cfg {integer} minLength 过滤的最小输入长度
         * @default 1
         */
        minLength:1,

        /**
         * @cfg {boolean} isAutoCorrect 是否自动纠正输入值
         * @default false
         */
        isAutoCorrect:false,

        /**
         * @cfg {boolean} isFocusNext 是否在选择后自动定位到当前form下一个输入框
         * @default false
         */
        isFocusNext:false,

        /**
         * @cfg {object} template 模板
         * <pre>
         格式
         {
             //推荐模板
             suggestion:'...',
             //推荐样式
             suggestionStyle:'...',
             //推荐初始化
             suggestionInit:function(){...},
             //过滤模板
             filter:'...',
             //过滤样式
             filterStyle:''
             //过滤初始化
             filterInit:function(){...},
         }

         数据格式
         suggestion:{
			data:{
				group1:[
					{display:'...',data:'...|...|...'},
					{display:'...',data:'...|...|...'}
				],
				group2:[
					{display:'...',data:'...|...|...'},
					{display:'...',data:'...|...|...'}
				]
			},
			message:{
				suggestion:'...',
			}
		}
         filter:{
			val:'...',
			hasResult:true|false,
			list:[
				{left:'...',right:',,,','data':'...|...|...'},
				{left:'...',right:',,,','data':'...|...|...'}
			]|null,
			page:{
				max:10,
				current:1
			},
			message:{
				filterResult:'...',
				noFilterResult:'...'
			}
		}
         </pre>
         */
        template:{
            suggestion:'\
				<div class="c_address_box">\
					<div class="c_address_hd">${message.suggestion}</div>\
					<div class="c_address_bd">\
						<ol class="c_address_ol">\
							{{enum(key) data}}\
								<li><span>${key}</span></li>\
							{{/enum}}\
						</ol>\
						{{enum(key,arr) data}}\
							<ul class="c_address_ul layoutfix">\
								{{each arr}}\
									<li><a data="${data}" href="javascript:void(0);">${display}</a></li>\
								{{/each}}\
							</ul>\
						{{/enum}}\
					</div>\
				</div>\
			',
            suggestionStyle:'\
				.c_address_box { background-color: #fff; font-size: 12px; width: 290px; }\
				.c_address_box a { text-decoration: none; }\
				.c_address_hd { height: 24px; border-color: #2C7ECF; border-style: solid; border-width: 1px 1px 0; background-color: #67A1E2; color:#CEE3FC; line-height: 24px; padding-left: 10px; }\
				.c_address_hd strong{color:#fff;}\
				.c_address_bd { border-color: #999999; border-style: solid; border-width: 0 1px 1px; overflow: hidden; padding:10px; }\
				.c_address_ol { margin:0; padding:0 0 20px; border-bottom: 1px solid #5DA9E2; }\
				.c_address_ol li { color: #005DAA; cursor: pointer; float: left; height: 20px; line-height: 20px; list-style-type: none; text-align: center; }\
				.c_address_ol li span { padding:0 8px; white-space:nowrap; display:block; }\
				.c_address_ol li .hot_selected { display:block; padding:0 7px; background-color: #FFFFFF; border-color: #5DA9E2; border-style: solid; border-width: 1px 1px 0; color: #000000; font-weight: bold; }\
				.c_address_ul { width: 100%; margin:0; padding: 4px 0 0; }\
				.c_address_ul li { float: left; height: 24px; overflow: hidden; width: 67px; }\
				.c_address_ul li a { display: block; height: 22px;  border: 1px solid #FFFFFF; color: #1148A8; line-height: 22px; padding-left: 5px; }\
				.c_address_ul li a:hover { background-color: #E8F4FF; border: 1px solid #ACCCEF; text-decoration: none; }\
			',
            suggestionInit:defaultSuggestionInit,
            filter:'\
				<div class="c_address_select">\
					<div class="c_address_wrap">\
						<div class="c_address_hd">{{if hasResult}}{{tmpl message.filterResult}}{{else}}{{tmpl message.noFilterResult}}{{/if}}</div>\
						<div class="c_address_list" style="">\
							{{each (i,item) list}}\
								{{if cQuery.type(item)=="string"}}\
									<label>${item}</label>\
								{{else}}\
									<a href="javascript:void(0);" data="${data}" style="display: block;"><span>${left}</span>${right}</a>\
								{{/if}}\
							{{/each}}\
						</div>\
						{{if page.max>-1}}\
							<div class="c_address_pagebreak" style="display: block;">\
								{{if page.current>0}}\
									<a href="javascript:void(0);" page="${page.current-1}">&lt;-</a>\
								{{/if}}\
								{{if page.current<2}}\
									{{loop(index) Math.min(5,page.max+1)}}\
										<a href="javascript:void(0);"{{if page.current==index}} class="address_current"{{/if}} page="${index}">${index+1}</a>\
									{{/loop}}\
								{{else page.current>page.max-2}}\
									{{loop(index) Math.max(0,page.max-4),page.max+1}}\
										<a href="javascript:void(0);"{{if page.current==index}} class="address_current"{{/if}} page="${index}">${index+1}</a>\
									{{/loop}}\
								{{else}}\
									{{loop(index) Math.max(0,page.current-2),Math.min(page.current+3,page.max+1)}}\
										<a href="javascript:void(0);"{{if page.current==index}} class="address_current"{{/if}} page="${index}">${index+1}</a>\
									{{/loop}}\
								{{/if}}\
								{{if page.current<page.max}}\
									<a href="javascript:void(0);" page="${page.current+1}">-&gt;</a>\
								{{/if}}\
							</div>\
						{{/if}}\
					</div>\
				</div>\
			',
            filterStyle:'\
				.c_address_hd { height: 24px; border-color: #2C7ECF; border-style: solid; border-width: 1px 1px 0; background-color: #67A1E2; color: #fff; line-height: 24px; padding-left: 10px; }\
				.c_address_bd { border-color: #999999; border-style: solid; border-width: 0 1px 1px; overflow: hidden; padding:10px; }\
				.c_address_select { width:222px; height:355px; font-family: Arial, Simsun; font-size: 12px; }\
				.c_address_wrap { width: 220px; height:349px; min-height: 305px; margin: 0; padding: 0 0 4px; border: 1px solid #969696; background:#fff; text-align: left; }\
				.c_address_hd { margin:-1px; }\
				.c_address_list { margin: 0; padding: 0; height:300px; }\
				.c_address_list label { border-bottom: 1px solid #FFFFFF; border-top: 1px solid #FFFFFF; display: block; height: 22px; line-height: 22px; min-height: 22px; overflow: hidden; padding: 1px 9px 0; text-align: center; }\
				.c_address_list span { float: right; font: 10px/22px verdana; margin: 0; overflow: hidden; padding: 0; text-align: right; white-space: nowrap; width: 110px; }\
				.c_address_list a { border-bottom: 1px solid #FFFFFF; border-top: 1px solid #FFFFFF; color: #0055AA; cursor: pointer; display: block; height: 22px; line-height: 22px; min-height: 22px; overflow: hidden; padding: 1px 9px 0; text-align: left; text-decoration: none; }\
				.c_address_list a.hover { background: none repeat scroll 0 0 #E8F4FF; border-bottom: 1px solid #7F9DB9; border-top: 1px solid #7F9DB9; }\
				.address_selected { background: none repeat scroll 0 0 #FFE6A6; color: #FFFFFF; height: 22px; }\
				.c_address_pagebreak { line-height: 25px; margin: 0; padding: 0; text-align: center; }\
				.c_address_pagebreak a { color: #0055AA; display: inline-block; font-family: Arial, Simsun, sans-serif; font-size: 14px; margin: 0; padding: 0 4px; text-align: center; text-decoration: underline; width: 15px; }\
				a.address_current { color: #000; text-decoration: none; }\
			',
            filterInit:defaultFilterInit,
            filterPageSize:12
        },

        //public method

        /**
         * @ method validate
         * 验证输入有效性
         * @param {boolean} 是否为精确匹配
         * @param {function} 回调函数，第一个参数为验证结果
         * @return {boolean} 返回验证结果，jsonpFilter方式下，返回值始终为false
         */
        validate:function(isAccurate,fn){
            var _this=this;
            var val=this.target.value().trim().replace(/[\|@]/g,'');
            if (!val){
                this._unselect(true,true);
                return false;
            }
            if (this.jsonpFilter){
                this._filterDataByJsonp(this.jsonpFilter,val,isAccurate,true,function(data){
                    if (data){
                        _this._select(data,true);
                        fn&&fn(true);
                    }else{
                        _this._unselect(false,true);
                        fn&&fn(false);
                    }
                });
                return false;
            }else{
                var data=this._filterData(this.source.data,val,isAccurate,true);
                if (data){
                    this._select(data,true);
                    fn&&fn(true);
                    return true;
                }else{
                    this._unselect(false,true);
                    fn&&fn(false);
                    return false;
                }
            }
        },
        bind:function(types,handler,opt){
            this._event('bind',types,handler,opt);
            return this;
        },
        unbind:function(types,handler){
            this._event('unbind',types,handler);
            return this;
        },
        trigger:function(types,opt){
            this._event('trigger',types,opt);
            return this;
        },

        //private prperty
        _enable:false,
        _parentDocument:null,
        _parentWindow:null,
        _iframeDocument:null,
        _iframeWindow:null,
        _iframeObject:null,
        _iframeContainter:null,
        _lastIframeSize:null,
        _iframeClock:null,
        _iframeStyle:'width:0;height:0;position:absolute;top:-100000px;left:-100000px;z-index:200;',
        _placeHolder:$.browser.isIE?'<pre style="display:none;">placeholder</pre>':'',
        _isFocus:false,
        _focusClock:null,
        _checkClock:null,
        _tmpValue:null,
        _lastValue:null,
        _isCharIn:false,
        _suggestionContainer:null,
        _suggestionStyle:'position:absolute;top:-100000px;left:-100000px;z-index:200;',
        _isSuggestionRender:false,
        _filterContainer:null,
        _filterStyle:'position:absolute;top:-100000px;left:-100000px;z-index:200;',
        _sortReString:null,
        _displayRegExp:null,
        _displayHash:null,
        _colsHash:null,
        _lastFilterData:null,
        _lastFilterRendarData:null,
        _lastSelect:null,
        _suggestionEnable:false,
        _filterEnable:false,
        _filterCount:0,
        _selectFlag:false,
        _getLengthRe:/[^\x00-\xFF]/g,

        //private method
        _init:function(obj,opt){
            if (!opt.name||$.type(name)!='string'){
                $.error('mod ('+cls.name+','+cls.version+') init','invalid name '+name);
                return;
            }
            var _this=this;
            this.target=$(obj);
            this.name=opt.name;
            if (opt.delay&&$.type(opt.delay)=='number'&&opt.delay>0){
                this.delay=opt.delay;
            }
            this.source=opt.source||this.source;
            this.jsonpSource=opt.jsonpSource||this.jsonpSource;
            this.charset = opt.charset || cQuery.config("charset");
            if (!this.source){
                if (this.jsonpSource){
                    $.loader.jsonp(this.jsonpSource,{
                        charset:this.charset,
                        onload:(function(data){
                            this.source_set(data);
                        }).bind(this)
                    });
                }
            }
            this.jsonpFilter=opt.jsonpFilter||this.jsonpFilter;
            if (opt.sort&&$.type(opt.sort)=='array'){
                this.sort=opt.sort;
                this._sortReString=null;
            }
            if (opt.display){
                this.display=$.extend(true,{},this.display,opt.display);
            }
            this.relate=opt.relate||this.relate;
            if (opt.message){
                this.message=$.extend(true,{},this.message,opt.message);
            }
            if (opt.offset){
                this.offset=opt.offset;
            }
            this.minLength=opt.minLength||this.minLength;
            this.priority=opt.priority||this.priority;
            this.isAutoCorrect=opt.isAutoCorrect||this.isAutoCorrect;
            this.isFocusNext=opt.isFocusNext||this.isFocusNext;
            if (opt.template){
                this.template=$.extend(true,{},this.template,opt.template);
            }
            this.isIframe=(function(){
                if (opt.hasOwnProperty('isIframe')&&!opt.isIframe){
                    return false;
                }
                var doc=_this.target[0].ownerDocument;
                var win=doc.defaultView||doc.parentWindow;
                try{
                    var t=win.frameElement||!!opt.isIframe&&_this.target[0];
                    if (t){
                        _this._parentDocument=t.ownerDocument;
                        _this._parentWindow=_this._parentDocument.defaultView||_this._parentDocument.parentWindow;
                        _this._iframeObject=$(_this._parentDocument.createElement('iframe'));
                        _this._iframeObject.css(_this._iframeStyle);
                        _this._iframeObject[0].frameBorder=0;
                        _this._iframeObject.prependTo(_this._parentDocument.body);
                        _this._iframeObject.html('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="content-type" content="text/html; charset=utf-8" /><title>address</title><style>html,body{padding:0;margin:0;overflow:hidden;}</style></head><body></div></body></html>',function(){
                            _this._iframeWindow=_this._iframeObject[0].contentWindow||_this._iframeObject[0].window;
                            _this._iframeDocument=_this._iframeWindow.document;
                            _this._iframeContainer=$(_this._iframeDocument.createElement('container'));
                            _this._iframeContainer.css('position','absolute');
                            _this._iframeContainer.appendTo(_this._iframeDocument.body);
                        });
                    }
                    return !!t;
                }catch (e){
                    return false;
                }
            })();

            $.bindMethod(this);

            this._initTmpl();
            this._initEvent();
            this.uninit=this._uninit();
        },
        _initTmpl:function(){
            //todo
        },
        _initEvent:function(){
            this.target.bind('focus',this._focus);
            this.target.bind('blur',this._blur);
            this.target.bind('keydown',this._keydown);
            this.target.bind('keypress',this._keypress);
            this.target.bind('mouseup',this._mouseup);
            //addition
            this.target.bind('mousedown',this._focus);
            this.target.bind('keydown',this._focus);
        },
        _initCols:function(){
            if (this._colsHash){
                return;
            }
            var t=this._colsHash={};
            if (this.source.alias){
                for (var i=0,n=this.source.alias.length;i<n;i++){
                    this._colsHash[this.source.alias[i]]=i;
                }
            }
        },
        _initSort:function(){
            this._initCols();
            if (this._sortReString){
                return;
            }
            var t=this._sortReString={
                accurate:[],
                vague:[]
            };
            var k1=0,k2=0;
            for (var i=0,n=this.sort.length;i<n;i++){
                var arr=this.sort[i].match(/^(\^?)([^\^\$\|@\r\n\+]+)(\+?)(\$?)$/);
                if (arr){
                    if (/^\d$/.test(arr[2])){
                        arr[2]=parseInt(arr[2],10);
                    }else if (arr[2] in this._colsHash){
                        arr[2]=this._colsHash[arr[2]];
                    }else{
                        $.error('address._initSort','invalid sort column '+arr[2]);
                        continue;
                    }
                    var s=(+arr[2]||arr[3])?'([^\\|@]*\\|){'+arr[2]+(arr[3]?',':'')+'}':'';
                    t.accurate[k1++]=['@('+s,'','(\\|[^@]*)?)(?=@)'];
                    t.vague[k2++]=['@('+s+(arr[1]?'':'[^\\|@]*'),'',(arr[4]?'(\\|[^@]*)?':'[^@]*')+')(?=@)'];
                }else{
                    $.error('address._initSort','invalid sort rule '+this.sort[i]);
                }
            }
        },
        _initDisplay:function(){
            this._initCols();
            if (this._displayHash){
                return;
            }
            var t=this._displayHash={};
            var key,value;
            for (key in this.display){
                value=this.display[key];
                if (/^\d$/.test(value)){
                    t[key]=parseInt(value,10);
                }else if (value in this._colsHash){
                    t[key]=this._colsHash[value];
                }else{
                    t[key]=null;
                    $.error('address._initDisplay','invalid display column '+arr[1]);
                    continue;
                }
            }
        },
        _refresh:function(){
            //refresh display
            this._colsHash=null;
            this._sortReString=null;
            this._tmpValue=this._lastValue=null;
            this._isSuggestionRender=false;
            if (this._isFocus){
                this._inputCheck();
            }
        },
        _checkEnable:function(){

        },
        _focus:function(e){
            if (this._isFocus){
                if (this.source&&!this._suggestionEnable&&!this._filterEnable){
                    this._showSuggestion();
                }
                return;
            }
            this._isFocus=true;
            this._isCharIn=false;
            this._tmpValue=this._lastValue=null;
            this._clearFilter();
            this._inputCheck();
            clearTimeout(this._checkClock);
            clearInterval(this._focusClock);

            this._focusClock=setInterval(this._focusInterval,FOCUS_INTERVAL);
            if (this.isIframe){
                clearInterval(this._iframeClock);
                this._iframeClock=setInterval(this._fixIframeSize,FOCUS_INTERVAL);
            }
            var t=this.target[0];
            switch (e.type){
                case 'mousedown':
                    setTimeout(function(){
                        t.select();
                    });
                    break;
                case 'focus':
                    t.select();
                    break;
            }
        },
        _blur:function(){
            if (!this._isFocus){
                return;
            }
            var _this=this;
            this._isFocus=false;
            this._hiddenSuggestion();
            this._hiddenFilter();
            clearTimeout(this._checkClock);
            clearInterval(this._focusClock);
            if (this.isIframe){
                clearInterval(this._iframeClock);
            }
            if (!this._selectFlag){
                var v1=this.target.value();
                if (this.isAutoCorrect){
                    if (!this.source){
                        this._unselect(true,true);
                        return;
                    }else{
                        this._unselect(false,true);
                        this.validate(!this.isAutoCorrect,function(t){
                            if (!t){
                                _this._unselect(true,false);
                            }
                        });
                    }
                }
                var v2=this.target.value();
                this.trigger('userinput',{
                    arguments:{
                        value:v1,
                        autoCorrectValue:v2,
                        data:null
                    }
                });
            }
        },
        _keypress:function(){
            this._isCharIn=true;
        },
        _keydown:function(e){
            switch (e.keyCode){
                case 13:
                    if (this._filterEnable){
                        var t=this._lastSelect;
                        if (t){
                            var v1=this.target.value();
                            var data=t[0].getAttribute('data');
                            this._select(data);
                            var v2=this.target.value();
                            this.trigger('userinput',{
                                arguments:{
                                    value:v1,
                                    autoCorrectValue:v2,
                                    data:data
                                }
                            });
                        }
                    }
                    break;
                case 37: //preview page
                case 39: //next page
                    if (this._filterEnable){
                        var d=this._lastFilterRendarData;
                        if (d&&d.page.max>=0){
                            switch (e.keyCode){
                                case 37:
                                    if (d.page.current>0){
                                        this._updateFilter(null,null,d.page.current-1);
                                    }
                                    break;
                                case 39:
                                    if (d.page.current<d.page.max){
                                        this._updateFilter(null,null,d.page.current+1);
                                    }
                                    break;
                            }
                        }
                    }
                    break;
                case 38: //preview selection
                case 40: //next selection
                    if (this._filterEnable){
                        var t=this._lastSelect;
                        var d=this._lastFilterRendarData;
                        if (t!==null&&d){
                            var els=this._filterContainer.find('*[data]');
                            var i=els.indexOf(this._lastSelect);
                            if (i!=-1){
                                var l=d.list.length;
                                i=(i+l+e.keyCode-39)%l;
                                this._showHover(els[i]);
                            }
                        }
                    }
                    break;
                default:
                    if ($.browser.isIPadUCWeb){
                        this._isCharIn=true;
                    }
                    return true;
            }
            e.stop();
            return false;
        },
        _mouseup:function(){
            var t=this.target[0];
            if (t.releaseCapture){
                t.releaseCapture();
            }
        },
        _getLength:function(str){
            return str.replace(this._getLengthRe,'  ').length;
        },
        _focusInterval:function(){
            var val=this.target.value().trim().replace(/[\|@]/g,'');
            if (!this.source||this._tmpValue===val){
                return;
            }
            this._tmpValue=val;
            if (this.delay){
                clearTimeout(this._checkClock);
                this._checkClock=setTimeout(this._inputCheck,this.delay);
            }else{
                this._inputCheck();
            }
        },
        _inputCheck:function(){
            var val=this.target.value().trim().replace(/[\|@]/g,'');
            if (!this.source||this._lastValue===val){
                return;
            }
            if (this._lastValue!==null){
                this._isCharIn=true;
            }
            this._lastValue=val;
            if (this._getLength(val)>=this.minLength&&this._isCharIn){
                this._showFilter(val);
            }else{
                this._showSuggestion();
            }
        },
        _showSuggestion:function(){
            this._suggestionEnabled=true;
            this._hiddenFilter();
            this._clearFilter();
            //create
            if (!this._suggestionContainer){
                if (this.isIframe){
                    var el=this._iframeDocument.createElement('div');
                    el.id='address_suggestionContainer_'+this.target.uid();
                }else{
                    var el=document.createElement('div');
                    el.id='address_suggestionContainer_'+this.target.uid();
                    el.style.cssText=this._suggestionStyle;
                }
                this._suggestionContainer=$(el);
                this._suggestionContainer.bind('mousedown',this._filterMousedown);
            }
            //append
            this._suggestionContainer.appendTo(this.isIframe?this._iframeContainer:$.container);
            //render
            if (!this._isSuggestionRender){
                this._isSuggestionRender=true;
                var arr=[],k=0;
                if ($.type(this.template.suggestionStyle)=='string'){
                    arr[k++]=this._placeHolder+'<style>'+this.template.suggestionStyle.replace(/(\s*)([^\{\}]+)\{/g,'$1#'+this._suggestionContainer[0].id+' $2{')+'</style>';
                }
                var t={
                    data:this.source.suggestion,
                    message:this.message
                };
                arr[k++]=$.tmpl.render(this.template.suggestion,t);
                this._suggestionContainer.html(arr.join(''));
                if ($.type(this.template.suggestionInit)=='function'){
                    this.template.suggestionInit(this._suggestionContainer);
                }
            }
            if (this.isIframe){
                this._fixIframeSize();
                this._iframeObject.offsetA(this.target,this.offset);
            }else{
                this._suggestionContainer.offset(this.target,this.offset);
                this._suggestionContainer.cover();
            }
        },
        _fixIframeSize:function(){
            if (!this.isIframe){
                return;
            }
            var t=this._iframeContainer[0];
            var w=t.offsetWidth+'px';
            var h=t.offsetHeight+'px';
            if (this._lastIframeSize&&
                w==this._lastIframeSize.width&&
                h==this._lastIframeSize.height){
                return;
            }else{
                this._lastIframeSize={
                    width:w,
                    height:h
                };
                this._iframeObject.css(this._lastIframeSize);
            }
        },
        _hiddenSuggestion:function(){
            this._suggestionEnable=false;
            if (this._suggestionContainer){
                try{
                    this._suggestionContainer.remove();
                }catch(e){};
                if (this.isIframe){
                    this._iframeObject.css(this._iframeStyle);
                    this._lastIframeSize=null;
                }else{
                    this._suggestionContainer.css(this._suggestionStyle);
                    this._suggestionContainer.uncover();
                }
            }
        },
        _showFilter:function(val){
            this._filterEnable=true;
            this._filterCount++;
            this._hiddenSuggestion();
            //create
            if (!this._filterContainer){
                if (this.isIframe){
                    var el=this._iframeDocument.createElement('div');
                    el.id='address_filterContainer_'+this.target.uid();
                }else{
                    var el=document.createElement('div');
                    el.id='address_filterContainer_'+this.target.uid();
                    el.style.cssText=this._filterStyle;
                }
                this._filterContainer=$(el);
                this._filterContainer.bind('mouseover',this._filterMouseover);
                this._filterContainer.bind('mousedown',this._filterMousedown);
            }
            val=val.replace(/[\|@]/g,'');
            if (this.jsonpFilter){
                this._filterDataByJsonp(this.jsonpFilter,val);
            }else{
                this._filterData(this.source.data,val);
            }
        },
        _clearFilter:function(){
            this._lastFilterData=null;
            this._lastFilterRendarData=null;
            this._lastSelect=null;
        },
        _filterMouseover:function(e){
            var t=e.target;
            while (t&&t.tagName!='A'){
                t=t.parentNode;
            }
            if (t){
                var data=t.getAttribute('data');
                if (data){
                    this._showHover(t);
                    return;
                }
            }
        },
        _filterMousedown:function(e){
            var t=e.target;
            while (t&&t.tagName!='A'){
                t=t.parentNode;
            }
            if (t){
                var data=t.getAttribute('data');
                if (data){
                    if ($.browser.isIE) {
                        var _this = this;
                        //防止点击到下方的iframe广告
                        t.onclick = function () {
                            _this._select(data);
                        };
                        this._isSuggestionRender = false;
                    } else {
                        this._select(data);
                    }
                    var v1=this.target.value();
                    this.trigger('userinput',{
                        arguments:{
                            value:v1,
                            autoCorrectValue:v1,
                            data:data
                        }
                    });
                }
                var page=t.getAttribute('page');
                if (page){
                    this._updateFilter('','',+page);
                }
            }
            e.stop();
            t=this.target[0];
            if (t.setCapture){
                t.setCapture();
            }
            return false;
        },
        _hiddenFilter:function(){
            this._filterEnable=false;
            if (this._filterContainer){
                try{
                    this._filterContainer.remove();
                }catch(e){};
                if (this.isIframe){
                    this._iframeObject.css(this._iframeStyle);
                    this._lastIframeSize=null;
                }else{
                    this._filterContainer.css(this._filterStyle);
                    this._filterContainer.uncover();
                }
            }
        },
        _filterData:function(data,val,isAccurate,isReturnBest){
            this._initSort();
            this._initDisplay();
            var _this=this;
            var listArr=[],k=0;
            var dataString=data;
            var reString=this._sortReString[isAccurate?'accurate':'vague'];
            var reVal=val.toReString();
            var msg=$.type(_this.message.sort)=='array'?_this.message.sort:[];
            for (var i=0,n=reString.length;i<n;i++){
                reString[i][1]=reVal;
                var re=new RegExp(reString[i].join(''),'gi');
                var itemArr=[],l=0;
                dataString=dataString.replace(re,function(a,b){
                    var c=b.split('|');
                    var item={
                        left:c[_this._displayHash.left]||'',
                        right:c[_this._displayHash.right]||'',
                        data:b
                    };
                    itemArr[l++]=item;
                    return '';
                });
                if (l){
                    itemArr.sort(this._sortData);
                    if (isReturnBest){
                        return itemArr[0].data;
                    }
                    if (msg[i]){
                        itemArr.unshift($.tmpl.render(msg[i],{
                            val:val,
                            items:itemArr
                        }));
                    }
                    listArr[k++]=itemArr;
                }
            }
            if (isReturnBest){
                return false;
            }
            listArr=Array.prototype.concat.apply([],listArr);
            this._updateFilter(listArr,val);
        },
        _filterDataByJsonp:function(url,val,isAccurate,isReturnBest,fn){
            this._initSort();
            this._initDisplay();
            var listArr=[],k=0;
            var privateFilterCount=this._filterCount;
            url=$.tmpl.render(url,{
                key:encodeURIComponent(escape(val)),
                accurate:isAccurate?1:0
            });
            $.loader.jsonp(url,{
                charset:this.charset,
                onload:(function(source){
                    if ((this._filterEnable||isReturnBest)&&privateFilterCount==this._filterCount){
                        var arr=source.data.split('@');
                        for (var i=0,n=arr.length;i<n;i++){
                            if (arr[i]){
                                if (isReturnBest){
                                    if ($.type(fn)=='function'){
                                        fn(arr[i]);
                                    }
                                    return;
                                }
                                if (arr[i].slice(0,2)=='$='){
                                    var item=$.tmpl.render(arr[i].slice(2),{
                                        val:val
                                    });
                                }else{
                                    var t=arr[i].split('|');
                                    var item={
                                        left:t[this._displayHash.left]||'',
                                        right:t[this._displayHash.right]||'',
                                        data:arr[i]
                                    };
                                }
                                listArr[k++]=item;
                            }
                        }
                        this._updateFilter(listArr,source.key);
                    }
                }).bind(this)
            });
            if (isReturnBest){
                return false;
            }
        },
        _updateFilter:function(data,val,page){
            //style
            var arr=[],k=0;
            if ($.type(this.template.filterStyle)=='string'){
                arr[k++]=this._placeHolder+'<style>'+this.template.filterStyle.replace(/(\s*)([^\{\}]+)\{/g,'$1#'+this._filterContainer[0].id+' $2{')+'</style>';
            }
            //page
            var index=0;
            if ($.type(data)=='array'){
                this._lastFilterData=data;
            }else{
                data=this._lastFilterData;
                index=this._lastSelect?this._filterContainer.find('*[data],label').indexOf(this._lastSelect):-1;
            }
            page=page||0;
            //pageSize
            var pageSize=this.template.filterPageSize;
            //max
            var max=Math.ceil(data.length/pageSize)-1;
            //current
            var current=Math.min(Math.max(0,page),max);
            //render data
            var t={
                val:val||this._lastValue,
                hasResult:true,
                list:max+1?data.slice(current*pageSize,Math.min((current+1)*pageSize,data.length)):null,
                page:{
                    max:max,
                    current:current
                },
                message:this.message
            };
            //last render data
            if (t.list){
                this._lastFilterRendarData=t;
            }else{
                t=this._lastFilterRendarData;
                if (t){
                    if (val){
                        t.val=val;
                        t.hasResult=false;
                    }
                }else{
                    this._clearFilter();
                    this._hiddenFilter();
                    return;
                }
            }
            //render
            arr[k++]=$.tmpl.render(this.template.filter,t);
            this._filterContainer.html(arr.join(''));
            if ($.type(this.template.filterInit)=='function'){
                this.template.filterInit(this._filterContainer);
            }
            index=Math.max(0,Math.min(index,t.list.length-1));
            var els=this._filterContainer.find('*[data],label');
            if (els[index].tagName=='LABEL'){
                if (index==els.length-1){
                    index-=1;
                }else{
                    index+=1;
                }
            }
            this._showHover(els[index]);
            if (this.isIframe){
                this._filterContainer.appendTo(this._iframeContainer);
                this._fixIframeSize();
                this._iframeObject.offsetA(this.target,this.offset);
            }else{
                this._filterContainer.appendTo($.container);
                this._filterContainer.offset(this.target,this.offset);
                this._filterContainer.cover();
            }
        },
        _sortData:function(a,b){
            if (a.left>b.left){
                return 1;
            }else if (a.left==b.left){
                return 0;
            }else{
                return -1;
            }
        },
        _showHover:function(obj){
            if (!obj){
                obj=this._filterContainer.find('*[data]:first');
            }else{
                obj=$(obj);
            }
            if (this._lastSelect){
                if (this._lastSelect[0]==obj[0]){
                    return;
                }
                this._lastSelect.removeClass('hover');
            }
            obj.addClass('hover');
            this._lastSelect=obj;
        },
        _getItems:function(data){
            this._initCols();
            var t=data.split('|');
            var rv={length:t.length};
            for (var i=0,n=t.length;i<n;i++){
                rv[i]=t[i];
            }
            var k=this.source.alias;
            if (k){
                for (var i=0,n=k.length;i<n;i++){
                    rv[k[i]]=t[i];
                }
            }
            return rv;
        },
        _select:function(data,isIgnoreFocusNext){
            var _this=this;
            this._selectFlag=true;
            setTimeout(function(){
                _this._selectFlag=false;
            });
            this._initDisplay();
            var t=data.split('|');
            var val=t[this._displayHash.value]||'';
            this._tmpValue=this._lastValue=val.trim();
            this.target.value(val);
            this._clearFilter();
            this._hiddenSuggestion();
            this._hiddenFilter();
            if (this.relate){
                for (var index in this.relate){
                    if (this.relate.hasOwnProperty(index)){
                        var relateEl=$(this.relate[index]);
                        if (!relateEl[0]){
                            $.error('address._select','invalid relate element');
                            continue;
                        }
                        if (/^\d$/.test(index)){
                            index=parseInt(index,10);
                        }else if (index in this._colsHash){
                            index=this._colsHash[index];
                        }else{
                            $.error('address._select','invalid relate column '+index);
                            continue;
                        }
                        relateEl.value(t[index]||'');
                    }
                }
            }
            this.trigger('change',{
                arguments:{
                    value:val,
                    data:data,
                    items:this._getItems(data)
                }
            });
            if (!isIgnoreFocusNext&&this.isFocusNext){
                var f=this.target[0].form;
                if (!f){
                    $.error('address._select','invalid form');
                    return;
                }
                var els=f.elements;
                for (var i=0,n=els.length-1;i<n;i++){
                    if (els[i]==this.target[0]){
                        setTimeout(function(){
                            els[i+1].focus()
                        });
                        return;
                    }
                }
            }
        },
        _unselect:function(isClearTarget,isClearRelate){
            if (isClearTarget){
                this._tmpValue=this._lastValue=null;
                this.target.value('');
                this._clearFilter();
                this._hiddenSuggestion();
                this._hiddenFilter();
                this.trigger('change',{
                    arguments:{
                        value:'',
                        data:'',
                        items:null
                    }
                });
            }
            if (isClearRelate&&this.relate){
                for (var index in this.relate){
                    if (this.relate.hasOwnProperty(index)){
                        var relateEl=$(this.relate[index]);
                        if (!relateEl[0]){
                            $.error('address._select','invalid relate element');
                            continue;
                        }
                        relateEl.value('');
                    }
                }
            }
        },
        _event:function(operate,types){
            switch ($.type(types)){
                case 'string':
                    types=[types];
                    break;
                case 'array':
                    break;
                default:
                    $.error('address.'+operate,'Invalid types '+types);
                    return;
            }
            var type;
            for (var i=0,n=types.length;i<n;i++){
                type=types[i].trim();
                if (!type||$.type(type)!='string'){
                    $.error('address.'+operate,'Invalid type '+type);
                    continue;
                }
                if (type in ADDITION_EVENT){
                    this.target[operate].apply(this.target,[type+EVENT_TAIL].concat(Array.prototype.slice.call(arguments,2)));
                }else{
                    $.error('address.'+operate,'Unsupport type '+type);
                }
            }
        },
        _uninit:function(){

        }
    });

    //templateInit
    function defaultSuggestionInit(obj){
        //must be opti
        var spans=obj.find('span');
        var uls=obj.find('ul');
        if (!spans.length){
            return;
        }

        function switchTab(){
            var _this=this;
            spans.each(function(span,i){
                if (span[0]==_this){
                    span.addClass('hot_selected');
                    uls[i].style.display='';
                }else{
                    span.removeClass('hot_selected');
                    uls[i].style.display='none';
                }
            });
        }

        var w=30;
        for (var i=0,n=spans.length;i<n;i++){
            w+=spans[i].offsetWidth;
        }

        var t=obj.find('div').first();
        if (t[0]){
            if (w>278){
                t.css('width',w+'px');
            }
        }

        spans.bind('mousedown',switchTab);
        switchTab.apply(spans[0]);
    }
    function defaultFilterInit(obj){
        //nothing todo
    }

    $.mod.reg(cls);
})(cQuery);
(function(d) {
    function h(d, a) {
        this._init(d, a)
    }
    var j = {name: "allyes",version: "1.0",init: function() {
    },uninit: function() {
    },module: h}, m = {};
    d.extend(h.prototype, {_init: function(i, a) {
        function b(a, b) {
            var c = i.getAttribute(a);
            return (!c ? null : (b ? b[c] || null : c))
        }
        function c(a) {
            var b = location.pathname, b = b.slice(b.lastIndexOf("/") + 1);
            return ((/^(SearchFlights\.aspx|SearchHotels\.aspx|query\.asp)$/i).test(b) ? a[0] : a[1])
        }
        this._obj = i;
        this._opt = a;
        this._opts = d.extend(!0, h.defaults.setings, a || {});
        var f = h.defaults.attrs, g = h.defaults.tmpls.c_div_template,
            e = h.defaults.tmpls.c_txt_template, B = h.defaults.tmpls.c_frm_template, o = this._opts.user, t = this._opts.mod_allyes_user, o = o || t;
        if (!o) {
            var k = b(f[0], window), j = b(f[1], m);
            if (!k && !j)
                return
        }
        setTimeout(function() {
            if (o)
                -1 < o.indexOf("@") && (o = c(o.split("@"))), i.innerHTML = B.replace("{$user}", o);
            else {
                var a = [];
                k && (a = k.map(function(a) {
                    a.button = a.button || ";";
                    return g.replace("{$height}", a.height).replace("{$iframe}", B.replace("{$user}", a.user))
                }));
                j && a.push(e.replace("{$text}", _.$s2t(j)));
                i.innerHTML = a.join("")
            }
        }, 1E3)
    },
        _uninit: function() {
        }});
    h.defaults = {setings: {user: null,mod_allyes_user: null},attrs: ["mod_allyes_buttons", "mod_allyes_text"],tmpls: {c_div_template: '<div class="base_ad140x60" style="height:{$height}px">{$iframe}</div>',c_txt_template: '<div class="base_adtxt140">{$text}</div>',c_frm_template: '<iframe marginheight="0" width="100%" height="100%" marginwidth="0" frameborder="0" scrolling="no" src="http://allyes.ctrip.com/main/adfshow?user={$user}&db=ctrip&border=0&local=yes"></iframe>'}};
    d.mod.reg(j)
})(cQuery);
(function(d) {
    var h = (document.compareDocumentPosition ? function(a, b) {
        return !!(a.compareDocumentPosition(b) & 16)
    } : function(a, b) {
        return a !== b && (a.contains ? a.contains(b) : !0)
    });
    Array.prototype.unique = function() {
        this.sort();
        for (var a = [this[0]], b = 1; b < this.length; b++)
            this[b] !== a[a.length - 1] && a.push(this[b]);
        return a
    };
    var j = function() {
        var a = (/d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g), b = (/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g),
            c = (/[^-+\dA-Z]/g), f = function(a, b) {
                a = "" + a;
                for (b = b || 2; a.length < b; )
                    a = "0" + a;
                return a
            };
        return function(d, e, h) {
            var o = j;
            1 == arguments.length && ("[object String]" == Object.prototype.toString.call(d) && !(/\d/).test(d)) && (e = d, d = void 0);
            d = (d ? new Date(d) : new Date);
            if (isNaN(d))
                throw SyntaxError("invalid date");
            e = "" + (o.masks[e] || e || o.masks["default"]);
            "UTC:" == e.slice(0, 4) && (e = e.slice(4), h = !0);
            var i = (h ? "getUTC" : "get"), k = d[i + "Date"](), m = d[i + "Day"](), r = d[i + "Month"](), l = d[i + "FullYear"](), s = d[i + "Hours"](), w = d[i + "Minutes"](), x =
                d[i + "Seconds"](), i = d[i + "Milliseconds"](), y = (h ? 0 : d.getTimezoneOffset()), u = {d: k,dd: f(k),ddd: o.i18n.dayNames[m],dddd: o.i18n.dayNames[m + 7],m: r + 1,mm: f(r + 1),mmm: o.i18n.monthNames[r],mmmm: o.i18n.monthNames[r + 12],yy: ("" + l).slice(2),yyyy: l,h: s % 12 || 12,hh: f(s % 12 || 12),H: s,HH: f(s),M: w,MM: f(w),s: x,ss: f(x),l: f(i, 3),L: f(99 < i ? Math.round(i / 10) : i),t: (12 > s ? "a" : "p"),tt: (12 > s ? "am" : "pm"),T: (12 > s ? "A" : "P"),TT: (12 > s ? "AM" : "PM"),Z: (h ? "UTC" : (("" + d).match(b) || [""]).pop().replace(c, "")),o: (0 < y ? "-" : "+") + f(100 * Math.floor(Math.abs(y) / 60) + Math.abs(y) %
                60, 4),S: ["th", "st", "nd", "rd"][(3 < k % 10 ? 0 : (10 != k % 100 - k % 10) * k % 10)]};
            return e.replace(a, function(a) {
                return (a in u ? u[a] : a.slice(1, a.length - 1))
            })
        }
    }();
    j.masks = {"default": "ddd mmm dd yyyy HH:MM:ss",shortDate: "m/d/yy",mediumDate: "mmm d, yyyy",longDate: "mmmm d, yyyy",fullDate: "dddd, mmmm d, yyyy",shortTime: "h:MM TT",mediumTime: "h:MM:ss TT",longTime: "h:MM:ss TT Z",isoDate: "yyyy-mm-dd",isoTime: "HH:MM:ss",isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"};
    j.i18n = {dayNames: "Sun Mon Tue Wed Thu Fri Sat Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
        monthNames: "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec January February March April May June July August September October November December".split(" ")};
    Date.prototype.format = function(a, b) {
        return j(this, a, b)
    };
    String.prototype.pad = function() {
        var a = this.split("-"), b = parseInt(a[0], 10), c = parseInt(a[1], 10), a = parseInt(a[2], 10);
        10 <= c || (c = "0" + c);
        10 <= a || (a = "0" + a);
        return (200 < b ? b : 1900 + b) + "-" + c + "-" + a
    };
    cQuery.extend(d.fn, {hide: function() {
        for (var a = 0; a < this.length; a++)
            this[a].style.display = "none"
    },show: function() {
        for (var a =
            0; a < this.length; a++)
            this[a].style.display = ""
    },append: function(a) {
        this.each(function(b) {
            b[0].appendChild(a)
        })
    },outerHeight: function() {
        return this[0].offsetHeight
    },prev: function() {
        for (var a = this[0].previousSibling; 1 != a.nodeType; )
            a = a.previousSibling;
        return a
    },next: function() {
        for (var a = this[0].nextSibling; a && 1 != a.nodeType; )
            a = a.nextSibling;
        return a
    },parents: function(a) {
        try {
            for (var b = this[0].parentNode; b && b.tagName != a.toUpperCase(); )
                b = b.parentNode;
            return [b]
        } catch (c) {
            return []
        }
    },triggerEvent: function(a) {
        if (document.createEvent) {
            var b =
                document.createEvent("MouseEvents");
            b.initEvent(a, !0, !0);
            this[0].dispatchEvent(b)
        } else
            this[0].fireEvent("on" + a)
    }});
    var m = function(a) {
        var b = new Date, c = d.config("charset"), f = {"2011-02-02": ["c_chuxi", "\u9664\u5915"],"2012-01-22": ["c_chuxi", "\u9664\u5915"],"2013-02-09": ["c_chuxi", "\u9664\u5915"],"2011-02-03": ["c_chunjie", "\u6625\u8282"],"2012-01-23": ["c_chunjie", "\u6625\u8282"],"2013-02-10": ["c_chunjie", "\u6625\u8282"],"2011-02-04": ["c_chuer", "\u521d\u4e8c"],"2012-01-24": ["c_chuer", "\u521d\u4e8c"],"2013-02-11": ["c_chuer",
            "\u521d\u4e8c"],"2011-02-05": ["c_chusan", "\u521d\u4e09"],"2012-01-25": ["c_chusan", "\u521d\u4e09"],"2013-02-12": ["c_chusan", "\u521d\u4e09"],"2011-02-06": ["c_chusi", "\u521d\u56db"],"2012-01-26": ["c_chusi", "\u521d\u56db"],"2013-02-13": ["c_chusi", "\u521d\u56db"],"2011-02-07": ["c_chuwu", "\u521d\u4e94"],"2012-01-27": ["c_chuwu", "\u521d\u4e94"],"2013-02-14": ["c_chuwu", "\u521d\u4e94"],"2011-02-08": ["c_chuliu", "\u521d\u516d"],"2012-01-28": ["c_chuliu", "\u521d\u516d"],"2013-02-15": ["c_chuliu", "\u521d\u516d"],
            "2011-02-09": ["c_chuqi", "\u521d\u4e03"],"2012-01-29": ["c_chuqi", "\u521d\u4e03"],"2013-02-16": ["c_chuqi", "\u521d\u4e03"],"2011-02-10": ["c_chuba", "\u521d\u516b"],"2012-01-30": ["c_chuba", "\u521d\u516b"],"2013-02-17": ["c_chuba", "\u521d\u516b"],"2011-01-01": ["c_yuandan", "\u5143\u65e6"],"2012-01-01": ["c_yuandan", "\u5143\u65e6"],"2013-01-01": ["c_yuandan", "\u5143\u65e6"],"2011-04-05": ["c_qingming", "\u6e05\u660e\u8282"],"2012-04-04": ["c_qingming", "\u6e05\u660e\u8282"],"2013-04-04": ["c_qingming", "\u6e05\u660e\u8282"],
            "2011-06-06": ["c_duanwu", "\u7aef\u5348\u8282"],"2012-06-23": ["c_duanwu", "\u7aef\u5348\u8282"],"2013-06-12": ["c_duanwu", "\u7aef\u5348\u8282"],"2011-05-01": ["c_wuyi", "\u52b3\u52a8\u8282"],"2012-05-01": ["c_wuyi", "\u52b3\u52a8\u8282"],"2013-05-01": ["c_wuyi", "\u52b3\u52a8\u8282"],"2011-10-01": ["c_guoqing", "\u56fd\u5e86\u8282"],"2012-10-01": ["c_guoqing", "\u56fd\u5e86\u8282"],"2013-10-01": ["c_guoqing", "\u56fd\u5e86\u8282"],"2011-09-12": ["c_zhongqiu", "\u4e2d\u79cb\u8282"],"2012-09-30": ["c_zhongqiu", "\u4e2d\u79cb\u8282"],
            "2013-09-19": ["c_zhongqiu", "\u4e2d\u79cb\u8282"],"2011-02-17": ["c_yuanxiao", "\u5143\u5bb5\u8282"],"2012-02-06": ["c_yuanxiao", "\u5143\u5bb5\u8282"],"2013-02-24": ["c_yuanxiao", "\u5143\u5bb5\u8282"]}, b = {date: b,dayTagName: "a",monthTagName: "a",defaultClass: "calendar",tipText: "yyyy-mm-dd",classNames: {select: "select",nothismonth: "day_over",blankdate: "day_no",today: "today",tomorrow: "",aftertomorrow: "",none: "none",type: "left"},typeList: {month_prev: "-1",month_next: "+1"},template: {head: '<div class="calendar_title"><a class="{$type}"></a>{$data}</div>',
            shead: '<div class="calendar_title"><a class="{$typel}"></a>{$data}<a class="{$typer}"></a></div>',body: '<dl class="calendar_day"><dt class="weekend">\u65e5</dt><dt>\u4e00</dt><dt>\u4e8c</dt><dt>\u4e09</dt><dt>\u56db</dt><dt>\u4e94</dt><dt class="weekend">\u516d</dt><dd>{$dates}</dd></dl>',foot: "",day: '<a href="javascript:void(0);" {$id} {$Class} {$Style}>{$day}</a>',festival: '<span class="c_day_festival">{$day}</span>'},showPrev: !0,showNext: !1,todayInfos: ["", "", ""],weekText: "pic_sun pic_mon pic_tue pic_wed pic_thu pic_fir pic_sat".split(" "),
            todayText: ["pic_today", "pic_tomorrow", "pic_aftertomorrow"],type: "",rangeColor: "#F0F5FB",hoverColor: "#d9e5f4",festival: ("gb2312" == c ? f : ("utf-8" == c ? {} : f))};
        d.extend(!0, b, a);
        this.initialize(b)
    };
    m.prototype = {initialize: function(a) {
        this.setOptions(a);
        this.bindEvent();
        this.autoRender && this.render(this.date)
    },setOptions: function(a) {
        d.extend(!0, this, a);
        this.target = d(this.calendarWin.document.getElementById(a.target))
    },bindEvent: function() {
        this.bindAddNumEvent();
        this.bindMoveEvent();
        this.setToday()
    },hide: function() {
        this.target.css("display",
            "none")
    },show: function() {
        this.target.css("display", "")
    },setToday: function() {
        this.target.bind("selectstart", function() {
            return !1
        })
    },getOptByType: function(a) {
        return this.typeList[a]
    },bindAddNumEvent: function() {
        d(this.target).bind("mousedown", function(a) {
            var a = a.target, b = !1, c;
            for (c in this.typeList)
                if (d(a).hasClass(c)) {
                    b = !0;
                    break
                }
            if (a.tagName == this.monthTagName.toUpperCase() && b)
                return this.changeMonth(this, this.getOptByType(a.className)), !1;
            (a = (a.tagName == this.dayTagName.toUpperCase() ? a : d(a).parents(this.dayTagName)[0])) &&
                a.tagName == this.dayTagName.toUpperCase() && this.clickEvent(this, a);
            return !1
        }.bind(this))
    },clickEvent: function() {
    },strToDate: function(a) {
        if (a)
            return a.toDate()
    },chkHoverColor: function(a, b, c) {
        var f = null, g = null;
        if (a && ("A" == c.tagName || "A" == c.parentNode.tagName) && !d(c).hasClass("day_over") && !d(c).hasClass("day_no"))
            f = this.strToDate(a), g = this.strToDate(b), this.setHoverColor(f, g, c)
    },setHoverColor: function(a, b, c) {
        for (var c = ("A" == c.tagName ? c : c.parentNode), f = this.getDateById(c.id), b = (b ? b : f), c = this.target[0].parentNode.getElementsByTagName(c.tagName),
                 g = 0; g < c.length; g++) {
            var e = !d(c[g]).hasClass("day_over") && !d(c[g]).hasClass("day_no");
            c[g].id && e && (e = this.getDateById(c[g].id), c[g].style.backgroundColor = (e < f && e > a ? this.hoverColor : (e < a || e > b ? "" : this.rangeColor)))
        }
    },clearHoverColor: function(a, b) {
        for (var c = this.target[0].parentNode.getElementsByTagName("a"), f = 0; f < c.length; f++)
            if (!d(c[f]).hasClass("day_over") && d(c[f]).hasClass("day_no"), c[f].id) {
                var g = this.getDateById(c[f].id);
                if (g < a || g > b)
                    c[f].style.backgroundColor = ""
            }
    },bindMoveEvent: function() {
        var a = null,
            b = null, c = null, f = null, g = this;
        this.target.bind("mouseover", function(c) {
            g.input && (a = d(g.input).data("startDate") || g.startDate, b = d(g.input).data("endDate") || g.endDate);
            g.chkHoverColor(a, b, c.target)
        }.bind(this));
        this.target.bind("mouseout", function(d) {
            if ((d = d.relatedTarget || d.toElement) && g.input && !h(g.target[0].parentNode, d) && a && b)
                c = this.strToDate(a), f = this.strToDate(b), g.clearHoverColor(c, f)
        }.bind(this))
    },getDateString: function(a) {
        return a.format("yyyy-mm-dd")
    },getDateById: function(a) {
        a = a.replace((/_.*/),
            "").split("-");
        return new Date(a[0], a[1] - 1, 1 * a[2])
    },renderSelect: function() {
        this.render(this.date)
    },createHead: function(a) {
        var b = "", a = new Date(a), b = a.getFullYear(), a = a.getMonth() + 1, c = "", c = (this.template.formatHead ? this.template.formatHead(b, a) : b + "\u5e74" + a + "\u6708");
        return b = (this.type ? this.template.head.replaceWith({type: ("left" == this.type ? "month_prev" : "month_next"),data: c}) : this.template.shead.replaceWith({typel: "month_prev",typer: "month_next",data: c}))
    },getClass: function(a, b, c) {
        var f = [this.classNames.today,
            this.classNames.tomorrow, this.classNames.aftertomorrow], g = new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate()), g = (a - g) / 864E5, f = f[g] || "";
        0 === (a - this.beginDate) / 864E5 && (f += " " + this.classNames.select);
        this.beginDate && this.endDate && a > this.beginDate && a <= this.endDate && (f += " " + this.classNames.select);
        if (0 > g || this.closeDate[b])
            f += " " + this.classNames.nothismonth;
        var a = (this.input ? (c.data("startDate") ? c.data("startDate") : this.input.value) : this.startDate), e = (this.input ? (c.data("endDate") ?
            c.data("endDate") : "") : this.endDate), g = (this.input ? (c.data("minDate") ? c.data("minDate") : "") : this.minDate), h = (this.input ? (c.data("maxDate") ? c.data("maxDate") : "") : this.maxDate);
        a && (a = a.pad());
        e && (e = e.pad());
        g && (g = g.pad());
        h && (h = h.pad());
        (a = (a == b ? 1 : 0)) && (f += " day_selected");
        (e = (e == b ? 1 : 0)) && (f += " day_selected");
        g && this.strToDate(b) < this.strToDate(g) && (f = this.classNames.nothismonth);
        h && this.strToDate(b) > this.strToDate(h) && (f = this.classNames.nothismonth);
        c.data("prohibit") && -1 !== (c.data("prohibit").join("|") + "|").indexOf(b +
            "|") && (f = this.classNames.nothismonth);
        f = f.trim().split(" ").unique().join(" ");
        c = ((c = this.festival[b] || "") ? c[0] : "");
        g = d(this.input).data("today");
        if (c || b == g)
            f = f.replace("day_selected", "c_festival_select");
        return {"class": f,start: a,end: e}
    },getAddValue: function(a) {
        if (this.beginDate) {
            var b = new Date(this.beginDate.getFullYear(), this.beginDate.getMonth(), this.beginDate.getDate()), b = (a - b) / 864E5;
            return (0 < b ? (this.endDate && a <= this.endDate ? "+" + b : (this.endDate ? "" : "+" + b)) : "")
        }
        return ""
    },chkRange: function(a, b, c, f) {
        return (a &&
            (b && c && f) && (a = a.toDate(), b = b.toDate(), c > a && c < b) ? "style='background-color: " + d(this.input).data("rangeColor") + ";'" : "")
    },getDates: function(a) {
        var b = [];
        a.getDate();
        var c = (new Date(a.getFullYear(), a.getMonth(), 1)).getDay(), f = (new Date(a.getFullYear(), a.getMonth() + 1, 0)).getDate(), g = null, e = null, h = null;
        this.input && (h = d(this.input), g = h.data("startDate"), e = h.data("endDate"), h.data("minDate"), h.data("maxDate"));
        for (var i = 1; 43 > i; i++) {
            var m = new Date(a.getFullYear(), a.getMonth(), i - c), k = this.getDateString(m), j =
                k + "_" + this.target[0].id, r = this.getClass(m, k, h), k = ((k = (m <= new Date ? "" : this.festival[k] || "")) ? k[0] : ""), l = this.setToday(m);
            (i > c && i <= f + c ? (r = ([r["class"], k].join(" ").trim() ? "class='" + [r["class"], k].join(" ").trim() + "'" : ""), b.push(this.template.day.replaceWith({id: "id=" + j,day: (k ? this.template.festival.replaceWith({day: l + (i - c),festival: k}) : l + (i - c)),Style: this.chkRange(g, e, m, j),Class: r}))) : (i > f ? b.push(this.template.day.replaceWith({id: (this.showNext ? "id=" + j : ""),day: (this.showNext ? l + m.getDate() : ""),festival: (this.showNext ?
                k : ""),Style: this.chkRange(g, e, m, ""),Class: (this.showNext ? "class=" + [r["class"] || this.classNames.nothismonth, k].join(" ") : "class=" + [this.classNames.blankdate, k].join(" "))})) : b.push(this.template.day.replaceWith({id: (this.showPrev ? "id=" + j : ""),day: (this.showPrev ? l + m.getDate() : ""),festival: (this.showPrev ? k : ""),Style: this.chkRange(g, e, m, ""),Class: (this.showPrev ? "class=" + [r["class"] || this.classNames.nothismonth, k].join(" ") : "class=" + [this.classNames.blankdate, k].join(" "))}))))
        }
        return b.join("")
    },createBody: function(a) {
        a =
            new Date(a);
        return this.template.body.replaceWith({months: a.getMonth() + 1,dates: this.getDates(a)})
    },setToday: function(a) {
        var b = new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate());
        return this.todayInfos[(a - b) / 864E5] || ""
    },createFoot: function() {
        return this.template.foot
    },createTempEl: function(a) {
        var b = this.calendarWin.document.createElement("div");
        b.innerHTML = a;
        return b.firstChild
    },render: function(a) {
        this.target.html("");
        this.target.append(this.createTempEl(this.createHead(a)));
        this.target.append(this.createTempEl(this.createBody(a)));
        this.target.show()
    },changeMonth: function(a, b) {
        a.date = new Date(a.date.getFullYear(), a.date.getMonth() + eval("(" + b + ")"), 1);
        this.render(this.date)
    }};
    var i = function(a) {
        var b = {options: {items: [],container: null,step: 2,date: new Date,startDate: null,endDate: null,showWeek: !1,reference: null,nextEl: null,today: null,todayClass: "",prevEl: null,rangeColor: "#F0F5FB",hoverColor: "#d9e5f4",classNames: {select: "select",nothismonth: "day_over",blankdate: "day_no",today: "today",
            tomorrow: "",aftertomorrow: "",none: "none",type: "left"},template: {wrap: '<div class="calendar_wrap" id="calendars" style="position:absolute;display:none;" >{$calendars}</div>',calendar: '<div id="{$calendarid}" hidefocus="true" class="calendar_month"></div>'},styles: ".calendar_wrap{width:363px;background: #fff; padding: 5px 5px 0;border: solid 1px #999;overflow: hidden;font-size:12px;font-family:tahoma,Arial,Helvetica,simsun,sans-serif;-moz-box-shadow:0 3px 5px #ccc;-webkit-box-shadow:0 3px 5px #ccc;box-shadow:0 3px 5px #ccc;}.calendar_wrap a{ color: #0053aa; text-decoration: none !important; }.calendar_wrap a:hover{text-decoration: underline;}#calendar0{width: 180px;}#calendar1{width: 182px;}.calendar_month{float: left;padding-bottom:5px;text-align: center;}.calendar_title{ height: 23px; line-height: 23px; font-weight: bold; color: #fff; background-color: #004fb8; text-align: center; }.month_prev,.month_next{ width: 23px; height: 23px; color: #fff; background: #2d7ce7 url(http://pic.c-ctrip.com/cquery/un_calender_index.png) no-repeat; cursor: pointer; }.month_prev{float: left;background-position: 0 0;}.month_next{float: right;background-position: 100% 0;}.month_prev:hover{background-color: #62adf1; background-position: 0 -26px;}.month_next:hover{background-color: #62adf1; background-position: 100% -26px;}.calendar_day{ overflow:hidden; margin: 0; padding-top:5px; }.calendar_day dd { margin: 0; padding: 0; }#calendar1 dl{border-left: 2px solid #aaa;padding-left: 5px;padding-bottom:30px;margin-bottom: -30px;}.calendar_month dt{ float: left; width: 25px; height: 22px; line-height: 20px; color: #666; background-color: #ececec; margin-bottom: 2px; }.calendar_month .weekend{font-weight: bold;color: #f90;}.calendar_day a{ float: left; width: 24px; height: 24px; line-height: 24px; margin-bottom: 1px; padding-right: 1px; font-size: 11px; font-weight: bold; color: #005ead; background-color: #fff; cursor: pointer; }.calendar_day a:hover,.calendar_day .today,.calendar_day .day_selected,.calendar_day .c_festival_select,.calendar_day .c_festival_select:hover{background: #e6f4ff url(http://pic.c-ctrip.com/cquery/un_calender_index.png) no-repeat;}.calendar_day a:hover{background-color: #e6f4ff;background-position: -26px -53px;text-decoration: none;}.calendar_day .today{background-color: #fff5d1;background-position: 0 -82px;}.calendar_day .day_over,.calendar_day .day_no{font-weight: normal;color: #dbdbdb;outline: none;cursor: default;}.calendar_day .day_over:hover,.calendar_day .day_no:hover{background: #fff;}.calendar_day .day_selected,.calendar_day .day_selected:hover{background-color: #629be0;background-position: 0 -53px;color: #fff;}.calendar_day .c_festival_select,.calendar_day .c_festival_select:hover{ background-color: #ffe6a6; background-image: url(http://pic.c-ctrip.com/cquery/un_calender_index.png); background-position: 0 -111px; }.c_yuandan span,.c_chuxi span,.c_chunjie span,.c_yuanxiao span,.c_qingming span,.c_wuyi span,.c_duanwu span,.c_zhongqiu span,.c_guoqing span,.c_jintian span{ width: 24px; height: 24px; background-image: url(http://pic.c-ctrip.com/cquery/un_festivals.png); background-repeat: no-repeat; text-indent: -9999em; overflow: hidden; display: block; }.c_yuandan span{background-position: 0 0;}.c_chuxi span{background-position: 0 -32px;}.c_chunjie span{background-position: 0 -64px;}.c_yuanxiao span{background-position: 0 -96px;}.c_qingming span{background-position: 0 -128px;}.c_wuyi span{background-position: 0 -160px;}.c_duanwu span{background-position: 0 -192px;}.c_zhongqiu span{background-position: 0 -224px;}.c_guoqing span{background-position: 0 -256px;}.c_jintian span{ background-position: 0 -288px;}.c_calender_date{ display: inline-block; color: #666; text-align: right; position: absolute; z-index: 1; }",
            weekText: "pic_sun pic_mon pic_tue pic_wed pic_thu pic_fir pic_sat".split(" "),todayText: ["pic_today", "pic_tomorrow", "pic_aftertomorrow"],closeDate: {},festival: {"2011-02-02": ["c_chuxi", "\u9664\u5915"],"2012-01-22": ["c_chuxi", "\u9664\u5915"],"2013-02-09": ["c_chuxi", "\u9664\u5915"],"2011-02-03": ["c_chunjie", "\u6625\u8282"],"2012-01-23": ["c_chunjie", "\u6625\u8282"],"2013-02-10": ["c_chunjie", "\u6625\u8282"],"2011-02-04": ["c_chuer", "\u521d\u4e8c"],"2012-01-24": ["c_chuer", "\u521d\u4e8c"],"2013-02-11": ["c_chuer",
                "\u521d\u4e8c"],"2011-02-05": ["c_chusan", "\u521d\u4e09"],"2012-01-25": ["c_chusan", "\u521d\u4e09"],"2013-02-12": ["c_chusan", "\u521d\u4e09"],"2011-02-06": ["c_chusi", "\u521d\u56db"],"2012-01-26": ["c_chusi", "\u521d\u56db"],"2013-02-13": ["c_chusi", "\u521d\u56db"],"2011-02-07": ["c_chuwu", "\u521d\u4e94"],"2012-01-27": ["c_chuwu", "\u521d\u4e94"],"2013-02-14": ["c_chuwu", "\u521d\u4e94"],"2011-02-08": ["c_chuliu", "\u521d\u516d"],"2012-01-28": ["c_chuliu", "\u521d\u516d"],"2013-02-15": ["c_chuliu", "\u521d\u516d"],
                "2011-02-09": ["c_chuqi", "\u521d\u4e03"],"2012-01-29": ["c_chuqi", "\u521d\u4e03"],"2013-02-16": ["c_chuqi", "\u521d\u4e03"],"2011-02-10": ["c_chuba", "\u521d\u516b"],"2012-01-30": ["c_chuba", "\u521d\u516b"],"2013-02-17": ["c_chuba", "\u521d\u516b"],"2011-01-01": ["c_yuandan", "\u5143\u65e6"],"2012-01-01": ["c_yuandan", "\u5143\u65e6"],"2013-01-01": ["c_yuandan", "\u5143\u65e6"],"2011-04-05": ["c_qingming", "\u6e05\u660e\u8282"],"2012-04-04": ["c_qingming", "\u6e05\u660e\u8282"],"2013-04-04": ["c_qingming", "\u6e05\u660e\u8282"],
                "2011-06-06": ["c_duanwu", "\u7aef\u5348\u8282"],"2012-06-23": ["c_duanwu", "\u7aef\u5348\u8282"],"2013-06-12": ["c_duanwu", "\u7aef\u5348\u8282"],"2011-05-01": ["c_wuyi", "\u52b3\u52a8\u8282"],"2012-05-01": ["c_wuyi", "\u52b3\u52a8\u8282"],"2013-05-01": ["c_wuyi", "\u52b3\u52a8\u8282"],"2011-10-01": ["c_guoqing", "\u56fd\u5e86\u8282"],"2012-10-01": ["c_guoqing", "\u56fd\u5e86\u8282"],"2013-10-01": ["c_guoqing", "\u56fd\u5e86\u8282"],"2011-09-12": ["c_zhongqiu", "\u4e2d\u79cb\u8282"],"2012-09-30": ["c_zhongqiu", "\u4e2d\u79cb\u8282"],
                "2013-09-19": ["c_zhongqiu", "\u4e2d\u79cb\u8282"],"2011-02-17": ["c_yuanxiao", "\u5143\u5bb5\u8282"],"2012-02-06": ["c_yuanxiao", "\u5143\u5bb5\u8282"],"2013-02-24": ["c_yuanxiao", "\u5143\u5bb5\u8282"]}}}, b = d.extend(!0, b.options, a);
        this.initialize(b);
        return this
    };
    i.prototype = {initialize: function(a) {
        this.setOptions(a);
        this.createStyle()
    },setOptions: function(a) {
        d.extend(!0, this, a)
    },clearWeek: function(a) {
        a && d(a).css({"background-image": ""})
    },setWeek: function(a) {
        var b = d(a);
        if (b && b.value().isDate()) {
            var c = this.getDay(this.getDateById(b.value(),
                "-"), null), f = d.config("charset"), g = function() {
                d(a).css({"background-image": "url(http://pic.c-ctrip.com/cquery/" + c + ".png)","background-position": "right center","background-repeat": "no-repeat"})
            };
            c && 105 <= b.offset().width && ("gb2312" == f ? g() : "utf-8" != f && g())
        }
    },createEl: function(a) {
        var b = this.calendarWin.document.getElementById("calendars");
        if (b)
            return d(b);
        if (a && d(a).length)
            return d(a);
        a = this.calendarWin.document.createElement("div");
        a.innerHTML = this.template.wrap.replaceWith({calendars: this.createCalendar()});
        return d(a.firstChild).appendTo(this.container || this.calendarWin.document.body)
    },createCalendar: function() {
        var a = this, b = [];
        this.items.each(function(c, f) {
            b.push(a.template.calendar.replaceWith({calendarid: "calendar" + f}))
        });
        return b.join("")
    },createStyle: function() {
        (d.browser.isIE ? (sty = this.calendarWin.document.createStyleSheet(), sty.cssText = this.styles) : (sty = this.calendarWin.document.createElement("style"), sty.type = "text/css", sty.textContent = this.styles, this.calendarWin.document.getElementsByTagName("head")[0].appendChild(sty)))
    },
        change: function(a) {
            $input = d(this.input);
            $input.data("startDate") && $input.data("endDate", this.input.value);
            var b = d($input.data("nextEl"));
            b.length && (b.data("startDate", this.input.value), b[0].focus());
            "undefined" != typeof this.input.onChange && this.input.onChange.call(this, a, a.value, !1);
            d(this.input).data("showWeek") && this.setWeek(a)
        },hide: function() {
            for (var a = 0; a < this.items.length; a++)
                this.items[a].input && !this.items[a].input.value.isDate() && this.clearWeek(this.items[a].input), this.items[a].hide();
            this.el.hide();
            this.el.uncover();
            this.calendarIframe && (this.calendarIframe.style.display = "none")
        },show: function(a) {
            this.el || (this.el = this.createEl(this.el), this.el[0].style.zIndex = this.zIndex, this.override());
            this.calendarIframe && (this.calendarIframe.style.display = "", this.calendarIframe.style.zIndex = this.zIndex);
            var b = new Date;
            (a.value.isDate() ? b = a.value : (b = new Date, d(a).data("endDate", ""), this.enddate = ""));
            this.input = a;
            var c = d(this.input);
            this.input.onBeforeShow.call(this);
            for (var f = 0; f < this.items.length; f++) {
                var g =
                    new Date;
                if (b.length) {
                    var e = b.toDate(), g = e.getFullYear(), e = e.getMonth() + f;
                    ddate = new Date(g, e, 1)
                } else
                    ddate = new Date(g.getFullYear(), g.getMonth() + f, 1);
                this.items[f].input = this.input;
                g = d(this.input);
                c.data("startDate", g.data("startDate") || this.startDate);
                c.data("endDate", g.data("endDate") || this.endDate);
                c.data("minDate", g.data("minDate") || this.minDate);
                c.data("maxDate", g.data("maxDate") || this.maxDate);
                c.data("showWeek", g.data("showWeek") || this.showWeek);
                c.data("rangeColor", g.data("rangeColor") || this.rangeColor);
                c.data("reference", g.data("reference") || this.reference);
                c.data("nextEl", g.data("nextEl"));
                c.data("prevEl", g.data("prevEl"));
                c.data("todayClass", g.data("todayClass"));
                !a.value.isDate() && c.data("reference") && d(d(this.input).data("reference")).value().isDate() && (e = new Date, g = e.getFullYear(), e = e.getMonth() + f, ddate = new Date(g, e, 1));
                this.items[f].date = ddate;
                this.items[f].render(this.items[f].date)
            }
            this.el.show();
            this.setPosition(this.input, this.el)
        },setPosition: function(a, b) {
            (this.calendarIframe ? d(this.calendarIframe).offsetA(a) :
                (d(b).offsetA(a), d(b).cover()));
            this.input.onShow.call(this);
            this.setToday()
        },setToday: function() {
            var a = (this.input ? d(this.input).data("todayClass") : "");
            if (a) {
                d(this.el).find("." + this.classNames.today).removeClass(this.classNames.today);
                for (var b = 0; b < this.items.length; b++) {
                    var c = this.items[b].target.find("#" + this.today.pad(2) + "_" + this.items[b].target[0].id);
                    if (c.length) {
                        d(c).addClass(a).html('<span class="c_day_festival">' + c.text() + "</span>");
                        break
                    }
                }
            }
        },render: function() {
            for (var a = 0; a < this.items.length; a++)
                this.items[a].render(this.items[a].date)
        },
        override: function() {
            for (var a = this.calendarWin, b = this.inputWin, c = 0; c < this.items.length; c++) {
                var f = this.items[c];
                f.calendarWin = a;
                f.inputWin = b;
                f.template = this.template;
                this.items[c] = new m(f);
                this.items[c].changeMonth = this.changeMonth.bind(this);
                this.items[c].clickEvent = this.clickEvent.bind(this);
                f = (this.date ? (new Date(this.date.toDate())).setMonth((new Date(this.date.toDate())).getMonth() + c) : new Date((new Date).setMonth((new Date).getMonth() + c)));
                this.items[c].date = f;
                this.items[c].startDate = this.startDate;
                this.items[c].endDate = this.endDate;
                this.items[c].minDate = this.minDate;
                this.items[c].maxDate = this.maxDate;
                this.items[c].classNames = this.classNames;
                this.items[c].closeDate = this.closeDate
            }
        },changeMonth: function(a) {
            var b = {left: "-" + this.step,right: "+" + this.step};
            this.items.each(function(c, f) {
                this.items[f].date = new Date(this.items[f].date.getFullYear(), this.items[f].date.getMonth() + eval("(" + b[a.type] + ")"), 1);
                this.items[f].render(this.items[f].date)
            }.bind(this));
            this.input.onShow.call(this);
            this.setToday()
        },
        setValue: function(a) {
            d(this.input).data("startDate") && d(this.input).data("endDate", a)
        },getDay: function(a, b) {
            var b = b || this, c = new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate()), f = b.festival[a.format("yyyy-mm-dd")] || "";
            if (f)
                return f[0].replace("c_", "pic_");
            f = Math.abs(parseInt((new Date(a) - c) / 864E5));
            return (0 > parseInt(new Date(a) - c) || 2 < f ? b.weekText[(new Date(a)).getDay()] : b.todayText[f])
        },clickEvent: function(a, b) {
            var c = this;
            if (this.input && !d(b).hasClass(a.classNames.nothismonth) &&
                b.id) {
                var f = j(a.getDateById(b.id), "yyyy-mm-dd");
                this.input.value = f;
                if (1 * d(this.input).data("showWeek")) {
                    var g = d(this.input);
                    if (g && this.input.value.isDate()) {
                        var e = this.getDay(a.getDateById(b.id), a);
                        if (e && 105 <= this.input.clientWidth) {
                            var h = d.config("charset"), i = function() {
                                d(g).css({"background-image": "url(http://pic.c-ctrip.com/cquery/" + e + ".png)","background-position": "right center","background-repeat": "no-repeat"})
                            };
                            ("gb2312" == h ? i() : "utf-8" != h && i())
                        }
                    }
                }
                this.setValue(f);
                this.items.each(function(a, b) {
                    this.items[b].startDate =
                        c.input.startDate;
                    this.items[b].endDate = c.input.endDate
                }.bind(this));
                this.hide();
                this.input.blur();
                $input = d(this.input);
                $input.data("startDate") && $input.data("endDate", this.input.value);
                f = d($input.data("nextEl"));
                f.length && (f.data("startDate", this.input.value), f[0].focus());
                $input.triggerEvent("change");
                "undefined" != typeof this.input.onChange && this.input.onChange.call(this, this.input, this.input.value, !0)
            }
        },getDateById: function(a, b) {
            var c = a.split(b || "_");
            return new Date(c[0], c[1] - 1, 1 * c[2])
        },_callbalck: function() {
            this.callbalck &&
            this.callbalck.call(this, this.beginDate, this.endDate, (this.endDate - this.beginDate) / 864E5)
        },setBegin: function(a) {
            this.beginDate = a;
            this.renderSelect(this.beginDate, this.endDate)
        },setEnd: function(a) {
            this.endDate = a;
            this.renderSelect(this.beginDate, this.endDate)
        },setTotalDay: function(a) {
            this.endDate = new Date(this.beginDate.getFullYear(), this.beginDate.getMonth(), 1 * this.beginDate.getDate() + 1 * a);
            this.renderSelect(this.beginDate, this.endDate)
        }};
    String.prototype.trim = function() {
        return this.replace((/(^\s*)|(\s*$)/g),
            "")
    };
    String.prototype.replaceWith = function(a) {
        return this.replace((/\{\$(\w+)\}/g), function(b, c) {
            return (c in a ? a[c] : b)
        })
    };
    d.mod.reg({name: "calendar",version: "3.0",init: function() {
    },uninit: function() {
    },module: function(a, b) {
        function c() {
            i.instance.ctObj && i.instance.ctObj.releaseCapture && (i.instance.ctObj.releaseCapture(), i.instance.ctObj = null)
        }
        var f = {zIndex: 999,calendarWin: window,date: "",container: null,target: a,rangeColor: "#F0F5FB",hoverColor: "#d9e5f4",inputs: this,showWeek: !0,nextEl: null,today: (new Date).toStdDateString(),
            prevEl: null,todayClass: "",minDate: null,reference: null,maxDate: null,startDate: null,endDate: null,items: [{target: "calendar0",type: "left",autoRender: !1,showPrev: !1,showNext: !1}, {target: "calendar1",type: "right",autoRender: !1,showPrev: !1}],listeners: {onBeforeShow: function() {
            },onShow: function() {
            },onChange: function() {
            }}};
        d.extend(!0, f.listeners, b.listeners);
        d.extend(!0, f, b.options);
        var g = d(a), e;
        for (e in f)
            "listeners" != e && g.data(e, f[e]);
        for (e in f.listeners)
            a[e] = f.listeners[e];
        var h = f.calendarWin;
        i.instance ||
        (i.instance = new i(f));
        f.showWeek && i.instance.setWeek(a);
        d(a).bind("focus", function() {
            i.instance.show(this);
            h.document.getElementById("calendars").onmousedown = function() {
                a.setCapture && (c(), a.setCapture(), i.instance.ctObj = a);
                return !1
            }
        });
        d(a).bind("mouseup", function() {
            c()
        });
        d(a).bind("change", function() {
            i.instance.change(this)
        });
        d(a).bind("blur", function() {
            c();
            i.instance.hide()
        });
        return i.instance
    }})
})(cQuery);
(function(d) {
    function h(a, b) {
        this.init(a, b)
    }
    var j = {name: "jmp",version: "1.0",init: function() {
    },uninit: function() {
    },module: h}, m = window.onresize;
    window.onresize = function() {
        m && m();
        for (var a in h.queue) {
            var b = h.queue[a];
            b.active && b.opt.options.adjust.resize && b._update()
        }
    };
    var i = window.onscroll;
    window.onscroll = function() {
        i && i();
        for (var a in h.queue) {
            var b = h.queue[a];
            b.active && b.opt.options.adjust.scroll && b._update()
        }
    };
    h["float"] = function(a, b) {
        if (a.jmp)
            return a.jmp;
        if (h == this)
            return new h["float"](a, b);
        this._init(a, b)
    };
    d.extend(h["float"].prototype, {_init: function(a, b) {
        this._setOptions(a, b);
        this._render();
        this._bindEvent();
        h.queue[d(a).uid()] = this;
        h.creatStyle(this.opt.options)
    },_setOptions: function(a, b) {
        this.elem = a;
        this.elem.jmp = this;
        var c = this._getAttrOptions(), f = d.copy(h.defaults), f = d.extend(!0, f, c);
        this.opt = d.extend(!0, f, b);
        this.disabled = this.active = !1
    },_getAttrOptions: function() {
        var a = this.elem.getAttribute(h.ATTR_PARAM_NAME);
        return a = (a ? eval("(" + a + ")") : {})
    },_render: function() {
        this._getTip();
        this._getIframe()
    },_getTip: function() {
        var a = this.opt.options, b = a.classNames, c = a.css, f = a.group, g = d(this.elem).uid(), e = document.createElement("div");
        e.innerHTML = d.tmpl.render(a.templs.tipTempl, {id: "jmp-tip-" + g,group: f,tip: b.tip,box: b.box,boxType: b.boxType,boxArrow: b.boxArrow,arrow: b.arrow,loading: b.loading,loadingImg: "loading...",maxWidth: c.maxWidth,minWidth: c.minWidth,content: b.tipContent});
        document.body.appendChild(e.firstChild);
        this.tip = d("#jmp-tip-" + g)[0];
        this.box = d("." + b.box, this.tip)[0];
        this.arrow =
            d("." + b.arrow, this.tip)[0];
        this.loading = d("." + b.loading, this.tip)[0];
        this.content = d("." + b.tipContent, this.tip)[0]
    },_getIframe: function() {
        this.iframe = h.iframe(this.opt.options.group)
    },_bindEvent: function() {
        var a = this, b = this.opt.options, c = b.allowTipHover, f = b.hideTip, g = b.events[b.eventType].split(","), b = g[0].split("|"), g = g[1].split("|");
        this.shows = b;
        this.hides = g;
        this.shows.each(function(b) {
            d(a.elem).bind(b, function() {
                a._readyShow.call(a, arguments)
            })
        });
        g.each(function(b) {
            d(a.elem).bind(b, function() {
                a._readyHide.call(a,
                    arguments)
            })
        });
        d(this.elem).bind("mousemove", a._mousemove.bind(a));
        c && (d(this.tip).bind("mouseover", a._clearTimeouts.bind(a)), f && d(this.tip).bind("mouseout", a._mouseout.bind(a)))
    },_readyShow: function(a) {
        var b = this, c = a[0];
        if (a[1] || h.fixedMouse(c, b.elem))
            b._clearTimeouts(), b.showTimeout = setTimeout(function() {
                b._show.call(b, c)
            }, b.opt.options.showTimeout)
    },_readyHide: function(a) {
        var b = a[0];
        if (a[1] || h.fixedMouse(b, this.elem))
            this._clearTimeouts(), this.hideTimeout = setTimeout(this._hide.bind(this), this.opt.options.hideTimeout)
    },
        _mouseover: function(a) {
            var b = this;
            b._clearTimeouts();
            b.showTimeout = setTimeout(function() {
                b._show(a)
            }, b.opt.options.showTimeout)
        },_mouseout: function() {
            this._clearTimeouts();
            this.hideTimeout = setTimeout(this._hide.bind(this), this.opt.options.hideTimeout)
        },_mousemove: function(a) {
            var b = this;
            this.e = h.fixE(a);
            this.opt.options.followCursor && !this.disabled && this.active && setTimeout(function() {
                b._getPos("mousemove");
                b.position.showDot.length && b._moveBoundary.call(b, b._setPos.bind(b))
            }, 16)
        },_moveBoundary: function(a) {
            var b =
                this.position.showDot.arrow, b = b.split("|"), c = this.opt.options.alignTo, f = !1, d = this.prevShowArrow.split("-");
            if ("cursor" != c) {
                if ("t" == b[0] || "b" == b[0]) {
                    if ("bottomRight" == d[0] || "topRight" == d[0] || "rightBottom" == d[0] || "rightTop" == d[0])
                        this.e.pageX >= this.showEventPos.x && (f = !0);
                    if ("bottomLeft" == d[0] || "topLeft" == d[0] || "leftBottom" == d[0] || "leftTop" == d[0])
                        this.e.pageX <= this.showEventPos.x && (f = !0);
                    if ("topMiddle" == d[0] || "bottomMiddle" == d[0]) {
                        var e = this.position.target_width, c = this.e.pageX - this.showEventPos.x, c =
                            Math.abs(c);
                        c >= e / 2 && (f = !0)
                    }
                }
                if ("l" == b[0] || "r" == b[0]) {
                    if ("rightTop" == d[0] || "topRight" == d[0] || "leftTop" == d[0] || "topLeft" == d[0])
                        this.e.pageY <= this.showEventPos.y && (f = !0);
                    if ("rightBottom" == d[0] || "leftBottom" == d[0] || "bottomRight" == d[0] || "bottomLeft" == d[0])
                        this.e.pageY >= this.showEventPos.y && (f = !0);
                    if ("rightMiddle" == d[0] || "leftMiddle" == d[0])
                        b = this.position.target_height, c = this.e.pageY - this.showEventPos.y, c = Math.abs(c), c >= b / 2 && (f = !0)
                }
            }
            f || a.call(this)
        },_clearTimeouts: function() {
            this.showTimeout && (clearTimeout(this.showTimeout),
                this.showTimeout = 0);
            this.hideTimeout && (clearTimeout(this.hideTimeout), this.hideTimeout = 0);
            this.animateTiemout && (clearTimeout(this.animateTiemout), this.animateTiemout = 0)
        },_show: function() {
            if (!this.disabled) {
                if (this.active) {
                    var a = this.opt.options.timeOnScreen;
                    if (a)
                        this.hideTimeout = setTimeout(this._hide.bind(this), a);
                    else
                        return
                }
                this._update();
                this._updateContent()
            }
        },_update: function() {
            this._hideGroup();
            this._getPos();
            this.showEventPos = this.position.eventPos;
            if (this.position.showDot.length) {
                this._setPos();
                var a = this.opt.options.api;
                a.onBeforeShow.call(this, this.tip);
                h.setIndex(this.iframe);
                h.setIndex(this.tip);
                d(this.tip).css({visibility: "visible"});
                d(this.iframe).css({display: ""});
                this.active = !0;
                a.onShow.call(this, this.tip);
                if (a = this.opt.options.timeOnScreen)
                    this.hideTimeout = setTimeout(this._hide.bind(this), a)
            }
        },_hideGroup: function() {
            d("[group=" + this.opt.options.group + "]").css({visibility: "hidden",left: "-9999px",top: "-9999px"})
        },_getPos: function(a) {
            this.position = {};
            this._getWinPos();
            this._getTargetPos();
            this._getEventPos();
            this._getTipPos();
            this._getSubPos();
            this._getCoordinatesDot();
            this._getAllDot();
            this._getFilterDot();
            this._enableDot();
            this._getShowDot(a)
        },_getWinPos: function() {
            this.position.win_width = h.getViewWidth();
            this.position.win_height = h.getViewHeight();
            this.position.win_scrollTop = h.getViewScrollTop();
            this.position.win_scrollLeft = h.getViewScrollLeft()
        },_getTargetPos: function() {
            var a = d(this.elem).offset();
            this.position.target_left = a.left;
            this.position.target_top = a.top;
            this.position.target_width =
                a.width;
            this.position.target_height = a.height
        },_getEventPos: function() {
            var a = {top: 0,left: 0,right: 0,bottom: 0,x: 0,y: 0};
            try {
                a.top = this.e.pageY - this.position.target_top, a.left = this.e.pageX - this.position.target_left, a.right = this.position.target_width - a.left, a.bottom = this.position.target_height - a.top, a.x = this.e.pageX, a.y = this.e.pageY
            } catch (b) {
            }
            this.position.eventPos = a
        },_getTipPos: function() {
            function a(a) {
                c.box.className = c.box.className.replace((/[trblc]$/), a);
                (c.opt.options.showArrow ? ("c" == a ? c.arrow.style.display =
                    "none" : (c.arrow.style.display = "block", c.arrow.className = c.arrow.className.replace((/[trblc]$/), a))) : c.arrow.style.display = "none");
                b[a] = {width: parseInt(c.tip.offsetWidth, 10),height: parseInt(c.tip.offsetHeight, 10)}
            }
            var b = {}, c = this, d = this.arrow.className, g = ["t", "b", "l", "r", "c"];
            g.each(function(b) {
                a(b)
            });
            b.length = g.length;
            this.position.tipPos = b;
            a(d.charAt(d.length - 1))
        },_getSubPos: function() {
            this.position.sub_left = this.position.target_left;
            this.position.sub_right = this.position.win_width - this.position.target_left -
                this.position.target_width;
            this.position.sub_top = this.position.target_top;
            this.position.sub_bottom = this.position.win_height - this.position.target_top - this.position.target_height
        },_getCoordinatesDot: function() {
            var a = this.position.target_left, b = this.position.target_top, c = this.position.tipPos;
            this.position.coordDot = {topLeft: {left: a,top: b,arrow: "t|l",padding: "l",width: c.t.width,height: c.t.height,offsetX: -8,offsetY: 0},topMiddle: {left: a - c.t.width / 2,top: b,arrow: "t|m",padding: "none",width: c.t.width,height: c.t.height,
                offsetX: 0,offsetY: 0},topRight: {left: a - c.t.width,top: b,arrow: "t|r",padding: "t",width: c.t.width,height: c.t.height,offsetX: 8,offsetY: 0},bottomLeft: {left: a,top: b - c.b.height,arrow: "b|l",padding: "l",width: c.b.width,height: c.b.height,offsetX: -5,offsetY: 0},bottomMiddle: {left: a - c.b.width / 2,top: b - c.b.height,arrow: "b|m",padding: "none",width: c.b.width,height: c.b.height,offsetX: 0,offsetY: 0},bottomRight: {left: a - c.b.width,top: b - c.b.height,arrow: "b|r",padding: "r",width: c.b.width,height: c.b.height,offsetX: 4,offsetY: 0},
                leftTop: {left: a,top: b,arrow: "l|t",padding: "l",width: c.l.width,height: c.l.height,offsetX: 0,offsetY: -8},leftMiddle: {left: a,top: b - c.l.height / 2,arrow: "l|m",padding: "none",width: c.l.width,height: c.l.height,offsetX: 0,offsetY: 0},leftBottom: {left: a,top: b - c.l.height,arrow: "l|b",padding: "l",width: c.l.width,height: c.l.height,offsetX: 0,offsetY: 4},rightTop: {left: a - c.r.width,top: b,arrow: "r|t",padding: "t",width: c.r.width,height: c.r.height,offsetX: 0,offsetY: -8},rightMiddle: {left: a - c.r.width,top: b - c.r.height / 2,arrow: "r|m",
                    padding: "none",width: c.r.width,height: c.r.height,offsetX: 0,offsetY: 0},rightBottom: {left: a - c.r.width,top: b - c.r.height,arrow: "r|b",padding: "b",width: c.r.width,height: c.r.height,offsetX: 0,offsetY: 4},center: {left: a - c.c.width / 2,top: b - c.c.height / 2,arrow: "none",padding: "none",width: c.c.width,height: c.c.height,offsetX: -4,offsetY: 0}}
        },_getAllDot: function() {
            var a = this.position.coordDot, b = {}, c = 0, d = this.position.eventPos, g = this.position.target_width, e = this.position.target_height, g = [["bottomLeft", 0, e, "bottom",
                "Left"], ["bottomMiddle", g / 2, e, "bottom", "Middle"], ["bottomRight", g, e, "bottom", "Right"], ["topLeft", 0, 0, "top", "Left"], ["topMiddle", g / 2, 0, "top", "Middle"], ["topRight", g, 0, "top", "Right"], ["leftTop", 0, 0, "left", "Top"], ["leftMiddle", 0, e / 2, "left", "Middle"], ["leftBottom", 0, e, "left", "Bottom"], ["rightTop", g, 0, "right", "Top"], ["rightMiddle", g, e / 2, "right", "Middle"], ["rightBottom", g, e, "right", "Bottom"], ["center", g / 2, e / 2, "center", "center"]], h = this.active, i = this.opt.options.alignTo, m = this.opt.options.followCursor, d =
                this.position.eventPos, e = {top: 0,left: 0,right: 0,bottom: 0,x: 0,y: 0}, k = this.showEventPos;
            ("cursor" != i ? m && h && (e = {top: d.top - k.top,left: d.left - k.left,right: d.right - k.right,bottom: d.bottom - k.bottom,x: d.x - k.x,y: d.y - k.y}) : e = d);
            d = 0;
            for (h = g.length; d < h; d++) {
                var i = g[d][0], m = g[d][1], k = g[d][2], j;
                for (j in a) {
                    var r = a[j].left + m, l = a[j].top + k, s = a[j].width, w = a[j].height, x = a[j].arrow, y = a[j].padding, u = a[j].offsetX, A = a[j].offsetY, v = x.split("|")[0];
                    if ("t" == v || "b" == v)
                        r = (r + u > e.x ? r - e.right : r + e.left);
                    else if ("l" == v || "r" == v)
                        l = (l + A >
                            e.y ? l - e.bottom : l + e.top);
                    var v = this._overBoundary(r, l, s, w, u, A), n = r, p = l, q = v;
                    v && (q = this._adjustPos(r, l), n = q.left, p = q.top, q = q.boundary);
                    b[i + "-" + j] || (b[i + "-" + j] = {left: r,top: l,arrow: x,padding: y,boundary: v,adjustLeft: n,adjustTop: p,adjustBoundary: q,width: s,height: w,offsetX: u,offsetY: A}, c++)
                }
            }
            b.length = c;
            this.position.allDot = b
        },_getFilterDot: function() {
            for (var a = [["top", "Left"], ["top", "Middle"], ["top", "Right"], ["bottom", "Left"], ["bottom", "Middle"], ["bottom", "Right"], ["left", "Top"], ["left", "Middle"], ["left",
                "Bottom"], ["right", "Top"], ["right", "Middle"], ["right", "Bottom"]], b = ["Left", "Middle", "Right"], c = ["Top", "Middle", "Bottom"], d = [], g = 0; g < a.length; g++) {
                var e = a[g][0], h = a[g][1];
                if ("top" == e)
                    for (e = 0; e < b.length; e++)
                        d.push("topLeft-bottom" + b[e]), d.push("topMiddle-bottom" + b[e]), d.push("topRight-bottom" + b[e]);
                else if ("bottom" == e)
                    for (e = 0; e < b.length; e++)
                        d.push("bottomLeft-top" + b[e]), d.push("bottomMiddle-top" + b[e]), d.push("bottomRight-top" + b[e]);
                else if ("left" == e)
                    for (e = 0; e < b.length; e++)
                        d.push("leftTop-right" + c[e]),
                            d.push("leftMiddle-right" + c[e]), d.push("leftBottom-right" + c[e]);
                else if ("right" == e)
                    for (e = 0; e < b.length; e++)
                        d.push("rightTop-left" + c[e]), d.push("rightMiddle-left" + c[e]), d.push("rightBottom-left" + c[e]);
                if ("Top" == h)
                    for (e = 0; e < c.length; e++)
                        d.push("leftTop-bottom" + b[e]), d.push("rightTop-bottom" + b[e]);
                else if ("Bottom" == h)
                    for (e = 0; e < c.length; e++)
                        d.push("leftBottom-top" + b[e]), d.push("rightBottom-top" + b[e]);
                else if ("Left" == h)
                    for (e = 0; e < c.length; e++)
                        d.push("topLeft-right" + c[e]), d.push("bottomLeft-right" + c[e]);
                else if ("Right" == h)
                    for (e = 0; e < c.length; e++)
                        d.push("topRight-left" + c[e]), d.push("bottomRight-left" + c[e])
            }
            a = {};
            b = this.position.allDot;
            for (g = c = 0; g < d.length; g++)
                h = d[g], b[h] && (a[h] = b[h], c++);
            a.length = c;
            this.position.allDot = a
        },_enableDot: function() {
            var a = {}, b = this.position.allDot, c = 0, d;
            for (d in b)
                if ("length" != d) {
                    var g = b[d];
                    g.boundary || (a[d] = g, c++)
                }
            a.length = c;
            this.position.enableDot = a
        },_overBoundary: function(a, b, c, d, g, e) {
            var h = !1, i = this.position.win_width, m = this.position.win_height, j = this.position.win_scrollTop,
                z = this.position.win_scrollLeft;
            this.opt.options.showArrow || (e = g = 0);
            if (0 > a + g || 0 > b + e)
                return !0;
            if (a + g + c > i + z || b + d + e > m + j)
                h = !0;
            return h
        },_adjustPos: function(a, b) {
            return {left: a,top: b,boundary: !0}
        },_getShowDot: function(a) {
            var b = this.opt.options.position, c = this.opt.options.boundaryShow, d = this.position.allDot, g = this.position.enableDot, e = {}, h = 0;
            if ("mousemove" == a) {
                if (g[this.prevShowArrow] && (e = g[this.prevShowArrow], h++), !h && c && d[this.prevShowArrow])
                    e = d[this.prevShowArrow], h++
            } else if (g[b] && (e = g[b], h++), h)
                this.prevShowArrow =
                    b;
            else if (c)
                d[b] && (e = d[b], h++);
            else {
                for (var i in g)
                    if ("length" != i) {
                        e = g[i];
                        this.prevShowArrow = i;
                        h++;
                        break
                    }
                !h && d[b] && (e = d[b], h++)
            }
            e.length = h;
            this.position.showDot = e;
            h && (this._adjustClass(), this._calculateArrow())
        },_adjustClass: function() {
            var a = this.position.showDot.arrow.split("|")[0], b = this.opt.options.position.indexOf("-center");
            (this.opt.options.showArrow && -1 == b ? (this.box.className = this.box.className.replace((/[trblc]$/), a), this.arrow.style.display = "", this.arrow.className = this.arrow.className.replace((/[trblc]$/),
                a)) : (this.box.className = this.box.className.replace((/[trblc]$/), "c"), this.arrow.style.display = "none"))
        },_calculateArrow: function() {
            var a = this.position.showDot.arrow.split("|");
            d(this.arrow).css({left: "",right: "",bottom: "",top: "",marginTop: ""});
            var b = this.position.tipPos[a[0]], c = b.width, b = b.height;
            ("t" == a[0] ? (this.arrow.style.marginTop = "-7px", ("l" == a[1] ? this.arrow.style.left = "0" : ("m" == a[1] ? this.arrow.style.left = c / 2 - 8 + "px" : "r" == a[1] && (this.arrow.style.left = c - 16 + "px")))) : ("r" == a[0] ? (this.arrow.style.right = "-7px",
                ("t" == a[1] ? this.arrow.style.marginTop = "0px" : ("m" == a[1] ? this.arrow.style.marginTop = b / 2 - 8 + "px" : "b" == a[1] && (this.arrow.style.marginTop = b - 16 + "px")))) : ("b" == a[0] ? ("l" == a[1] ? this.arrow.style.right = c - 16 + "px" : ("m" == a[1] ? this.arrow.style.right = c / 2 - 8 + "px" : "r" == a[1] && (this.arrow.style.right = "0px"))) : "l" == a[0] && (this.arrow.style.left = "2px", ("t" == a[1] ? this.arrow.style.marginTop = "0px" : ("m" == a[1] ? this.arrow.style.marginTop = b / 2 - 8 + "px" : "b" == a[1] && (this.arrow.style.marginTop = b - 16 + "px")))))))
        },_setPos: function() {
            var a = this.position.showDot,
                b = a.width, c = a.height;
            if (this.opt.options.showArrow)
                var f = a.top + a.offsetY, a = a.left + a.offsetX;
            else
                f = a.top, a = a.left;
            b = Math.floor(b);
            c = Math.floor(c);
            f = Math.floor(f);
            a = Math.floor(a);
            d(this.tip).css({left: a + "px",top: f + "px"});
            d(this.iframe).css({width: b + "px",height: c + "px",top: f + "px",left: a + "px"})
        },_updateContent: function() {
            function a(a, c) {
                this.loadFlag[a] = !0;
                c && (this.loadFlag.error += c);
                this.loadFlag.template && this.loadFlag.content && b()
            }
            function b() {
                if (c.loadFlag.error)
                    var a = c.loadFlag.error;
                else {
                    var a =
                    {}, b = c.opt.options.format;
                    (b ? a.txt = ("function" == d.type(b) ? b(c.data.txt) : h.hotelBreakfast(c.data.txt)) : a = c.data);
                    a = d.tmpl.render(c.temp, a)
                }
                d(c.loading).css({display: "none"});
                d(c.content).html(a);
                d(c.content).css({display: "block",width: "100%"});
                d(c.tip)[0].style.width = d(c.tip)[0].offsetWidth + "px";
                c.opt.options.isAnimate && (h.fade(c.tip, 0), h.animate(c.tip, [[0, 1, "opacity", ""]], 680, function() {
                }));
                c._calcPos()
            }
            var c = this;
            c.loadFlag = {template: !1,content: !1,error: ""};
            c._setTemplate(a);
            c._setContent(a)
        },_setTemplate: function(a) {
            var b =
                this, c = this.opt.options.template, f = this.opt.options.templateUrl;
            if ("#" === c.charAt(0))
                b.temp = d(c).html(), a.call(b, "template");
            else if ("$" === c.charAt(0))
                b.temp = this.opt.options.templs[this.opt.options.type], a.call(b, "template");
            else {
                var g = f + c;
                (h.jmpTemps[g] ? (b.temp = h.jmpTemps[g], a.call(b, "template")) : h.load({url: g,onsuccess: function(c, d) {
                    b.temp = d;
                    h.jmpTemps[g] = d;
                    a.call(b, "template")
                },onerror: function(c) {
                    var d = "", d = (c.responseXML ? c.responseXML : c.responseText);
                    a.call(b, "content", d)
                }}))
            }
        },_setContent: function(a) {
            var b =
                this, c = this.opt.options, d = c.dataUrl, g = c.url, c = c.content;
            (g ? (g = d + g, (h.jmpDatas[g] ? (b.data = h.jmpDatas[g], a.call(b, "content")) : h.load({url: g,onsuccess: function(c, d) {
                var f = {};
                try {
                    f = eval("(" + d + ")")
                } catch (i) {
                    f = {data: d}
                }
                b.data = f;
                h.jmpDatas[g] = b.data;
                a.call(b, "content")
            },onerror: function(c) {
                var d = "", d = (c.responseXML ? c.responseXML : c.responseText);
                a.call(b, "content", d)
            }}))) : (b.data = c || {}, a.call(b, "content")))
        },_calcPos: function() {
            this._getTipPos();
            this._getCoordinatesDot();
            this._getAllDot();
            this._getFilterDot();
            this._enableDot();
            this._getShowDot();
            this.showEventPos = this.position.eventPos;
            this.position.showDot.length && this._setPos()
        },_hide: function() {
            function a() {
                d(this.tip).css({visibility: "hidden",left: "-9999px",top: "-9999px"});
                d(this.iframe).css("display", "none");
                this.active = !this.active;
                c.onHide.call(this)
            }
            if (!this.disabled && this.active) {
                var b = this, c = b.opt.options.api;
                c.onBeforeHide.call(b);
                (b.opt.options.isAnimate ? h.animate(b.tip, [[1, 0, "opacity", ""]], 680, function() {
                    a.call(b)
                }) : a.call(b))
            }
        },execute: function() {
            -1 <
                this.shows.join("").indexOf("mouseover") && d(this.elem).trigger("mouseover", {arguments: [!0]})
        },show: function() {
            var a = this;
            this.shows.each(function(b) {
                (-1 != b.indexOf("mouseover") ? d(a.elem).trigger(b, {arguments: [!0]}) : d(a.elem).trigger(b))
            })
        },hide: function() {
            var a = this;
            this.hides.each(function(b) {
                d(a.elem).trigger(b)
            })
        },disable: function() {
            this.disabled = !0
        },enable: function() {
            this.disabled = !1
        },refresh: function(a) {
            this._destroy();
            this._setOptions(this.elem, a);
            this._render();
            this._bindEvent();
            h.queue[d(this.elem).uid()] =
                this
        },_destroy: function() {
            this._clearTimeouts();
            h.queue[d(this.elem).uid()] = null;
            var a = this.tip.parentNode;
            a.parentNode.removeChild(a)
        }});
    h.ATTR_PARAM_NAME = "data-params";
    h.client = function() {
        var a = document;
        return ("BackCompat" == a.compatMode ? a.body : a.documentElement)
    }();
    h.fixE = function(a) {
        a = window.event || a;
        a.target || (a.target = a.srcElement || document);
        3 === a.target.nodeType && (a.target = a.target.parentNode);
        !a.relatedTarget && a.fromElement && (a.relatedTarget = (a.fromElement === a.target ? a.toElement : a.fromElement));
        var b = document.documentElement;
        if (null == a.pageX && null != a.clientX) {
            var c = document.body;
            a.pageX = a.clientX + (b && b.scrollLeft || c && c.scrollLeft || 0) - (b && b.clientLeft || c && c.clientLeft || 0);
            a.pageY = a.clientY + (b && b.scrollTop || c && c.scrollTop || 0) - (b && b.clientTop || c && c.clientTop || 0)
        }
        return a
    };
    h.groupeQueue = {};
    h.defaults = {options: {group: "group",alignTo: "target",followCursor: !1,allowTipHover: !0,showTimeout: 300,hideTimeout: 100,timeOnScreen: 0,hideTip: !0,showArrow: !0,boundaryShow: !1,position: "bottomLeft-topLeft",updateCss: !1,
        isAnimate: !1,styles: ".tuna_jmpinfo form,h1,h2,h3,h4,ul,ol,li,dl,dd,dt,p,hr,input{margin: 0;padding: 0}.tuna_jmpinfo {margin: 20px;color: #333;font: 12px/2 Arial,Tahoma,simsun;-webkit-text-size-adjust: none;}.tuna_jmpinfo ul,li{list-style: none;}.tuna_jmpinfo a{color: #00c;cursor: pointer;text-decoration: none;}.tuna_jmpinfo a: hover{color: #f00;text-decoration: underline;}.tuna_jmpinfo .font16{font-size: 16px;}.tuna_jmpinfo .jmp_hd{height:30px; padding-left:10px; background:url(http://pic.ctrip.com/common/un_base_btn.png) repeat-x 0 -390px; font-size:12px; line-height:30px; color:#333;} .tuna_jmpinfo .jmp_hd h3{font-size: 12px;} .tuna_jmpinfo .jmp_bd{padding: 8px 10px;} .tuna_jmpinfo .jmp_title, .jmp_table{border: 1px solid #67a1e2; background: #fff;} .tuna_jmpinfo .jmp_alert{border: 1px solid #ffb533; background: #fff5d1;} .tuna_jmpinfo .jmp_text{border: 1px solid #67a1e2; background: #e8f4ff;} .tuna_jmpinfo .base_jmp b{position: absolute; width: 16px; height: 16px; background-image: url(http://pic.ctrip.com/common/un_jmp_tri.png); background-repeat: no-repeat; overflow: hidden;} .tuna_jmpinfo .base_jmp_t{margin-top: 8px;} .tuna_jmpinfo .base_jmp_r{margin-right: 8px;} .tuna_jmpinfo .base_jmp_b{margin-bottom: 7px;} .tuna_jmpinfo .base_jmp_l{margin-left: 8px;} .tuna_jmpinfo .base_jmp_t b{margin-top: -7px;} .tuna_jmpinfo .base_jmp_r b{margin-top: 10px; right: 0;} .tuna_jmpinfo .base_jmp_b b{bottom: -8px;} .tuna_jmpinfo .base_jmp_l b{margin-top: 10px; left: 9px;} .tuna_jmpinfo .jmp_title .tri_t, .jmp_text .tri_t{background-position: 0 0;} .tuna_jmpinfo .jmp_title .tri_r, .jmp_text .tri_r{background-position: 0 -16px;} .tuna_jmpinfo .jmp_title .tri_b{background-position: -32px -32px;} .tuna_jmpinfo .jmp_title .tri_l, .jmp_text .tri_l{background-position: 0 -48px;} .tuna_jmpinfo .jmp_text .tri_b{background-position: 0 -32px;} .tuna_jmpinfo .jmp_alert .tri_t{background-position: -16px 0;} .tuna_jmpinfo .jmp_alert .tri_r{background-position: -16px -16px;} .tuna_jmpinfo .jmp_alert .tri_b{background-position: -16px -32px;} .tuna_jmpinfo .jmp_alert .tri_l{background-position: -16px -48px;} .tuna_jmpinfo .jmp_table .tri_t{background-position: -32px 0;} .tuna_jmpinfo .jmp_table .tri_r{background-position: -32px -16px;} .tuna_jmpinfo .jmp_table .tri_b{background-position: -32px -32px;} .tuna_jmpinfo .jmp_table .tri_l{background-position: -32px -48px;} .tuna_jmpinfo .jmp_tab_list{position:relative; padding:10px 10px 0; overflow:hidden; z-index:99; zoom:1;} .tuna_jmpinfo .jmp_tab_list li{float:left;} .tuna_jmpinfo .jmp_tab_list li.current{border:1px solid #67A1E2; border-bottom:1px solid #E8F4FF;} .tuna_jmpinfo .jmp_tab_list li a{display:inline-block; padding:4px 10px 3px;} .tuna_jmpinfo .jmp_tab_list li.current a{border-top:1px solid #fff; color:#333; font-weight:bold;} .tuna_jmpinfo .jmp_tab_bd{ margin:-1px 10px 10px; padding-top:10px; border-top:1px solid #67A1E2; background:#E8F4FF;zoom:1;} .data_form{width: 100%; border-collapse: collapse; border: 2px solid #fff; *border-width: 1px; font:normal 12px Verdana, Simsun;} .data_form th{padding: 5px 10px; border: 1px solid #ccc; text-align: left;} .data_form td{padding: 5px 10px; border: 1px solid #ccc;}.tuna_jmpinfo .active{display:block;}.hotel_everyday_list th { background:#F1F1F1; white-space: nowrap; height:25px; text-align:center; font-weight:normal; }.hotel_everyday_list td { width:60px; margin:0; padding:0; text-align:center; vertical-align: top; line-height:20px; background:url(http://pic.c-ctrip.com/mystery_hotels/bg_hotel_breakfast.gif) repeat-x 0 39px; }.hotel_everyday_price { color:#E56700; display:block; }.hotel_everyday_list .hotel_everyday_price em { color:green; font-style:normal; }.hotel_everyday_list span em { color:gray; font-style:normal; }.hotel_everyday_nobreakfast { color:#b4b4b4; }",
        loadingImg: '<img src="images/loading75.gif"/>',css: {maxWidth: "260",minWidth: "50"},type: "jmp_alert",template: "#jmp_alert",templateUrl: "template/",dataUrl: "data/",eventType: "def",events: {def: "mouseover,mouseout",input: "focus,blur",widget: "focus|mouseover,blur|mouseout"},content: {txt: "\u4eca\u5929\u662f2010\u5e74\u4e0a\u534a\u5e74\u6700\u540e\u4e00\u4e2a\u4ea4\u6613\u65e5\uff0c\u6caa\u6df1\u80a1\u5e02\u5728\u6628\u65e5\u66b4\u8dcc\u9634\u5f71\u4e0b\u7ee7\u7eed\u4e0b\u63a2\uff0c\u6700\u7ec8\u8dcc\u78342400\u70b9\u6574\u6570\u5173\u53e3\u3002\u7edf\u8ba1\u6570\u636e\u663e\u793a\uff0c\u4e0a\u8bc1\u7efc\u6307\u4e0e\u6df1\u8bc1\u6210\u6307\u4eca\u5e74\u6765\u5206\u522b\u4e0b\u8dcc26.82%\u548c31.48%\u3002"},
        api: {onBeforeShow: function() {
        },onBeforeHide: function() {
        },onShow: function() {
        },onHide: function() {
        }},adjust: {scroll: !1,resize: !1},classNames: {tip: "tuna_jmpinfo",box: "base_jmp",boxType: "jmp_alert",boxArrow: "base_jmp_t",arrow: "tri_t",loading: "jmp_loading",tipContent: "jmp_content"},templs: {tipTempl: '<div id=${id} class=${tip}  group=${group} style="visibility:hidden;display:block;z-index:99;margin:0;left:-9999px;top:-9999px;position:absolute;max-width:${maxWidth}px;min-width:${minWidth}px;_width:expression((this.offsetWidth>${maxWidth})?\'${maxWidth}px\':true);"><div class="${box} ${boxType} ${boxArrow}"><b class="${arrow}"></b><div class="${loading}">${loadingImg}</div><div class=${content}></div></div></div>',
            jmp_table: "${txt}",jmp_title: '<div class="jmp_hd"> <h3>${title}</h3> </div><div class="jmp_bd">${txt}</div>',jmp_alert: '<div class="jmp_bd">${txt}</div>',jmp_text: '<div class="jmp_bd">${txt}</div>',jmp_tab_list: "${txt}"}},methods: {},listeners: {}};
    h.queue = {};
    h.jmpTemps = [];
    h.jmpDatas = [];
    h.isJmp = function(a) {
        function b(a, b) {
            var d = a.getAttribute("data-role") || null;
            return (!d || !b ? !1 : (d !== b ? !1 : !0))
        }
        for (; !b(a, "jmp") && document.documentElement != a; )
            a = a.parentNode;
        return (a == document.documentElement ? null : a)
    };
    h.creatStyle =
        function(a) {
            var b = a.styles;
            if (a.updateCss || !h.isFirstRegister)
                ((h.isFirstRegister || (h.isFirstRegister = !0), d.browser.isIE) ? (sty = document.createStyleSheet(), sty.cssText = b) : (sty = document.createElement("style"), sty.type = "text/css", sty.textContent = b, document.getElementsByTagName("head")[0].appendChild(sty)))
        };
    h.iframe = function(a) {
        var b = d("#jmp-iframe-type-" + a)[0];
        b || (b = document.createElement("iframe"), b.setAttribute("frameborder", "0", 0), b.setAttribute("id", "jmp-iframe-type-" + a), b.style.cssText = "position:absolute;filter:alpha(opacity=0);display:none;",
            document.body.insertBefore(b, document.body.childNodes[0]));
        return b
    };
    h.load = function(a) {
        a = d.extend({url: "",onsuccess: function() {
        },onerror: function() {
        }}, a);
        d.ajax(a.url, {onsuccess: function(b, c) {
            a.onsuccess(b, c)
        },onerror: function(b) {
            a.onerror(b)
        }})
    };
    h.animate = function(a, b, c, d) {
        function g(c) {
            for (var d, f, g, h, i = 0, m = b.length; i < m; i++) {
                d = b[i];
                from = d[0];
                g = d[1];
                h = d[2];
                d = d[3];
                f = from;
                g -= from;
                var j, s = c;
                j = (1 > (s /= 0.5) ? 0.5 * Math.pow(s, 2) : -0.5 * ((s -= 2) * s - 2));
                f += g * j;
                ("opacity" == h ? (a.style[h] = f, a.style.filter = "alpha(opacity=" +
                    100 * f + ")") : a.style[h] = f + d)
            }
        }
        clearInterval(a._timer);
        (function(b, c, d) {
            var f, g, h = +new Date;
            a._timer = setInterval(function() {
                g = +new Date - h;
                f = g / d;
                (1 <= f ? (clearInterval(a._timer), c(f)) : b(f))
            }, 13)
        })(g, function(b) {
            g(b);
            d.call(a)
        }, c)
    };
    h.fade = function(a, b) {
        a.style.opacity = b;
        a.style.filter = "alpha(opacity=" + 100 * b + ")"
    };
    h.zIndex = 999;
    h.setIndex = function(a) {
        d(a).css({zIndex: h.zIndex + 1});
        h.zIndex++
    };
    h.isFirstRegister = !1;
    h.getViewHeight = function() {
        var a = 0;
        return a = (self.innerHeight ? self.innerHeight : h.client.clientHeight)
    };
    h.getViewWidth = function() {
        var a = 0;
        return a = (self.innerHeight ? self.innerWidth : h.client.clientWidth)
    };
    h.getViewScrollTop = function() {
        return h.client.scrollTop
    };
    h.getViewScrollLeft = function() {
        return h.client.scrollLeft
    };
    h.fixedMouse = function(a, b) {
        var c;
        c = a.type.toLowerCase();
        if ("mouseover" == c)
            c = a.relatedTarget || a.fromElement;
        else if ("mouseout" == c)
            c = a.relatedTarget || a.toElement;
        else
            return !0;
        return c && "xul" != c.prefix && !(b.contains ? b != c && b.contains(c) : b.compareDocumentPosition(c) & 16) && c !== b
    };
    h.hotelBreakfast =
        function(a) {
            for (var b = a.split("|"), a = '<table cellspacing="0" cellpadding="0" style="margin:6px;" class="hotel_everyday_list">\t\t<colgroup>\t\t\t<col width="45" span="7" />\t\t</colgroup>\t\t<tbody>\t\t<tr>\t\t\t<th> </th>\t\t\t<th>' + b[0] + "</th>\t\t\t<th>" + b[1] + "</th>\t\t\t<th>" + b[2] + "</th>\t\t\t<th>" + b[3] + "</th>\t\t\t<th>" + b[4] + "</th>\t\t\t<th>" + b[5] + "</th>\t\t\t<th>" + b[6] + "</th>", c = b.length, d = "", g = 0, e = 7; e < c; e++)
                (0 == (e - 7) % 15 ? (d += "</tr><tr><td>" + b[e] + "</td>", g++) : (e++, d += '<td><span class="hotel_everyday_price">' +
                    b[e - 1] + "</span> <span>" + b[e] + "</span></td>"));
            b = (15 * g - (c - 7)) / 2;
            for (c = 0; c < b; c++)
                d += '<td><span class="hotel_everyday_price"></span><span></span></td>';
            return a + d + "</tr></tbody></table>"
        };
    d.extend(h.prototype, {init: function(a, b) {
        if (a == document)
            d(a).bind("mouseover", function(a) {
                a = h.fixE(a).target;
                (a = h.isJmp(a)) && h["float"](a, b).execute()
            });
        else
            h["float"](a, b)
    },getTip: function(a) {
        return h.queue[d(a).uid()] || null
    }});
    d.mod.reg(j)
})(cQuery);
(function(d) {
    function h(d, h) {
        this._init(d, h)
    }
    var j = {name: "notice",version: "1.0",init: function() {
    },uninit: function() {
    },module: h};
    (function() {
        var d = cQuery.fn.value;
        cQuery.fn.value = function(h) {
            if (h == cQuery.undefined) {
                var a = this[0];
                if (!a)
                    return "";
                if (a.getAttribute("_cqnotice") === cQuery.undefined)
                    return d.call(this, h);
                h = a.value;
                return (h == a.getAttribute("_cqnotice") || "" == h ? "" : h)
            }
            return d.call(this, h)
        }
    })();
    d.extend(h.prototype, {target: null,target_get: function() {
        return this.target
    },name: null,name_get: function() {
        return this.name
    },
        name_set: function(d) {
            this.name = d;
            this._checkEnable()
        },tips: null,tips_get: function() {
            return this.tips
        },tips_set: function(d) {
            this.tips = d
        },defaultClass: null,defaultClass_get: function() {
            return this.defaultClass
        },defaultClass_set: function(d) {
            this.defaultClass = d
        },selClass: null,selClass_get: function() {
            return this.selClass
        },selClass_set: function(d) {
            this.selClass = d
        },_init: function(h, i) {
            (!i.name || "string" != d.type(name) ? cQuery.error("mod (" + j.name + "," + j.version + ") init", "invalid name " + name) : (this.target = d(h),
                this.name = i.name, this.selClassText = i.selClassText || " ", this.selClass = i.selClass || " ", this.tips = i.tips, this.target[0].setAttribute("_cqnotice", i.tips), d.bindMethod(this), this._showTips(), this.bindEvent()))
        },_checkValue: function() {
            return "" == this.target.value().trim() || this.target.value() == this.tips
        },_showTips: function() {
            if (this._checkValue()) {
                var d = this.tips;
                this.target.addClass(this.selClass);
                this.target[0].style.cssText += this.selClassText;
                this.target.value(d)
            }
        },_hideTips: function() {
            if (this._checkValue()) {
                var d =
                    this.selClassText;
                this.target.removeClass(this.selClass);
                this.target[0].style.cssText = this.target[0].style.cssText.replace(d, "", "g");
                this.target[0].value = ""
            }
        },isEmpty: function() {
            return this._checkValue()
        },resetValue: function() {
            this.target.value("");
            this._showTips()
        },checkValue: function() {
            var d = this.selClass;
            (this.isEmpty() ? (this.target.value(this.tips), this.target.addClass(d)) : this.target.removeClass(d))
        },setRealValue: function() {
            this.isEmpty() && this.target.value("")
        },bindEvent: function() {
            this.target.bind("focus",
                this._hideTips, {priority: 10});
            this.target.bind("blur", this._showTips, {priority: 100})
        }});
    d.mod.reg(j)
})(cQuery);
(function(d) {
    function h(d, h) {
        this.init(d, h)
    }
    var j = {name: "validate",version: "1.1",init: function() {
    },uninit: function() {
    },module: h};
    d.extend(h.prototype, {init: function() {
        function h() {
            (new Date).getTime()
        }
        function i(a) {
            h();
            if (!a)
                throw new "\u4f20\u5165\u7684\u503c\u4e0d\u80fd\u4e3a\u7a7a\uff01";
            if (!a.$obj)
                throw new "\u4f20\u5165\u7684\u503c\u4e2d\u4e0d\u5b58$obj\u5c5e\u6027\uff01";
            if (!d.isCDom(a.$obj))
                throw new "\u4f20\u5165\u7684\u503c\u4e2d\uff1a$obj\u5c5e\u6027\u4e0d\u662fcDom\u5bf9\u8c61\uff01";
            var b =
                d.copy(s);
            return a = d.extend(b, a)
        }
        function a(a, b) {
            h();
            var c = b || function() {
            }, d;
            if (d = l[a]) {
                var f = d.iframe, e = d.fun;
                -1 == e.indexOf(c) && e.push(c);
                if (d.loaded) {
                    d = 0;
                    for (var g = e.length; d < g; d++)
                        c = e[d], c(f);
                    e.length = 0
                } else
                    setTimeout(arguments.callee, 200)
            } else {
                var i = document.createElement("iframe");
                i.src = "about:blank";
                i.id = "ifr_" + a;
                i.frameBorder = "no";
                i.border = "0";
                i.marginWidth = "0";
                i.marginHeight = "0";
                i.backgroundColor = "transparent";
                i.scrolling = "no";
                i.setAttribute("group", a);
                i.style.cssText = "position:absolute;allowTransparency='true';left:-9999px;top: -9999px;background-color:transparent;";
                l[a] = {iframe: i,loaded: !1,elems: {},fun: []};
                (i.attachEvent ? i.attachEvent("onload", function() {
                    l[a].loaded = !0;
                    c(i)
                }) : i.onload = function() {
                    l[a].loaded = !0;
                    c(i)
                });
                document.body.appendChild(i)
            }
        }
        function b() {
            var a = l[r.group].elems[r.uid];
            return a[a.length - 1]
        }
        function c() {
            function a(b) {
                var f = {leftTop: 5,rightTop: 5,rightBottom: 5,leftBottom: 5,x: 3,y: 3}, b = d.extend({}, f, b || {}), e = b.leftTop + "px " + b.rightTop + "px " + b.rightBottom + "px " + b.leftBottom + "px", e = (c.opt.showArrow ? b.leftTop + "px " + b.rightTop + "px " + b.rightBottom + "px " +
                    b.leftBottom + "px" : f.leftTop + "px " + f.rightTop + "px " + f.rightBottom + "px " + f.leftBottom + "px");
                c.$box.css({MozBorderRadius: e,borderRadius: "" + e});
                c.$tip.css({MozBorderRadius: e,borderRadius: "" + e})
            }
            h();
            var c = b(), f = c.dot.arrow;
            c.$box.css({MozBorderRadius: "0",borderRadius: "0"});
            c.$tip.css({webkitBoxShadow: "0",MozBoxShadow: "0",boxShadow: "0"});
            c.$arrow.css({left: "",right: "",bottom: "",top: "",marginTop: ""});
            var e = c.dot.width, g = c.dot.height;
            ("t" == f[0] ? (c.$arrow[0].style.marginTop = "-7px", ("l" == f[1] ? (c.$arrow[0].style.left =
                "0", a({leftTop: 0})) : ("m" == f[1] ? (c.$arrow[0].style.left = e / 2 - 8 + "px", a()) : "r" == f[1] && (c.$arrow[0].style.left = e - 16 + "px", a({rightTop: 0,x: -10}))))) : ("r" == f[0] ? (c.$arrow[0].style.right = "-7px", ("t" == f[1] ? (c.$arrow[0].style.marginTop = "0px", a({rightTop: 0,x: -10})) : ("m" == f[1] ? (c.$arrow[0].style.marginTop = g / 2 - 8 + "px", a({x: -10})) : "b" == f[1] && (c.$arrow[0].style.marginTop = g - 16 + "px", a({rightBottom: 0,x: -10,y: -10}))))) : ("b" == f[0] ? ("l" == f[1] ? (c.$arrow[0].style.right = e - 16 + "px", a({leftBottom: 0,y: -10})) : ("m" == f[1] ? (c.$arrow[0].style.right =
                e / 2 - 8 + "px", a({y: -10})) : "r" == f[1] && (c.$arrow[0].style.right = "0px", a({rightBottom: 0,x: -10,y: -10})))) : "l" == f[0] && (c.$arrow[0].style.left = "2px", ("t" == f[1] ? (c.$arrow[0].style.marginTop = "0px", a({leftTop: 0})) : ("m" == f[1] ? (c.$arrow[0].style.marginTop = g / 2 - 8 + "px", a()) : "b" == f[1] && (c.$arrow[0].style.marginTop = g - 16 + "px", a({leftBottom: 0,y: -10}))))))))
        }
        function f(a) {
            "-9999px" != a.$tip[0].style.left && (a.$tip.css({left: "-9999px",top: "-9999px"}), a.show = !1, a.opt.hide(a.elem), a.opt.errorClass && a.opt.removeErrorClass && d(a.elem).removeClass(a.opt.errorClass));
            a.iframe != a.doc && (a = a.iframe, "-9999px" != a.style.left && d(a).css({left: "-9999px",top: "-9999px",width: "auto",height: "auto"}))
        }
        function g(a) {
            var b = 0;
            if (a)
                if ("string" == typeof a)
                    b = 2;
                else if (d.isCDom(a))
                    b = 3;
                else
                    throw new "hide::\u6ca1\u6709\u627e\u5230\u5408\u9002\u7684\u7c7b\u578b";
            else
                b = 1;
            for (var c in l) {
                var e = l[c].elems, h = !1;
                if (3 == b)
                    if (e[a.uid()])
                        e = {temp: e[a.uid()]};
                    else
                        continue;
                for (var g in e) {
                    for (var i = e[g], j = 0, k = i.length; j < k; j++)
                        if (1 == b || 3 == b)
                            i[j].show && f(i[j]);
                        else if (2 == b && i[j].hideID == a && i[j].show) {
                            f(i[j]);
                            h = !0;
                            break
                        }
                    if (h)
                        break
                }
            }
        }
        function e(a, b, c, d) {
            function f(c) {
                for (var d, e, h, g, i = 0, j = b.length; i < j; i++) {
                    d = b[i];
                    from = d[0];
                    h = d[1];
                    g = d[2];
                    d = d[3];
                    e = from;
                    h -= from;
                    var u, k = c;
                    u = (1 > (k /= 0.5) ? 0.5 * Math.pow(k, 2) : -0.5 * ((k -= 2) * k - 2));
                    e += h * u;
                    ("opacity" == g ? (a.style[g] = e, a.style.filter = "alpha(opacity=" + 100 * e + ")") : a.style[g] = e + d)
                }
            }
            clearInterval(a._timer);
            (function(b, c, d) {
                var f, e, h = +new Date;
                a._timer = setInterval(function() {
                    e = +new Date - h;
                    f = e / d;
                    (1 <= f ? (clearInterval(a._timer), c(f)) : b(f))
                }, 13)
            })(f, function(b) {
                f(b);
                d.call(a)
            }, c)
        }
        function j(a,
                   b) {
            a.style.opacity = b;
            a.style.filter = "alpha(opacity=" + 100 * b + ")"
        }
        function o() {
            h();
            var a = b(), c = a.dot, f = c.width, g = c.height;
            if (a.opt.showArrow)
                var i = c.top + c.offsetY, c = c.left + c.offsetX;
            else
                i = c.top, c = c.left;
            f = Math.floor(f);
            g = Math.floor(g);
            a.opt.errorClass && d(a.elem).addClass(a.opt.errorClass);
            a.opt.animate && (j(a.$tip[0], 0), e(a.$tip[0], [[0, 1, "opacity", ""]], 680, function() {
            }));
            (a.iframe == a.doc ? a.$tip.css({top: i + "px",left: c + "px"}) : (a.$tip.css({left: "0px",top: "0px"}), d(a.iframe).css({top: i + "px",left: c + "px",width: f +
                "px",height: g + "px"})));
            a.show = !0;
            a.opt.show(a);
            a.opt.isFocus && d(a.elem)[0].focus();
            (a.opt.hideEvent ? (d(a.elem).unbind(a.opt.hideEvent, t), d(a.elem).bind(a.opt.hideEvent, t)) : (d(a.elem.ownerDocument).unbind("mousedown", t), d(a.elem.ownerDocument).bind("mousedown", t)));
            a.opt.endshow(a)
        }
        function t() {
            g();
            d(this).unbind("mousedown", t)
        }
        function k(a) {
            var b = "no";
            (a ? b = "outer" : d.browser.isIE6 && (b = "inner"));
            return b
        }
        function z(a) {
            var e, g, i = a.iframe || document;
            e = window;
            g = document;
            var j = a.opt, k = j.styles;
            a.iframe && (e = a.iframe.contentWindow ||
                a.iframe.window, g = e.document, a.iframe.style.zIndex = j.zIndex);
            var n = g;
            h();
            if (!i.styles) {
                if (d.browser.isIE)
                    n.createStyleSheet().cssText = k;
                else {
                    var p = n.createElement("style");
                    p.type = "text/css";
                    p.textContent = k;
                    n.getElementsByTagName("head")[0].appendChild(p)
                }
                i.styles = !0
            }
            k = j.$obj[0];
            n = d.uid(k);
            r.uid = n;
            p = r.group;
            !a.iframe && !l[p] && (l[p] = {iframe: i,loaded: !0,elems: {},fun: []});
            a = l[p].elems;
            a[n] || (a[n] = []);
            a[n].push({iframe: i,win: e,doc: g,opt: j,group: p,uid: n,hideID: j.hideID,elem: k,show: !1,dot: {left: null,top: null,
                arrow: null,width: null,height: null,offsetX: null,offsetY: null},$tip: null,$box: null,$arrow: null,$loading: null,$content: null});
            h();
            h();
            i = b();
            e = i.opt;
            g = e.classNames;
            j = e.ids;
            a = e.css;
            k = i.group;
            n = i.uid;
            0 == d("#" + n, i.doc).length && (p = i.doc.createElement("div"), p.innerHTML = d.tmpl.render(e.templs.tipTempl, {tipId: n,boxId: j.boxId,arrowId: j.arrowId,loadingId: j.loadingId,contentId: j.contentId,group: k,tip: g.tip,box: g.box,boxType: g.boxType,boxArrow: g.boxArrow,arrow: g.arrow,maxWidth: a.maxWidth,minWidth: a.minWidth,minHeight: a.minHeight,
                content: g.tipContent}), i.doc.body.appendChild(p.firstChild));
            i.$tip = d("#" + n, i.doc);
            i.$box = d("#" + j.boxId, i.$tip[0]);
            i.$arrow = d("#" + j.arrowId, i.$tip[0]);
            i.$loading = d("#" + j.loadingId, i.$tip[0]);
            i.$content = d("#" + j.contentId, i.$tip[0]);
            i.$tip[0].style.zIndex = e.zIndex;
            h();
            i = b().group;
            if (i = l[i]) {
                var i = i.elems, q;
                for (q in i) {
                    e = i[q];
                    g = 0;
                    for (j = e.length; g < j; g++)
                        e[g].show && f(e[g])
                }
            }
            h();
            q = b();
            i = d.tmpl.render(q.opt.temp, {txt: q.opt.data});
            q.$content.html(i);
            h();
            q = b();
            j = q.opt.position.split("_");
            j[0].substring(0,
                1);
            j[0].substring(1, 2);
            i = [j[1].substring(0, 1), j[1].substring(1, 2)];
            e = i[0];
            q.$box[0].className = q.$box[0].className.replace((/[trblc]$/), e);
            (q.opt.showArrow ? ("c" == e ? q.$arrow[0].style.display = "none" : (q.$arrow[0].style.display = "block", q.$arrow[0].className = q.$arrow[0].className.replace((/[trblc]$/), e))) : q.$arrow[0].style.display = "none");
            e = parseInt(q.$tip[0].offsetWidth, 10);
            g = parseInt(q.$tip[0].offsetHeight, 10);
            p = q.opt.$obj.offsetA();
            k = p.left;
            n = p.top;
            a = p.width;
            p = p.height;
            k = {tl: {left: k,top: n,offsetX: -8,offsetY: 0},
                tm: {left: k - e / 2,top: n,offsetX: 0,offsetY: 0},tr: {left: k - e,top: n,offsetX: 8,offsetY: 0},bl: {left: k,top: n - g,offsetX: -5,offsetY: 0},bm: {left: k - e / 2,top: n - g,offsetX: 0,offsetY: 0},br: {left: k - e,top: n - g,offsetX: 4,offsetY: 0},lt: {left: k,top: n,offsetX: 0,offsetY: -8},lm: {left: k,top: n - g / 2,offsetX: 0,offsetY: 0},lb: {left: k,top: n - g,offsetX: 0,offsetY: 4},rt: {left: k - e,top: n,offsetX: 0,offsetY: -8},rm: {left: k - e,top: n - g / 2,offsetX: 0,offsetY: 0},rb: {left: k - e,top: n - g,offsetX: 0,offsetY: 4},center: {left: k - e / 2,top: n - g / 2,offsetX: -4,offsetY: 0}}[j[1]];
            j = {bl: [0, p, "bottom", "Left"],bm: [a / 2, p, "bottom", "Middle"],br: [a, p, "bottom", "Right"],tl: [0, 0, "top", "Left"],tm: [a / 2, 0, "top", "Middle"],tr: [a, 0, "top", "Right"],lt: [0, 0, "left", "Top"],lm: [0, p / 2, "left", "Middle"],lb: [0, p, "left", "Bottom"],rt: [a, 0, "right", "Top"],rm: [a, p / 2, "right", "Middle"],rb: [a, p, "right", "Bottom"],center: [a / 2, p / 2, "center", "center"]}[j[0]];
            q.dot = {left: k.left + j[0],top: k.top + j[1],arrow: i,width: e,height: g,offsetX: k.offsetX,offsetY: k.offsetY};
            c();
            o()
        }
        var r = {uid: 0,group: ""}, l = {}, s = {isScroll: !0,zIndex: 999,
            animate: !1,errorClass: "f_error",removeErrorClass: !1,hideEvent: null,isFocus: !1,iframe: !1,srollHeight: 0,srollWidth: 0,show: function() {
            },endshow: function(a) {
                var b = a.elem, a = a.opt, c = d(b).offsetA(), e = a.srollWidth || d(b)[0].offsetWidth, b = a.srollHeight || d(b)[0].offsetHeight;
                a.isScroll && window.scrollTo(c.left - e - 5, c.top - b - 5)
            },hide: function() {
            },position: "rm_lm",templs: {tipTempl: '<div id=${tipId} class="${tip}"  group=${group} style="min-width:${minWidth}px; width:${maxWidth}px;_width:${minWidth}px; width:auto !important;max-width:${maxWidth}px;overflow:hidden;display:block;z-index:99;margin:0;padding:0;left:0px;top:0px;overflow:hidden;position:absolute;"><div class="${box} ${boxType} ${boxArrow}" id=${boxId}><b class="${arrow}" id=${arrowId}></b><div class="${loading}" id=${loadingId}>${loadingImg}</div><div class=${content} id=${contentId}></div></div>'},
            css: {maxWidth: "260",minWidth: "50"},group: "group",classNames: {tip: "tuna_jmpinfo",box: "base_jmp",boxType: "jmp_alert",boxArrow: "base_jmp_t",arrow: "tri_t",loading: "jmp_loading",tipContent: "jmp_content"},ids: {boxId: "boxId",arrowId: "arrowId",loadingId: "loadingId",contentId: "contentId"},temp: '<div class="jmp_bd">${txt}</div>',data: "\u63d0\u793a\u4fe1\u606f!",showArrow: !0,styles: ".tuna_jmpinfo {margin: 20px;color: #333;font: 12px/2 Arial,Tahoma,simsun;-webkit-text-size-adjust: none;}.tuna_jmpinfo ul,li{list-style: none;}.tuna_jmpinfo a{color: #00c;cursor: pointer;text-decoration: none;}.tuna_jmpinfo a: hover{color: #f00;text-decoration: underline;}.tuna_jmpinfo .font16{font-size: 16px;}.tuna_jmpinfo .jmp_hd{height:30px; padding-left:10px; background:url(http://pic.ctrip.com/common/un_base_btn.png) repeat-x 0 -390px; font-size:12px; line-height:30px; color:#333;} .tuna_jmpinfo .jmp_hd h3{font-size: 12px;} .tuna_jmpinfo .jmp_bd{padding: 2px 3px;}  .tuna_jmpinfo .jmp_alert{border: 1px solid #ffb533; background: #fff5d1;} .tuna_jmpinfo .base_jmp b{position: absolute; width: 16px; height: 16px; background-image: url(http://pic.ctrip.com/common/un_jmp_tri.png); background-repeat: no-repeat; overflow: hidden;} .tuna_jmpinfo .base_jmp_t{margin-top: 8px;} .tuna_jmpinfo .base_jmp_r{margin-right: 8px;} .tuna_jmpinfo .base_jmp_b{margin-bottom: 7px;} .tuna_jmpinfo .base_jmp_l{margin-left: 8px;} .tuna_jmpinfo .base_jmp_t b{margin-top: -7px;} .tuna_jmpinfo .base_jmp_r b{margin-top: 10px; right: 0;} .tuna_jmpinfo .base_jmp_b b{bottom: -8px;} .tuna_jmpinfo .base_jmp_l b{margin-top: 10px; left: 9px;}  .tuna_jmpinfo .jmp_title .tri_b{background-position: -32px -32px;} .tuna_jmpinfo .jmp_alert .tri_t{background-position: -16px 0;} .tuna_jmpinfo .jmp_alert .tri_r{background-position: -16px -16px;} .tuna_jmpinfo .jmp_alert .tri_b{background-position: -16px -32px;} .tuna_jmpinfo .jmp_alert .tri_l{background-position: -16px -48px;} .tuna_jmpinfo .jmp_table .tri_t{background-position: -32px 0;}.f_error {background-color: #FFF7D9 !important; border-color: #D80000 #E50000 #E50000 #D80000 !important; border-style: solid; border-width: 1px;}"};
        this.show = function(b) {
            h();
            if (b = i(b)) {
                var c = k(b.iframe), d = c + "_" + b.group;
                r.group = d;
                ("no" != c ? a(d, function(a) {
                    z({iframe: a,opt: b})
                }) : z({iframe: null,opt: b}))
            }
            return this
        };
        this.hide = function(a) {
            h();
            g(a)
        }
    }});
    d.mod.reg(j)
})(cQuery);
