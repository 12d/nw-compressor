/**
 * cQuery JavaScript Library
 * http://www.ctrip.com/
 *
 * Copyright(C) 2008 - 2011, Ctrip All rights reserved.
 *	Version: 110421
 *
 * Date: 2012-08-21
 */

/**
 * @namespace $.mod
 * @class address(1_0)
 * 地址选择器组件
 * @author cdchu@ctrip.com
 * @param {Object} opt  配置项
 * @return {Object}  地址选择器组件实例
 */
console.log('local2');

var MOD = {};
var HOTEL_POSITION = {
    dataCash: {
        idFrom1To10: false,
        idFrom11To200: false,
        idFrom201ToMax: false,
        error: true
    }
};
var CITYENTER = true;
function checkExist(pid, key) {
    if (typeof HOTEL_POSITION[pid] == "undefined") { HOTEL_POSITION[pid] = {}; HOTEL_POSITION[pid][key] = []; HOTEL_POSITION[pid]['all'] = []; }
    if (typeof HOTEL_POSITION[pid][key] == "undefined") { HOTEL_POSITION[pid][key] = []; }
    return true;
}
function initCData() {
    return window.c_data = {
        city: {},
        cityName: {},
        cityPY: {},
        cityPingYing: {}
    };
}
window.parseRawDataNew = function() {
    var d = initCData();
    CHINA_HOTEL_CITY_RAW_DATA = CHINA_HOTEL_CITY_RAW_DATA.
        replace(/@(\w?\d+)\|0\|([^\|]+)\|\s*([^\|]*)\|\s*([^@]*)/g,
        function(_, id, name, PY, pingYing) {
            d.city['P'+id] = [];
            d.cityName['P'+id] = name;
            d.cityPY[id] = PY;
            d.cityPingYing[id] = pingYing;
            return "";
        });
    CHINA_HOTEL_CITY_RAW_DATA = CHINA_HOTEL_CITY_RAW_DATA.
        replace(/@(\w?\d+)\|([1-9]\d*)\|([^\|]+)\|\s*([^\|]*)\|\s*([^@]*)/g,
        function(_, id, pid, name, PY, pingYing) {
            var p = d.city['P'+pid];
            if (p) {
                p.push(id.toString());
                if(pid!=id) d.city[id] = [];
                d.cityName[id] = name;
                if (PY) d.cityPY[id] = PY;
                if (pingYing) d.cityPingYing[id] = pingYing;
            }
            return "";
        });
};
window.parseRawData = function(){}
window.cityProv = function(cityId) {
    var obj = arguments.callee._val;
    if (!obj) {
        obj = arguments.callee._val = {};
        if(typeof window.c_data == 'undefined'){
            parseRawDataNew();
        }
        var d = window.c_data.city;
        for (var prov in d) {
            if(d[prov].length){
                for(var i = d[prov].length;i--;){
                    obj[d[prov][i]] = prov;
                }
                obj[d[i]] = prov;
            }
        }
    }
    return obj[cityId];
};

var RegMod = function(options){
    this.init(options);
    this.startLoadMods();
    this.initNotice();
    this.initAddress();
    if(this.ops.startDate.length && this.ops.endDate.length){
        this.initCalendar(this.ops.startDate, this.ops.endDate);
    }
    if(this.ops.checkInDate.length && this.ops.checkOutDate.length){
        this.initCalendar(this.ops.checkInDate, this.ops.checkOutDate);
    }
    this.initValidate();
}
$.extend(RegMod.prototype, {
    init: function(options){
        this.ops = {
            city: [],
            startDate: [],
            endDate: [],
            hotelPos: [],
            hotelName: [],
            checkInDate: [],
            checkOutDate: [],
            offsetPos: 5
        };
        this.ops = $.extend(this.ops, options);
    },
    startLoadMods: function(){
        var modConfig = {
            address: "1.0",
            calendar: "3.0",
            notice: "1.0",
            validate: "1.1"
        };
        $.mod.multiLoad(modConfig, function() {});
    },
    initValidate: function() {
        MOD.formValidator = $(document).regMod("validate", "1.1")
    },
    initAddress: function(){
        if(this.ops.city.length){
            MOD.a_city = this.ops.city.regMod("address", "1.0", {
                name: "cityname",
                isIframe: true,
                jsonpSource: "http://webresource.c-ctrip.com/code/cquery/resource/address/hotel/online/city_" + cQuery.config("charset") + ".js?v=" + $('#_releaseNo_').value(),
                isFocusNext: !1,
                isAutoCorrect: !0,
                relate: {
                    id: $("#cityId"),
                    name_py: $("#cityPY")
                },
                template: {
                    suggestion: '<div class="c_address_box">' +
                        '<div class="c_address_hd">' + addressMessageConfig.cityname.suggestion + '</div>' +
                        '<div class="c_address_bd">' +
                        '<ol class="c_address_ol">{{enum(key) data}}<li><span>${key}</span></li>{{/enum}}</ol>' +
                        '{{enum(key,arr) data}}' +
                        '{{if key!="'+ addressMessageConfig["addressTab"] +'"}}' +
                        '<ul class="c_address_ul layoutfix">' +
                        '{{each arr}}<li><a href="javascript:void(0);" data="${data}">${display}</a></li>{{/each}}' +
                        '</ul>' +
                        '{{/else}}' +
                        '<div class="c_address_ul layoutfix"><div id="union" class="hotel_index_area" style="width: 500px"><ul id="selProv" class="index_area"></ul><label class="ico_index_area"></label><ul id="selCity" class="index_area"></ul></div></div>' +
                        '{{/if}}' +
                        '{{/enum}}' +
                        '</div>' +
                        '</div>',
                    suggestionStyle: '.c_address_box { background-color: #fff; font-size: 12px; width: 425px; }.c_address_box a { text-decoration: none; }.c_address_hd { height: 24px; border-color: #2C7ECF; border-style: solid; border-width: 1px 1px 0; background-color: #67A1E2; color:#CEE3FC; line-height: 24px; padding-left: 10px; }.c_address_hd strong{color:#fff;}.c_address_bd { border-color: #999999; border-style: solid; border-width: 0 1px 1px; overflow: hidden; padding:10px; }.c_address_ol { margin:0; padding:0 0 20px; border-bottom: 1px solid #5DA9E2; }.c_address_ol li { color: #005DAA; cursor: pointer; float: left; height: 20px; line-height: 20px; list-style-type: none; text-align: center; }.c_address_ol li span { padding:0 8px; white-space:nowrap; display:block; }.c_address_ol li .hot_selected { display:block; padding:0 7px; background-color: #FFFFFF; border-color: #5DA9E2; border-style: solid; border-width: 1px 1px 0; color: #000000; font-weight: bold; }.c_address_ul { width: 100%; margin:0; padding: 4px 0 0; }.c_address_ul li { float: left; height: 24px; overflow: hidden; width: 67px; }.c_address_ul li a { display: block; height: 22px; border: 1px solid #FFFFFF; color: #1148A8; line-height: 22px; padding-left: 5px; }.c_address_ul li a:hover { background-color: #E8F4FF; border: 1px solid #ACCCEF; text-decoration: none; }#union li{float:none;height:14px;width:auto;}.hotel_index_area { padding:10px 0 4px; overflow:hidden; width:403px !important; } .index_area { float:left; width: 180px; height: 68px; overflow-x: hidden; overflow-y: auto; border: 1px inset #000; color: #000; }.index_area li { padding-left: 3px; height: 14px; line-height: 14px; overflow: hidden; cursor: pointer; }.index_area li.on { background: #0a246a; color: #fff; }.index_area span { float:right; margin-right:3px;}.ico_index_area { display:inline; float:left; width:21px; height:20px; margin:25px 8px 0; background:url(http://pic.c-ctrip.com/hotels110127/ico_index_area.gif); overflow:hidden; }',
                    suggestionInit: function(a){

                        /** add css for suggest START*/
                        var stylesheet = document.createElement('link');
                        stylesheet.type="text/css";
                        stylesheet.rel = 'stylesheet';
                        stylesheet.href=hotelDomesticConfig.positionStylesheet;
                        a && a[0].ownerDocument.head.appendChild(stylesheet);
                        /** add css for suggest END*/

                        function c() {
                            var a = this;
                            b.each(function(f, c) {
                                f[0] == a ? (f.addClass("hot_selected"), e[c].style.display = "") : (f.removeClass("hot_selected"), e[c].style.display = "none")
                            })
                        }
                        var b = a.find("span"),e = a.find(".c_address_ul");
                        if (b.length) {
                            for (var d = 30, g = 0, j = b.length; g < j; g++) d += b[g].offsetWidth;
                            a = a.find("div").first();
                            a[0] && 278 < d && a.css("width", d + "px");
                            b.bind("mousedown", c);
                            c.apply(b[0])
                        }
                        function simuSelect(eleA, eleB, config) {
                            if(!eleA || !eleB) return;
                            var c_space_string = new Array(15).join('&nbsp;');
                            var c_left_length = 15;
                            var c_arrow_string = ' ->';

                            var divBuffer = [];
                            eleA.innerHTML = '';
                            eleB.innerHTML = '';
                            var prevA = null;
                            var obj = {
                                set:function() {
                                    if (!eleA.firstChild) {
                                        var a = [];
                                        for (var s in config.relationHash) if(config.relationHash[s].length) a.push(s);
                                        update(eleA, a);
                                    }
                                    if (arguments.length == 0) {
                                        checkSub();
                                        unSelect(eleA);
                                        unSelect(eleB);
                                    } else {
                                        selectByValue(arguments[0], eleA);
                                        sync(arguments[1]);
                                    }
                                },
                                get:function() {
                                    return eleA.current ? [eleA.current.id.slice(1),eleB.current.id.slice(1)] : null;
                                }
                            };
                            return obj;

                            function sync(v) {
                                checkSub();
                                var id = v || config.textHash[eleA.current.id.slice(1)];
                                selectByValue(id, eleB);
                            }

                            function mouseDown(e) {
                                function contains(a, b){ return a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b) & 16); }
                                var evt = e || window.event, el = evt.target || evt.srcElement;
                                if ((evt.which || evt.button) != 1) return;
                                if(contains(eleB,el)){
                                    setTimeout(function(){document.getElementById('txtCity').blur()},0);
                                }
                                select(el);
                                if (el.parentNode != eleB){
                                    sync(null);
                                }else if (!eleA.current) {
                                    select(prevA || eleA.firstChild);
                                }
                                if (el.parentNode == eleB){
                                    config.onChange(obj.get());
                                }
                            }
                            function update(ele, arr) {
                                removeDiv(ele);
                                for (var i = 0; i < arr.length; i++){
                                    addDiv(ele, arr[i], i);
                                }
                            }
                            function addDiv(ele, value, index) {
                                var d,s = config.textHash[value],text,title = '';
                                var p = s.lastIndexOf(' ');
                                if (p < 0) {
                                    text = s + c_space_string.slice(0, ((c_left_length - s.length) >> 1) * 6);
                                } else if (p >= c_left_length) {
                                    text = s;
                                    title = s;
                                } else
                                    text = s.slice(0, p) + c_space_string.slice(0, (c_left_length - p) * 6) + s.slice(p);
                                if (ele == eleA)
                                    text += c_arrow_string;
                                d = divBuffer.pop();
                                if (!d) {
                                    d = document.createElement('li');
                                    d.onmousedown = mouseDown;
                                    d.tabIndex = 1000;
                                }
                                d.innerHTML = text;
                                d.index = index;
                                d.title = title;
                                d.id = '_' + value;
                                d.className = '';
                                d.c = text.charAt(0).toUpperCase();
                                ele.appendChild(d);
                            }
                            function removeDiv(ele) {
                                while (ele.firstChild) divBuffer.push(ele.removeChild(ele.firstChild));
                            }
                            function unSelect(ele) {
                                if (ele.current) {
                                    if (ele == eleA) prevA = ele.current;
                                    ele.current.className = '';
                                    ele.current = null;
                                }
                            }
                            function select(d) {
                                var p = d.parentNode;
                                unSelect(p);
                                var offsetTop = d.index * d.offsetHeight;
                                var t = offsetTop - p.scrollTop;
                                if (t < 0)
                                    p.scrollTop = offsetTop;
                                else if (t > p.clientHeight - d.offsetHeight) {
                                    p.scrollTop = offsetTop - p.clientHeight + d.offsetHeight;
                                }
                                d.className = config.hilitClass;
                                p.current = d;
                            }
                            function selectByValue(value, ele) {
                                if (!value || !(el = document.getElementById('_' + value)))
                                    el = ele.firstChild;
                                select(el);
                            }
                            function checkSub() {
                                if (!eleA.firstChild)return;
                                var pid = eleA.firstChild.id;
                                if (eleA.current)
                                    pid = eleA.current.id;
                                if (eleB.pid != pid)
                                    update(eleB, config.relationHash[pid.slice(1)]);
                            }
                        };
                        if(typeof window.c_data == 'undefined'){
                            parseRawDataNew();
                        };
                        (function (document){
                            window.ssCity = simuSelect(document.getElementById('selProv'), document.getElementById('selCity'), {
                                hilitClass: 'on',
                                relationHash: window.c_data.city,
                                textHash: window.c_data.cityName,
                                onChange: function(ar) {
                                    var name = window.c_data.cityName[ar[1]];
                                    var txt = '';
                                    if (name) {
                                        var match = name.match(/\S+$/);
                                        if (match) txt = match[0];
                                    }
                                    if (txt) {
                                        this.ops.city.value(txt);
                                    } else {
                                        this.ops.city.value('');
                                    }
                                }.bind(this)
                            });
                        })(a && a[0].ownerDocument);

                        window.ssCity.set();
                    }.bind(this)
                }
            });
            MOD.a_city.method('bind', 'change', function(mod, data) {
                CITYENTER = false;
                if(this.value != this.getAttribute('_lastValue')){
                    this.setAttribute('_lastValue', this.value);
                    if(MOD.n_hotelName){
                        MOD.n_hotelName.method("resetValue");
                    }
                    if(MOD.n_hotelPos){
                        MOD.n_hotelPos.method("resetValue");
                        $("#positionArea, #positionId, #hotelAreaName").value("");
                        if(data.items && data.items.id){
                            window.getOtherDataByCity(data.items.id, data.items.name);
                        }else{
                            checkHotelPosition();
                        }
                    }
                    if(data.items && data.items.id){
                        var provId = window.cityProv(data.items.id);
                        if (provId) {
                            window.ssCity && window.ssCity.set(provId, data.items.id);
                        }
                    }
                }
                setTimeout(function(){CITYENTER = true}, 100);
            });
            MOD.a_city.method('bind','userinput',function(mod, data){
                if(data && window.UIMonitor2 && window.UIMonitor2.trackLog){
                    if(data.value){
                        window.UIMonitor2.trackLog(null,"hae",data.value);
                    }
                    if(data.autoCorrectValue){
                        window.UIMonitor2.trackLog(null,"hae",data.autoCorrectValue);
                    }
                }
            });

            this.ops.city.bind('focus', function(){
                CITYENTER = true;
            }).bind('keydown', function(e){
                    e = e || window.event;
                    if(e.keyCode == 13){
                        if(!CITYENTER){
                            CITYENTER = true;
                        }else{
                            MOD.a_city.method("validate");
                            var fm = document.forms[0];
                            if(HotelSearch.submit()){
                                fm.submit();
                            }
                        }
                        e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    }
                })
        }
        window.getOtherDataByCity = function(city, name, callback, undefined) {
            if (city === undefined) {
                return
            }
            var jsID = 'error',
                jsName = '';
            if(city >= 1 && city <=10){
                jsID = 'idFrom1To10';
                jsName = '1_10';
            }else if(city >= 11 && city <=200){
                jsID = 'idFrom11To200';
                jsName = '11_200';
            }else if(city >= 201){
                jsID = 'idFrom201ToMax';
                jsName = '201_99999';
            }else if(/D\d+_\d+/.test(city)){
                if (typeof HOTEL_POSITION[city] == "undefined") { HOTEL_POSITION[city] = {}; }
            }
            if(!HOTEL_POSITION['dataCash'][jsID]){
                var param = {
                    type: 'text/javascript',
                    async: true,
                    onload: function(){
                        ['zone', 'location'].each(function (o, i) {
                            var rawName = 'CHINA_HOTEL_' + o.toString().toUpperCase() + '_RAW_DATA';
                            window[rawName] = window[rawName].replace(/@(\d+)\|([1-9]\d*)\|\s*([^\|]+)\|\s*([^\|]*)\|\s*([^@]*)/g, function (_, id, pid, name, pingYing, PY) {
                                checkExist(pid, o);
                                HOTEL_POSITION[pid][o].push({ "display": name, "data": [pingYing, name, id, PY, (o == 'zone' ? 'zoneId' : 'locationId')].join("|") });
                                HOTEL_POSITION[pid]["all"].push([pingYing, name, id, PY, (o == 'zone' ? 'zoneId' : 'locationId')].join("|"));
                                return '';
                            });
                        });
                        CHINA_HOTEL_METRO_RAW_DATA = CHINA_HOTEL_METRO_RAW_DATA.replace(/@(\d+)\|([1-9]\d*)\|\s*([^\|]+)\|\s*([^\|]*)\|\s*([^\|]*)\|\s*([^@]*)/g, function (_, id, pid, name, pingYing, PY) {
                            checkExist(pid, "metro");
                            HOTEL_POSITION[pid]["metro"].push({ "display": name, "data": [pingYing, name, id, PY, "metroId"].join("|") });
                            HOTEL_POSITION[pid]["all"].push([pingYing, name, id, PY, "metroId"].join("|"));
                            return '';
                        });
                        CHINA_HOTEL_SPOT_RAW_DATA = CHINA_HOTEL_SPOT_RAW_DATA.replace(/@(\w\d+)\|([1-9]\d*)\|\s*([^\|]+)\|\s*([^\|]*)\|\s*([^@]*)/g, function (_, id, pid, name, pingYing, PY) {
                            checkExist(pid, "spot");
                            HOTEL_POSITION[pid]["spot"].push({ "display": name, "data": [pingYing, name, id, PY, "landMarkId"].join("|") });
                            HOTEL_POSITION[pid]["all"].push([pingYing, name, id, PY, "landMarkId"].join("|"));
                            return '';
                        });
                        HOTEL_POSITION['dataCash'][jsID] = true;

                        checkHotelPosition(city, name);
                        callback && callback();
                    }
                }
                cQuery.loader.js('http://webresource.c-ctrip.com/code/js/resource/address_tuna/hotel_domes_zone_120507_'+ jsName +'_'+ cQuery.config("charset") +'.js?v='+ $('#_releaseNo_').value(), param);
            }else{
                checkHotelPosition(city, name);
                callback && callback();
            }
        }
        if(this.ops.hotelPos.length) {
            MOD.a_hotelPos = this.ops.hotelPos.regMod('address', '1.0', {
                name: 'hotelPos',
                isIframe: true,
                isFocusNext: false,
                source: { data: "@@" },
                isAutoCorrect: false,
                relate: {
                    "1": $("#hotelAreaName"),
                    "4": $("#positionArea"),
                    "2": $("#positionId")
                },
                template: {
                    suggestion: ''+
                        '{{if data!=null}}'+
                        '<div id="address_area" style="z-index: 111; width:505px;" class="keyword_search">'+
                        '<div class="address_hotcity">' + addressMessageConfig["hotelPos"]["suggestion"] + '</div>'+
                        '<div class="keyword_list2">'+
                        '{{if data.showAMap == true}}'+
                        '<a href="javascript:;" class="show_map">'+ addressMessageConfig['hotelPos']['AMapTitle'] +'</a>'+
                        '{{/if}}'+
                        '<div class="address_hot_list2">'+
                        '<ol class="address_hot_abb2">'+
                        '{{enum(key,arr) data.suggestData}}'+
                        '<li><span>${key.split("|")[0]}</span></li>'+
                        '{{/enum}}'+
                        '</ol>'+
                        '</div>'+
                        '<dl class="area_list">'+
                        '{{enum(key,arr) data.suggestData}}'+
                        '{{if key.split("|")[1]=="metro"}}'+
                        '<dd id="div_metro">'+
                        '{{each arr}}<a id="metro_${data.split("|")[2]}" href="javascript:;" class="metro" title="${display}" metrodata="${data}">${display}</a>{{/each}}'+
                        '<div id="metroStation" class="metro_station" style="display:none;"></div>'+
                        '</dd>'+
                        '{{/if}}'+
                        '{{if key.split("|")[1]!="metro"}}'+
                        '<dd>'+
                        '{{each arr}}<a href="javascript:;" title="${display}" data="${data}">${display}</a>{{/each}}'+
                        '</dd>'+
                        '{{/if}}'+
                        '{{/enum}}'+
                        '</dl>'+
                        '{{if data.subCity != null}}'+
                        '<div class="keyword_sub_city">'+ addressMessageConfig['hotelPos']['subCity'] +'{{each data.subCity}}<a class="subCity" url="/hotel/${py}${id}" href="javascript:void(0);">${display}</a>{{/each}}</div>'+
                        '{{/if}}'+
                        '</div>'+
                        '</div>'+
                        '{{/if}}',
                    suggestionStyle: '.address_hotcity{background-color:#67A1E2;border-color:#2C7ECF;border-style: solid;border-width:1px 1px 0;color:#CEE3FC;height:24px;line-height:24px;padding-left:10px;}',
                    suggestionInit: function(a){
                        /** add css for suggest START*/
                        var stylesheet = document.createElement('link');
                        stylesheet.type="text/css";
                        stylesheet.rel = 'stylesheet';
                        stylesheet.href=hotelDomesticConfig.positionStylesheet;
                        a && a[0].ownerDocument.head.appendChild(stylesheet);
                        /** add css for suggest END*/

                        function c() {
                            var a = this;
                            b.each(function(f, c) {
                                f[0] == a ? (f.addClass("hot_selected2"), e[c].style.display = "") : (f.removeClass("hot_selected2"), e[c].style.display = "none")
                            })
                        }
                        var b = a.find("li"),e = a.find("dd");
                        if (b.length) {

                            for (var d = 30, g = 0, j = b.length; g < j; g++) d += b[g].offsetWidth;
                            a = a.find("div").first();
                            a[0] && 278 < d && a.css("width", d + "px");
                            b.bind("mousedown", c);
                            c.apply(b[0]);
                            a.bind('mousedown', function(e){
                                e = e || window.event;
                                var el = e.target || e.srcElement;
                                if (el.tagName.toLowerCase() == 'a') {
                                    switch(el.className){
                                        case "show_map":
                                            AMap.showPop(null, false, $('#cityId').value());
                                            this.ops.hotelPos[0].blur();
                                            break;
                                        case "subCity":
                                            var fm = document.forms[0];
                                            var txtCheckIn = this.ops.startDate,
                                                txtCheckOut = this.ops.endDate;
                                            if(!txtCheckIn.value().toDate()){
                                                txtCheckIn.value(new Date().toStdDateString());
                                            }
                                            if(!txtCheckOut.value().toDate()){
                                                txtCheckOut.value(txtCheckIn.value.toDate().addDays(1).toStdDateString());
                                            }
                                            this.ops.hotelPos.value('');
                                            document.getElementById('hotelAreaName').value = '';
                                            this.ops.hotelName.value('');
                                            fm.action = el.getAttribute('url');
                                            fm.target = "_self";
                                            if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
                                            fm.submit();
                                            e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                                            e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                            break;
                                        case "metro":
                                            var station = document.getElementById('metroStation');
                                            var metroId = station.getAttribute('metroId');
                                            if(metroId){
                                                document.getElementById(metroId).className = 'metro';
                                            }
                                            el.className = 'metro current';

                                            var res = ['<a href="javascript:;" data="'+ el.getAttribute('metrodata') +'" title="'+ el.innerHTML +'">'+ addressMessageConfig['hotelPos']['all'] +'</a>'];

                                            var cityId = $('#cityId').value();
                                            var kw = '('+el.innerHTML+')';
                                            var reg = new RegExp('@[^\\|]*\\|(([^\\|]*)'+ kw.toReString() +'[^\\|]*)\\|(S\\d+)\\|[^@]*', "gi");
                                            var DATA = '@'+ HOTEL_POSITION[cityId]['all'].join('@') + '@';

                                            DATA = DATA.replace(reg, function (_, name, label, id) {
                                                res.push('<a href="javascript:;" data="'+ _ +'" title="'+ name +'">'+ label +'</a>');
                                                return '';
                                            });
                                            if(res.length){
                                                station.innerHTML = res.join('');
                                                station.style.display = '';
                                            }else{
                                                station.innerHTML = '';
                                                station.style.display = 'none';
                                            }
                                            station.setAttribute('metroId', el.id);
                                            break;
                                        case "metro current":
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }.bind(this))
                        }
                    }.bind(this)
                },
                offset: this.ops.offsetPos || 5
            });
            this.ops.hotelPos.bind('blur', function(){
                var keyword = document.getElementById("hotelAreaName");
                if(!this.value || this.value != keyword.value){
                    keyword.value = this.value;
                    $("#positionArea, #positionId").value("");
                }
            })
            MOD.a_hotelPos.method('bind', 'change', function(mod, data) {
                CITYENTER = false;
                setTimeout(function(){CITYENTER = true}, 100);
            });

            this.ops.hotelPos.bind('focus', function(){
                CITYENTER = true;
            }).bind('keydown', function(e){
                    e = e || window.event;
                    if(e.keyCode == 13){
                        if(!CITYENTER){
                            CITYENTER = true;
                        }else{
                            var fm = document.forms[0];
                            if(HotelSearch.submit()){
                                fm.submit();
                            }
                        }
                        e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    }
                })
        }

        function checkHotelPosition(cityId, cityName) {
            var data = HOTEL_POSITION[cityId];
            if (typeof data == "undefined" || /D\d+_\d+/.test(cityId)) {
                MOD.a_hotelPos.set("source", {
                    suggestion: null,
                    data: "@@"
                });
                MOD.a_hotelPos.method("validate");
                MOD.n_hotelPos.method("checkValue");
                return false;
            }
            var HotelPosTitle = addressMessageConfig["hotelPos"]["titles"];
            var sourcesuggestion = {};
            var flag = false,
                hasAMap = false;
            for (var key in HotelPosTitle) {
                var t = HotelPosTitle[key];
                if ("string" == typeof key) {
                    var sk = t + "|" + key;
                    if (typeof sourcesuggestion[t] == "undefined") { sourcesuggestion[sk] = []; }
                    if (typeof data[key] != "undefined") {
                        sourcesuggestion[sk] = data[key];
                        flag = flag || true;
                        if(key == 'zone'){
                            hasAMap = true;
                        }
                    } else {
                        delete sourcesuggestion[sk];
                        flag = flag || false;
                    }
                }
            }
            if(!data['subCity']){
                data['subCity'] = [];
                if (!MOD.a_city) return;
                if(MOD.a_city.get('source')){
                    var str = MOD.a_city.get('source').data;
                    var reg = new RegExp('[@](\\w*)\\|([^|]*)\\(' + cityName + '\\)\\|(\\d+|D\\d+_\\d+)[^@]*', 'ig');
                    str.replace(reg, function(a,b,c,d){
                        data['subCity'].push({display: c, id: d, py: b.toLowerCase()});
                    });
                }
            }
            MOD.a_hotelPos.set("source", {
                suggestion: flag ? {suggestData: sourcesuggestion, showAMap: hasAMap && addressMessageConfig['hotelPos']['showAMap'], subCity: data['subCity'].length ? data['subCity'] : null} : null,
                data: "@" + data["all"].join("@") + "@"
            });
            MOD.a_hotelPos.method("validate");
            MOD.n_hotelPos.method("checkValue");
        }
    },
    initNotice: function(){
        this.ops.city.length && (MOD.n_city = this.ops.city.regMod("notice", "1.0", {
            name: "city",
            tips: noticeMessageConfig[0],
            selClass: "inputSel"
        }));
        this.ops.startDate.length && (MOD.n_startDate = this.ops.startDate.regMod("notice", "1.0", {
            name: "startDate",
            tips: "yyyy-mm-dd",
            selClass: "inputSel"
        }));
        this.ops.endDate.length && (MOD.n_endDate = this.ops.endDate.regMod("notice", "1.0", {
            name: "endDate",
            tips: "yyyy-mm-dd",
            selClass: "inputSel"
        }));
        this.ops.hotelPos.length && (MOD.n_hotelPos = this.ops.hotelPos.regMod("notice", "1.0", {
            name: "hotelPos",
            tips: noticeMessageConfig[1],
            selClass: "inputSel"
        }));
        this.ops.hotelName.length && (MOD.n_hotelName = this.ops.hotelName.regMod("notice", "1.0", {
            name: "hotelName",
            tips: noticeMessageConfig[2],
            selClass: "inputSel"
        }));
        this.ops.checkInDate.length && (MOD.n_checkInDate = this.ops.checkInDate.regMod("notice", "1.0", {
            name: "checkInDate",
            tips: "yyyy-mm-dd",
            selClass: "inputSel"
        }));
        this.ops.checkOutDate.length && (MOD.n_checkOutDate = this.ops.checkOutDate.regMod("notice", "1.0", {
            name: "checkOutDate",
            tips: "yyyy-mm-dd",
            selClass: "inputSel"
        }));
    },
    initCalendar: function(start, end){
        start.regMod("calendar", "3.0", {
            options: {
                showWeek: !0,
                container: cQuery.container
            }
        });
        end.regMod("calendar", "3.0", {
            options: {
                showWeek: !0,
                reference: '#' + start[0].id,
                minDate: start.value().toDate() ? start.value().toDate().addDays(1).toStdDateString() : new Date().addDays(1).toStdDateString()
            }
        });
        start.bind('change', function(e){
            e = e || window.event;
            var target = e.target || e.srcElement;
            var startDate = target.value.toDate();
            if(startDate){
                var nextDate = startDate.addDays(1);
                end.data('minDate', nextDate.toStdDateString());
                var endDate = end.value().toDate();
                if(!endDate || endDate <= startDate){
                    end.value(nextDate.toFormatString('yyyy-MM-dd'));
                    end.getMod("notice", "1.0").method("checkValue");
                    end.getMod("calendar", "3.0").method("setWeek", "#" + end[0].id);
                }if(endDate && endDate - startDate > MAX_STAY){
                    setTimeout(function() {
                        MOD.formValidator.method("show", {
                            $obj: end,
                            data: validateMessageConfig['hotel']['too_long'],
                            removeErrorClass: !0,
                            isScroll: false
                        })
                    }.bind(this), 0);
                }
            }else{
                end.data('minDate', new Date().addDays(1).toStdDateString());
            }
        }.bind(this)).bind('focus', function(){
            if(this.timer){
                clearTimeout(this.timer);
            }
        }.bind(this));
        end.bind('focus', function(e){
            e = e || window.event;
            var target = e.target || e.srcElement;
            var startDate = start.value().toDate();
            var endDate = target.value.toDate();
            if(startDate && endDate && endDate - startDate > MAX_STAY){
                setTimeout(function() {
                    MOD.formValidator.method("show", {
                        $obj: end,
                        data: validateMessageConfig['hotel']['too_long'],
                        removeErrorClass: !0,
                        isScroll: false
                    })
                }.bind(this), 0);
            }
        }.bind(this)).bind('blur', function(){
            this.timer = setTimeout(function(){
                var startDate = start.value().toDate();
                var endDate = end.value().toDate();
                if(startDate && endDate && endDate > startDate){
                    if(endDate - startDate > MAX_STAY){
                        MOD.formValidator.method("show", {
                            $obj: end,
                            data: validateMessageConfig['hotel']['too_long'],
                            removeErrorClass: !0,
                            isScroll: false
                        })
                    }
                }
            }.bind(this), 100);
        }.bind(this));
    }
})
function getCookie(mainKey, keyMap) {
    var m = cQuery.cookie.get(mainKey);
    m = (m ? m : "").split("split");
    for (var i = 0, l = m.length; i < l; i++) {
        if (i==0 && "cityId" in keyMap) keyMap["cityId"] = unescape(m[i]);
        else if(i==1 && "cityName" in keyMap) keyMap["cityName"] = unescape(m[i]);
        else if(i==2 && "cityPY" in keyMap) keyMap["cityPY"] = unescape(m[i]);
    }
}
function setCookie(mainKey, keyMap) {
    var cookiedomain=window.location.host.replace("hotels.","");
    cQuery.cookie.set('HotelCityID', null, keyMap["cityId"] + 'split'+ keyMap["cityName"] + "split" + keyMap["cityPY"],{expires:30,domain:cookiedomain,path:'/'});
}


$.extend(cQuery, {
    replace: function(template, obj) {
        return template.replace(/\$\{([\w\.?]+)\}/g, function(s, k) {
            var keys = k.split('.'), l = keys.length;
            var key = keys[0];
            if (l > 1) {
                var o = obj;
                for (var i = 0; i < l; i++) {
                    if (key in o) {
                        o = o[key];
                        key = keys[i + 1];
                    } else return s;
                }
                return o;
            }
            return key in obj ? obj[key] : s;
        });
    },
    format: function(template) {
        var args = arguments, l = args.length;
        if (l > 1) {
            return template.replace(/\$(\d)/g, function(s, k) {
                return args[k] == undefined ? '' : args[k];
            });
        } else return template;
    },
    create: function(tag, attrs) {
        var el = document.createElement(tag);
        for (var p in attrs) {
            if (attrs.hasOwnProperty(p)) {
                if (p == 'cssText') {
                    el.style[p] = attrs[p];
                } else {
                    el[p] = attrs[p];
                }
            }
        }
        return el;
    }
});
var MadCat = function(fn, cfg) {
    this.events = {};
    fn && fn.call(this, cfg);
};
$.extend(MadCat.prototype, {
    set: function() {},
    get: function() { return null },
    evt: function(key, fn) { this.events[key] = fn },
    init: function() {}
});
var HotelSearch = new MadCat(function() {
    var txtCheckIn, txtCheckOut,
        txtCityName, txtHotelPos;
    var hidCityId, txtHotelName, hidCityPY;
    var fm;
    var me = this;
    var submitConfig = {
        isAuto: false,
        isMap: false
    }

    this.init = function() {
        txtCheckIn = document.getElementById('txtCheckIn');
        txtCheckOut = document.getElementById('txtCheckOut');
        txtHotelName = document.getElementById('txtHotelName');
        txtHotelPos = document.getElementById('txtHotelPsx');
        txtCityName = document.getElementById('txtCity');
        hidCityId = document.getElementById('cityId');
        hidCityPY = document.getElementById('cityPY');
        fm = document.forms[0];
        this.initName(txtHotelName);
        var Enter=$('#searchForm');
        Enter.bind('keydown', function(e){
            e = e || window.event;
            if(e.keyCode==13){
                var fm = document.forms[0];
                if(HotelSearch.submit()){
                    fm.submit();
                }
            }
        });

    };
    this.set = function() { };
    this.checkDate = function(date, v0) {
        v0 = v0 ? v0.toDate() : new Date().toStdDateString().toDate();
        var dt1 = date[0], dt2 = date[1],
            v1 = dt1.value.toDate() || 0, v2 = dt2.value.toDate() || 0;
        return  !$(dt1).value() ? showTips(dt1, 'checkIn') :
            !v1 ? showTips(dt1, 'dateErr') :
                v1 < v0 ? showTips(dt1, 'too_early_in') :
                    !$(dt2).value() ? showTips(dt2, 'checkOut') :
                        !v2 ? showTips(dt2, 'dateErr') :
                            v1 >= v2 ? showTips(dt2, 'too_early_out') :
                                v2 - v1 > MAX_STAY ? showTips(dt2, 'too_long') : 1;
    };
    this.checkDateByAuto = function(date, v0) {
        v0 = v0 ? v0.toDate() : new Date().toStdDateString().toDate();
        var dt1 = date[0], dt2 = date[1],
            v1 = dt1.value.toDate() || 0, v2 = dt2.value.toDate() || 0;
        return  !$(dt1).value() ? 0 :
            !v1 ? 0 :
                v1 < v0 ? 0 :
                    !$(dt2).value() ? 0 :
                        !v2 ? 0 :
                            v1 >= v2 ? 0 :
                                v2 - v1 > MAX_STAY ? 0 : 1;
    };
    this.setSubmit = function(isAuto, isMap){
        submitConfig.isAuto = !!isAuto;
        submitConfig.isMap = !!isMap;
    };
    this.submit = function(isAuto, isMap) {
        isAuto = isAuto || submitConfig.isAuto;
        isMap = isMap || submitConfig.isMap;
        if (!$(txtCityName).value()) {
            if(isAuto){
                var param = {cityId: '', cityName: '', cityPY: ''};
                getCookie('HotelCityID', param);
                if(param.cityId && param.cityName && param.cityPY){
                    txtCityName.value = param.cityName;
                    hidCityId.value = param.cityId;
                    hidCityPY.value = param.cityPY;
                }else{
                    txtCityName.value = addressMessageConfig['defaultValue'][0];
                    hidCityId.value = addressMessageConfig['defaultValue'][1];
                    hidCityPY.value = addressMessageConfig['defaultValue'][2];
                }
            }else{
                return showTips(txtCityName, 'city');
            }
        }
        if(isAuto){
            if(!this.checkDateByAuto([txtCheckIn, txtCheckOut])){
                txtCheckIn.value = txtCheckIn.defaultValue;
                txtCheckOut.value = txtCheckOut.defaultValue;
            }
        }else if(!this.checkDate([txtCheckIn, txtCheckOut])){
            return false;
        }
        var other = [];
        var pos = '';

        var positionArea = document.getElementById('positionArea'),
            positionId = document.getElementById('positionId'),
            keyword = document.getElementById('hotelAreaName');
        if($(txtHotelPos).value()){
            switch(positionArea.value){
                case 'zoneId':
                    pos += 'zone' + positionId.value;
                    break;
                case 'locationId':
                    pos += 'location' + positionId.value;
                    break;
                case 'metroId':
                    pos += 'l' + positionId.value;
                    break;
                case 'landMarkId':
                    pos += 's' + positionId.value.replace(/^[SL]/, '');
                    break;
                default:
                    break;
            }
        }else{
            positionArea.value = '';
            positionId.value = '';
            keyword.value = '';
        }
        var searchHotelLevelSelect = document.getElementById('searchHotelLevelSelect');
        if(searchHotelLevelSelect && searchHotelLevelSelect.value != '0'){
            pos += 'star' + searchHotelLevelSelect.value;
        }
        if(pos){
            other.push(pos);
        }
        if($(txtHotelPos).value() && !positionArea.value){
            other.push('k1'+ keyword.value);
        }
        if($(txtHotelName).value()){
            other.push('k2'+ txtHotelName.value);
        }

        var url =  '/hotel/${city}${map}${other}';
        var link = $.replace(url, {
            city: hidCityPY.value.toLowerCase() + '' + hidCityId.value,
            map: isMap ? '/map' : '',
            other: (other.length ? '/' + other.join('/') : '')
        })
        $('#startdate').value(txtCheckIn.value);
        $('#depdate').value(txtCheckOut.value);

        fm.action = link;
        if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
        fm.target = '_self';
        window.doFormSubmit && window.doFormSubmit(fm);
        return true;
    };
    this.setCity = function(cityId, cityName, cityPY) {
        if(!cityId || !cityName || !cityPY) return;
        var name = cityName;
        var txt = '';
        if (name) {
            var match = name.match(/\S+$/);
            if (match) txt = match[0];
        }
        if (txt) {
            $('#txtCity').value(txt);
            $('#cityId').value(cityId);
            $('#cityPY').value(cityPY);
            if(txtHotelPos){
                getOtherDataByCity(cityId, txt);
            }
            setssCity(cityId);
        } else {
            $('#txtCity').value('');
            $('#cityId').value('');
            $('#cityPY').value('');
        }
        MOD.n_city.method("checkValue");
        MOD.n_hotelPos.method("checkValue");
        MOD.n_hotelName.method("checkValue");
    };
    function setssCity(cityId) {
        var fns = arguments.callee;
        if (typeof window.ssCity == 'undefined') {
            setTimeout(fns, 200);
            return;
        }
        var provId = cityProv(cityId);
        if (provId) {
            window.ssCity && window.ssCity.set(provId, cityId);
        }
    }
    this.initName = function(inp) {
        if (!inp) return null;
        var hotelBrandAjaxSuggest = document.getElementById('hotelBrandAjaxSuggest');

        var lastName, cid;
        $(inp).bind('focus', function() {
            setTimeout(function(){
                cid = hidCityId.value;
                if (!cid) return null;
                lastName = $(inp).value();
            },100)
        });
        AC.init(inp, [], hotelBrandAjaxSuggest, {
            onTimer: function() {
                if (!cid) {
                    AC.clearTimer();
                    hotelBrandAjaxSuggest.style.display = 'none';
                    return false;
                }
                var val = $(inp).value();
                if (!val) {
                    lastName = val;
                    hotelBrandAjaxSuggest.style.display = 'none';
                    return;
                }
                if (lastName == val || AC.selected) {
                    return;
                }

                var data = [];
                var url = '/Domestic/Tool/AjaxHotelResult.aspx';
                setTimeout(function() {
                    var param = {
                        cache: true,
                        onsuccess: function (response) {
                            var res = response.responseText
                            if (!res) {
                                hotelBrandAjaxSuggest.style.display = 'none';
                                return;
                            }
                            data = res.split('^$^');
                            hotelBrandAjaxSuggest.innerHTML = data.map(function(el) {
                                var txt = el.replace(val, $.format('<b style="color:green">$1</b>', val));
                                return $.format('<a href="javascript:;">$1</a>', txt);
                            }).join('');
                            hotelBrandAjaxSuggest.style.display = data.length ? '' : 'none';
                            AC.reset(hotelBrandAjaxSuggest.getElementsByTagName('a') || []);
                        }
                    }
                    $.ajax('/Domestic/Tool/AjaxHotelResult.aspx?cityId=' + cid + '&suggest=true&keyword=' + escape(val), param);
                }, 300);
                lastName = val;
            }
        });
    };
    var AC = (function() {
        var keyCode = {
            "UP": 38,
            "DOWN": 40,
            "ENTER": 13,
            "ESC": 27
        };
        var timer, selIndex = 0, flag, up, down;
        var len = 0;
        var elList = [];

        return {
            init: function(input, data, holder, cb) {
                this.cb = cb;
                var cDom_input = $(input),
                    cDom_holder = $(holder);
                cDom_holder.offsetA(cDom_input, 5);
                cDom_input.bind('keydown', function(e) {
                    var e = e || window.event, key = e.keyCode;
                    switch (key) {
                        case keyCode.DOWN:
                            if (!len) break;
                            if (len == 1) {
                                hover(elList[0]);
                                break;
                            }
                            if (up) selIndex = selIndex + 2;
                            down = true; up = false;
                            if (selIndex == len) selIndex = 0;
                            hover(elList[selIndex], elList[(selIndex ? selIndex : len) - 1]);
                            selIndex++;
                            break;
                        case keyCode.UP:
                            if (!len) break;
                            if (len == 1) {
                                hover(elList[0]);
                                break;
                            }
                            if (down) selIndex = selIndex - 2;
                            down = false; up = true;
                            if (selIndex == -1) selIndex = len - 1;
                            if (selIndex == 0 && flag) selIndex = len - 1;
                            hover(elList[selIndex], elList[selIndex == (len - 1) ? 0 : (selIndex + 1)]);
                            selIndex--;
                            flag = false;
                            break;
                        case keyCode.ENTER:
                            var curr = elList[len == 1 ? 0 : (selIndex + (down ? -1 : 1))];
                            if (curr&&$(curr).hasClass('checked')) {
                                select(input, holder, curr);
                                $(curr).removeClass('checked');
                                e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                break;
                            }
                            cb.onEnter && cb.onEnter();
                            break;
                        case keyCode.ESC:
                            holder.style.display = 'none';
                            break;
                        default: AC.selected = false;
                    }
                }).bind('focus', function() {
                        if (cb.onTimer) timer = setInterval(cb.onTimer, 200);
                        input.value.trim() && input.select();
                    }).bind('blur', function() {
                        AC.clearTimer();
                        holder.style.display = 'none';
                    });

                cDom_holder.bind('mousedown', function(e) {
                    var e = e || window.event, el = e.target || e.srcElement;
                    if (el.tagName.toLowerCase() == 'b') el = el.parentNode;
                    if (el.tagName.toLowerCase() == 'a') {
                        select(input, holder, el);
                    }
                    e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                    e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    if (cQuery.browser.isIE) holder.innerHTML += '';
                });
            },
            reset: function(list) {
                selIndex = 0;
                elList = list;
                len = list.length;
            },
            clearTimer: function() {
                timer && clearInterval(timer);
            }
        };

        function hover(el, neighbor) {
            el.className = 'layoutfix checked';
            if (neighbor) neighbor.className = 'layoutfix';
        }

        function select(obj, div, el) {
            obj.value = $(el).text().replace('&amp;', '&');
            var cb = AC.cb;
            cb.onSelect && cb.onSelect();
            hideFloatDiv(div);
            AC.selected = true;
        }
    })();
    function hideFloatDiv(el) {
        el.style.display = 'none';
    }
    function showFloatDiv(el) {
        el.style.display = '';
    }
    function showTips(obj, msg) {
        obj.focus();
        setTimeout(function(){
            MOD.formValidator.method("show", {
                $obj: $(obj),
                data: validateMessageConfig.hotel[msg],
                removeErrorClass: !0,
                hideEvent: "blur",
                //isFocus: !0,
                isScroll: false
            });
        }, 50)
        return false;
    }
});

//ok
($.fn.parent = function (selector) {
    selector = selector.slice(1);
    var parentNode = this[0].parentNode;
    while (parentNode && !(parentNode.className && $(parentNode).hasClass(selector)) && parentNode.nodeType != 9) {
        parentNode = parentNode.parentNode;
    }
    return parentNode || document;
});
var HotelView = new MadCat(function (C) {
    this.init = function () { };
    this.set = function () { };
    this.showLoading = function (el, tipsKey) {
        var h = el.clientHeight || el.offsetHeight,
            w = el.clientWidth || el.offsetWidth;
        var paddingTop = Math.abs((h - 80) / 2), h2 = Math.abs(h - paddingTop);
        if (el.loading) {
            el.loading.style.height = h2 + 'px';
            el.loading.style.width = w + 'px';
            el.loading.style.paddingTop = paddingTop + 'px';
            el.loading.style.opacity = '';
            el.loading.style.filter = '';
            el.loading.style.display = '';
        } else {
            var loading_el = $.create('div', {
                "innerHTML": '<img src="http://pic.ctrip.com/common/loading_50.gif" /></div>',
                "cssText": $.format('height:$1px;width:$2px;padding-top:$3px;text-align:center;background-color:#fff', h2, w, paddingTop)
            });
            el.appendChild(loading_el);
            el.loading = loading_el;
        }
    };
    this.hideLoading = function (el) {
        el.loading.style.display = 'none';
    };
}, hotelDomesticConfig);

//ok
var EMap = new MadCat(function (C) {
    var me = this;
    this.set = function () { };
    this.init = function () { };

    var popMap = null;
    this.showPopAndTraffic = function (pos, label, hotelID, obj) {
        var point = pos.split('|');
        if (!this.popMapInited) {
            popMap = { el: $('#pop_map') };
            popMap.el.find('.delete').bind('click', function () {
                var pop = $('#pop_map');
                var mapDiv = pop.find('div')[1];
                var ifm = mapDiv.getElementsByTagName('iframe')[0];
                pop.unmask();
                mapDiv.removeChild(ifm);
            });
            this.popMapInited = true;
        }
        if (!point[0] || !point[1]) {
            return;
        }
        var mapDiv = popMap.el.find('div')[1];
        popMap.el.mask();
        HotelView.showLoading(mapDiv);

        this.makeIframe(mapDiv, addressUrlConfig['mapIframe'], function (mapDiv) {
            me.createPop(this, mapDiv, point, label, hotelID);
            HotelView.hideLoading(mapDiv);
        });
        me.TrafficInfoformap.show(hotelID, obj);
    };
    this.createPop = function (win, mapDiv, point, label, hotelID) {
        var mapEl = win.document.getElementById('map');
        mapEl.style.width = mapDiv.style.width;
        mapEl.style.height = mapDiv.style.height;
        var map = win.maplet = new win.Maplet(mapEl);
        map.clickToCenter = false;
        map.showOverview(true, false);
        var cr = win.document.getElementById('ImgCopyright');
        cr.className = 'invisible';
        var nxt = cr.nextElementSibling || cr.nextSibling;
        while (nxt && nxt.nodeType != 1) {
            nxt = nxt.nextSibling;
        }
        nxt.className = 'invisible';
        point = new win.MPoint(point[0], point[1]);
        map.centerAndZoom(point, 7);
        var getpos = me.getView(map);
        var icon_addr = "http://pic.c-ctrip.com/hotels110127/hotel_pointer." + (cQuery.browser.isIE6 ? 'gif' : 'png'),
            shadow_addr = 'http://pic.c-ctrip.com/hotels081118/marker_shadow.png';
        var marker = new win.MMarker(point,
            new win.MIcon(icon_addr, 21, 31, 10, 30),
            null,
            new win.MLabel('<span>' + label + '</span>', {
                xoffset: 30,
                yoffset: 0,
                enableStyle: false
            }),
            new win.MIconShadow(shadow_addr, 40, 34, -5, 10)
        )
        popMap['Scenic'] = {};
        map.addControl(new win.MStandardControl());
        setTimeout(function () { map.addOverlay(marker); });
        marker.label.div.className = 'searchresult_popname box_shadow';
        map.setZoomLevel(11);
        var license = me.getLicense(mapMessageConfig['license'], 1);
        license && mapDiv.appendChild(license);
        var param = {
            method: cQuery.AJAX_METHOD_POST,
            context: {
                city: hotelDomesticConfig['city']['id'],
                maxlat: getpos.maxLat,
                maxlng: getpos.maxLng,
                minlat: getpos.minLat,
                minlng: getpos.minLng,
                searchtype: "101,102"
            },
            escape: false,
            async: true,
            cache: false,
            onsuccess: function (res) {
                if (!res.responseText) return;
                var json = $.parseJSON(res.responseText);
                for (var i = 0, l = json.length; i < l; i++) {
                    var d = json[i];
                    var mkr = me.createScenicMarker(win, d);
                    if (mkr) {
                        popMap['Scenic'][d.id] = mkr;
                        map.addOverlay(mkr);
                    }
                }
            }
        }
        $.ajax(addressUrlConfig['mapShowScenic'], param);
        win.MEvent.addListener(map, 'zoom', function () {
            var mkrs = popMap['Scenic'];
            if (this.getZoomLevel() <= 6) {
                for (var id in mkrs) {
                    map.removeOverlay(mkrs[id]);
                }
            } else {
                for (var id in mkrs) {
                    map.addOverlay(mkrs[id]);
                }
            }
        })
    };
    this.getView = function (map) {
        var view = map.getViewBound();
        var rightUp = view.RightUp.split(',');
        var leftDown = view.LeftDown.split(',');
        return {
            maxLat: rightUp[1],
            maxLng: rightUp[0],
            minLat: leftDown[1],
            minLng: leftDown[0]
        }
    };
    this.TrafficInfoformap = (function () {
        var holder, table, loadDiv, linkTraffic;
        var cache = {}, cacheSize = 0;
        return {
            init: function () {
                holder = $('#pop_traffic_info');
                table = holder.find('table')[0];
                loadDiv = document.getElementById('pop_traffic_load');
                linkTraffic = holder.find('a')[0];
                this.inited = true;
            },
            load: function (hotelId, obj) {
                var addr = $.format(addressUrlConfig['traffic'], hotelId);
                $.ajax(addr, {
                    cache: true,
                    onsuccess: function (res) {
                        if (!res.responseText) return;
                        var data = $.parseJSON(res.responseText);

                        if (!data) {
                            holder.addClass('hidden');
                            return;
                        }
                        table.style.display = '';
                        loadDiv.style.display = 'none';
                        var htmlArr = [];
                        var d = {};
                        for (var p in data) {
                            if (!d[data[p]['start']]) {
                                d[data[p]['start']] = [];
                            }
                            d[data[p]['start']].push(data[p]);
                        }
                        for (var o in d) {
                            var html_p = '';
                            for (var i = 0, l = d[o].length; i < l; i++) {
                                html_p += "<p><span>" + d[o][i].name + "</span>" + mapMessageConfig['distanceLabel'] + d[o][i].distance + (d[o][i].detail ? "<span data-role='jmp' data-params=\"{'options':{'type':'jmp_text','template':'$jmp_text','content':{'txt':'" + d[o][i].detail + "'},'classNames':{'boxType':'jmp_text'},'css':{'maxWidth':450},'position':'bottomLeft-topRight','group':'distance'}}\" class='icon_notice'></span>" : '') + "</p>";
                            }
                            htmlArr.push('<tr><th><strong>' + o + '</strong></th><td>' + html_p + '</td></tr>');
                        }
                        window.tmpNode.innerHTML = '<table><tbody>' + htmlArr.join('') + '</tobdy></table>';
                        var tb = window.tmpNode.firstChild.tBodies[0];
                        tb.setAttribute('data-hotel', hotelId);

                        table.tBodies[1] ?
                            table.replaceChild(tb, table.tBodies[1]) :
                            table.appendChild(tb);
                        cache[hotelId] = tb;
                        cacheSize++;
                    }
                });
            },
            show: function (hotelId, obj) {
                this.inited || this.init();
                holder.removeClass('hidden');
                table.style.display = 'none';
                loadDiv.style.display = '';
                var tbodyCache = cache[hotelId],
                    tbody = table.tBodies[1];
                linkTraffic.href = '/map/' + hotelId + '.html#traffic';
                if (tbodyCache) {
                    table.replaceChild(tbodyCache, tbody);
                    table.style.display = '';
                    loadDiv.style.display = 'none';
                } else {
                    this.load(hotelId, obj);
                }
            }
        };
    })();

    this.createScenicMarker = function (win, data) {
        if (data['lon'] != '0' && data['lat'] != '0') {
            var pos = new win.MPoint(data['lon'], data['lat']);
            var type = {
                '1': 'college',
                '2': 'sight',
                '3': 'shopping',
                '4': 'hospital',
                '101': 'train',
                '102': 'airport'
            }[data['type']];
            var img = 'http://pic.c-ctrip.com/hotels110127/ico_' + type + '.png';
            var icon = new win.MIcon(img, 22, 26, 11, 26);
            var mkr = new win.MMarker(pos, icon, null, null, null);
            mkr.icon.div.title = data['name'];
            mkr.icon.div.style.zIndex = 0;
            mkr.autoHide = true;
            var img = mkr.icon.div.getElementsByTagName('img')[0];
            win.MEvent.addListener(mkr, 'mouseover', function (m) {
                img.src = img.src.replace(/(_\w+)(\.png)/, '$1_hover$2');
            });
            win.MEvent.addListener(mkr, 'mouseout', function (m) {
                img.src = img.src.replace(/_hover/, '')
            });
            return mkr;
        } else {
            return;
        }
    };
    this.getLicense = function (map_license, type) {
        var top = type == 1 ? 'top:458px;' : '';
        var license = this.create('div', {
            innerHTML: map_license,
            cssText: "position:absolute; left:80px; " + top + " bottom:3px; z-index:10;height:20px;",
            className: "map_license"
        });
        return license;
    };
    this.create = function (tag, attrs) {
        var el = document.createElement(tag);
        for (var p in attrs) {
            if (attrs.hasOwnProperty(p)) {
                if (p == 'cssText') {
                    el.style[p] = attrs[p];
                } else {
                    el[p] = attrs[p];
                }
            }
        }
        return el;
    };
    this.makeIframe = function (mapDiv, src, callback) {
        var h = parseInt(mapDiv.style.height, 10),
            w = parseInt(mapDiv.style.width, 10);
        var ifm = this.create('iframe', {
            src: src,
            width: w,
            height: h,
            frameBorder: 'none',
            cssText: 'border:none'
        });

        mapDiv.appendChild(ifm);
        var win = (ifm.window || ifm.contentWindow);
        win.addEventListener ? win.addEventListener('load', function () {
            callback.call(win, mapDiv);
        }, false) : win.attachEvent('onload', function () {
            callback.call(win, mapDiv);
        })
    };

}, hotelDomesticConfig);

//ok
var AMap = new MadCat(function (C) {
    var el,
        cur,
        curCity,
        pop_el,
        divAMap,
        AMapLoad;
    var cityId,
        cityPY;
    var hash = {},
        cityHash = {};
    var popTmpl = '<b class="${cls}" style="left: ${left}px;"></b><a class="ico_delete2" href="javascript:;"></a><strong>${name}</strong><p>${desc}</p><div class="searchresult_mapjump_bom"><a href="javascript:;" onclick="AMap.click(${id})">' + mapMessageConfig['aMap'][0] + '${name}' + mapMessageConfig['aMap'][1] + '</a></div>';
    var mapTmpl = '<area shape="poly" onclick="AMap.showPop(${id}, true)" coords="${coords}" id="zone_${id}" href="javascript:;"/>';
    this.init = function (city) {
        if (!el) {
            el = $('#amap');
            pop_el = document.getElementById('divAMapJump'),
                divAMap = document.getElementById('divAMap'),
                cityId = document.getElementById('cityId'),
                cityPY = document.getElementById('cityPY');
            AMapLoad = document.getElementById('AMapLoad');
            el.find('.delete').bind('click', function () {
                el.unmask();
                el[0].style.display = 'none';
            })
        }
        curCity = city || hotelDomesticConfig['city']['id'];
        divAMap.innerHTML = '';
        AMapLoad.style.display = '';
        el[0].style.display = '';
        el.mask();
        if (cityHash[curCity]) {
            this.parse(cityHash[curCity]);
        } else {
            $.ajax(addressUrlConfig['amap'] + '?city=' + curCity, {
                cache: true,
                onsuccess: function (response) {
                    var json = response.responseText;
                    if (!json) { return; }
                    json = json.replace(/\n/g, "");
                    json = $.parseJSON(json);
                    this.parse(json);
                } .bind(this)
            })
        }
    };
    this.showPop = function (id, f, city) {
        cur = id;
        if (this.inited && !city && (curCity == hotelDomesticConfig['city']['id'] || f)) {
            el[0].style.display = '';
            el.mask();
            this.setPop();
        } else {
            this.init(city);
        }
    };
    this.hidePop = function () {
        pop_el.style.display = 'none';
    };
    this.parse = function (data) {
        cityHash[curCity] = data;
        var res = ['<img style="-webkit-user-select:none;-moz-user-select:none;" src="', data.map_image, '" usemap="#m_hotmap" /><map id="m_hotmap" name="m_hotmap">'];
        var d = data.data;
        if (!d) {
            return;
        }
        for (var i = 0, l = d.length; i < l; i++) {
            var item = d[i];
            hash[item.id] = item;
            item.coords = item.coords || '0,0';
            res.push($.replace(mapTmpl, item))
        }
        res.push('</map>');
        divAMap.innerHTML = res.join('');
        AMapLoad.style.display = 'none';
        setTimeout(function () {
            el.mask();
        }, 300)
        setTimeout(this.setPop, 100);
        this.inited = true
    };
    this.setPop = function () {
        var curZone = hash[cur];
        if (!curZone) {
            pop_el.style.display = 'none';
            return;
        }
        var coords = hash[cur].coords.split(',');
        var odd = [],
            even = [];
        for (var i = 0, l = coords.length; i < l; i++) {
            i % 2 ? even.push(coords[i]) : odd.push(coords[i])
        }
        var x1 = Math.min.apply(null, odd),
            x2 = Math.max.apply(null, odd),
            y1 = Math.min.apply(null, even),
            y2 = Math.max.apply(null, even);
        var x = x1 + (x2 - x1) / 2,
            y = y1 + (y2 - y1) / 2;
        var cls = 'tri_b',
            left = 50;
        if (y < 150) {
            cls = 'tri_t';
            y += 20
        } else {
            y -= 165
        }
        if (x > 366) {
            x -= 272;
            left = 272
        } else {
            x -= 50
        }
        if (x < 10) {
            left = 20;
            x += 30
        }
        if (x > 373) {
            left = 302;
            x -= 30
        }
        pop_el.innerHTML = $.replace(popTmpl, $.extend(curZone, {
            left: left,
            cls: cls
        }));
        pop_el.style.left = x + 'px';
        pop_el.style.top = y + 'px';
        pop_el.style.display = '';
    };
    this.click = function (id) {
        var fm = document.forms[0];
        if (curCity != hotelDomesticConfig['city']['id']) {
            fm.action = $.format(addressUrlConfig['linkZone'], cityPY.value, cityId.value, id);
        } else {
            fm.action = $.format(addressUrlConfig['linkZone'], hotelDomesticConfig['city']['py'], hotelDomesticConfig['city']['id'], id);
        }
        if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
        fm.target = "_self";
        fm.submit();
    };
}, hotelDomesticConfig);

//ok
var HotelFilter = new MadCat(function () {
    this.init = function () {
        $('#filter_content').bind('click', function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            var nodeName = target.nodeName.toLowerCase();
            if (nodeName == 'a' || nodeName == 'input') {
                var doPost = target.dataset ? target.dataset['dopost'] : target.getAttribute('data-dopost');
                if (doPost == 'T') {
                    var fm = document.forms[0];
                    fm.action = nodeName == 'a' ? target.href : (target.dataset ? target.dataset['url'] : target.getAttribute('data-url'));
                    if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
                    fm.target = "_self";
                    fm.submit();
                    e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                    if (nodeName == 'a') {
                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    }
                } else if (nodeName == 'input') {
                    window.location = target.dataset ? target.dataset['url'] : target.getAttribute('data-url');
                }
            }
        })
        /* -------------------------------------- */
        this.PriceRange($('#priceRange'));
        $('#btn_range').bind('click', function () {
            var inps = document.getElementById('priceRange').getElementsByTagName('input');
            var v1 = inps[0].value | 0, v2 = inps[1].value;
            var price = '';
            if (v2 === '') {
                if (v1 == '') {
                    price = '';
                } else {
                    price = 'v' + parseInt(v1, 10);
                }
            } else {
                var min = Math.min(v1, v2),
                    max = Math.max(v1, v2);
                inps[0].value = min;
                inps[1].value = max;
                price = 'v' + min + 'v' + max;
            }
            var fm = document.forms[0];
            fm.action = addressUrlConfig['postUrl']['PriceUrl'].replace('v0v0', price);
            if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
            fm.target = "_self";
            fm.submit();
        });
        /* -------------------------------------- */
        $('#chkProm').bind('click', function () {
            var fm = document.forms[0];
            fm.action = addressUrlConfig['postUrl']['FilterPromoteUrl'];
            if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
            fm.target = "_self";
            fm.submit();
        })
        $('#chkprepay').bind('click', function () {
            var fm = document.forms[0];
            fm.action = addressUrlConfig['postUrl']['SearchPayTypeUrl'];
            if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
            fm.target = "_self";
            fm.submit();
        })
        $('#chkTMony').bind('click', function () {
            var fm = document.forms[0];
            fm.action = addressUrlConfig['postUrl']['RequestTravelUrl'];
            if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
            fm.target = "_self";
            fm.submit();
        })
        /* -------------------------------------- */
        this.Select($('#sort_sel'));
        /* -------------------------------------- */
        function hideLocationDiv() {
            document.getElementById('locationDiv').style.display = "none";
            $(document).unbind('click', hideLocationDiv);
        }
        var tabInit = false;
        $('#moreLocation').bind('click', function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            var locationDiv = document.getElementById('locationDiv');

            if (!tabInit) {
                (function (holder) {
                    var html = '';
                    var cityId = hotelDomesticConfig['city']['id'];
                    var data = HOTEL_POSITION[cityId];
                    if (!data) return;
                    var HotelPosTitle = addressMessageConfig["hotelPos"]["titles"];
                    var source = {};
                    var flag = false;
                    for (var key in HotelPosTitle) {
                        var t = HotelPosTitle[key];
                        if ("string" == typeof key) {
                            var sk = t + "|" + key;
                            if (typeof source[t] == "undefined") { source[sk] = []; }
                            if (typeof data[key] != "undefined") {
                                source[sk] = data[key];
                                flag = flag || true;
                            } else {
                                delete source[sk];
                                flag = flag || false;
                            }
                        }
                    }
                    if (!flag) return;

                    var tabHTML = [],
                        subHTML = [];
                    var urlPrefix = {
                        'zone': 'zone',
                        'location': 'location',
                        'metro': 'l'
                    }
                    for (var d in source) {
                        var keys = d.split('|');
                        tabHTML.push('<li><span>' + keys[0] + '</span></li>');
                        var items = source[d];

                        if (keys[1] == 'metro') {
                            subHTML.push('<dd id="div_metro" style="display:none;">');
                            for (var i = 0, l = items.length; i < l; i++) {
                                var item = items[i];
                                subHTML.push('<a id="metro__' + item['data'].split('|')[2] + '" href="' + addressUrlConfig['locationMoreUrl'].replace('${location}', 'l' + item['data'].split('|')[2]) + '" class="metro" title="' + item['display'] + '">' + item['display'] + '</a>')
                            }
                            subHTML.push('<div id="filterStation" class="metro_station" style="display:none;"></div>', '</dd>');
                        } else {
                            subHTML.push('<dd style="display:none;">');
                            for (var i = 0, l = items.length; i < l; i++) {
                                var item = items[i];
                                subHTML.push('<a href="' + addressUrlConfig['locationMoreUrl'].replace('${location}', urlPrefix[keys[1]] + item['data'].split('|')[2]) + '" title="' + item['display'] + '">' + item['display'] + '</a>')
                            }
                            subHTML.push('</dd>');
                        }
                    }
                    var cityHTML = [];
                    if (data['subCity'] && data['subCity'].length) {
                        var subCity = data['subCity'];
                        cityHTML.push('<div class="keyword_sub_city">' + addressMessageConfig['hotelPos']['subCity']);
                        for (var i = 0, l = subCity.length; i < l; i++) {
                            var city = subCity[i];
                            cityHTML.push('<a class="subCity" href="/hotel/' + city['py'] + city['id'] + '">' + city['display'] + '</a>');
                        }
                        cityHTML.push('</div>');
                    }

                    html += '<div class="keyword_list2">' +
                        '<div class="address_hot_list2">' +
                        '<ol class="address_hot_abb2">' +
                        tabHTML.join('') +
                        '</ol>' +
                        '</div>' +
                        '<dl class="area_list">' +
                        subHTML.join('') +
                        '</dl>' +
                        cityHTML.join('') +
                        '</div>';

                    $(holder).html(html).bind('click', function (e) {
                        e = e || window.event;
                        var el = e.target || e.srcElement;
                        if (el.tagName.toLowerCase() == 'a') {
                            switch (el.className) {
                                case "subCity":
                                    var fm = document.forms[0];
                                    var txtCheckIn = $('#txtCheckIn'),
                                        txtCheckOut = $('#txtCheckOut');
                                    if (!txtCheckIn.value().toDate()) {
                                        txtCheckIn.value(new Date().toStdDateString());
                                    }
                                    if (!txtCheckOut.value().toDate()) {
                                        txtCheckOut.value(txtCheckIn.value.toDate().addDays(1).toStdDateString());
                                    }
                                    document.getElementById('txtHotelPsx').value = '';
                                    document.getElementById('hotelAreaName').value = '';
                                    document.getElementById('txtHotelName').value = '';
                                    fm.action = el.href;
                                    fm.target = "_self";
                                    if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
                                    fm.submit();
                                    e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                                    e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                    break;
                                case "metro":
                                    var station = document.getElementById('filterStation');
                                    var metroId = station.getAttribute('metroId');
                                    if (metroId) {
                                        document.getElementById(metroId).className = 'metro';
                                    }
                                    el.className = 'metro current';

                                    var res = ['<a href="' + el.href + '" title="' + el.innerHTML + '">' + addressMessageConfig['hotelPos']['all'] + '</a>'];

                                    var cityId = hotelDomesticConfig['city']['id'];
                                    var kw = '(' + el.innerHTML + ')';
                                    var reg = new RegExp('@[^\\|]*\\|(([^\\|]*)' + kw.toReString() + '[^\\|]*)\\|S(\\d+)\\|[^@]*', "gi");
                                    var DATA = '@' + HOTEL_POSITION[cityId]['all'].join('@') + '@';

                                    DATA = DATA.replace(reg, function (_, name, label, id) {
                                        res.push('<a href="' + addressUrlConfig['locationMoreUrl'].replace('${location}', 's' + id) + '" title="' + name + '">' + label + '</a>');
                                        return '';
                                    });
                                    if (res.length) {
                                        station.innerHTML = res.join('');
                                        station.style.display = '';
                                    } else {
                                        station.innerHTML = '';
                                        station.style.display = 'none';
                                    }
                                    station.setAttribute('metroId', el.id);
                                    e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                                    e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                    break;
                                case "metro current":
                                    e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                                    e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                    break;
                                default:
                                    var fm = document.forms[0];
                                    fm.action = el.href;
                                    fm.target = "_self";
                                    if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
                                    fm.submit();
                                    e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                                    e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                    break;
                            }
                        }
                    })
                    var configA = {
                        options: {
                            tab: "li",
                            panel: "#locationDiv dd",
                            trigger: "click"
                        },
                        style: {
                            tab: 'hot_selected2',
                            panel: {
                                display: ['block', 'none']
                            }
                        }
                    }
                    $.mod.load("tab", "1.2", function () {
                        $('#locationDiv').regMod('tab', '1.2', configA);
                    })
                    tabInit = true;
                })(locationDiv)
            }

            if (locationDiv.style.display == "none") {
                $(document).bind('click', hideLocationDiv);
            }
            if (document.getElementById('divBrandMore').style.display == "") {
                hideMoreBrand();
            }
            locationDiv.style.display = "";
            $(locationDiv).offsetA($(target), 6);

            e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        });
        $('#locationDiv').bind('click', function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.nodeName.toLowerCase() == 'a') return;
            e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        });
        /* -------------------------------------- */
        function hideMoreBrand() {
            document.getElementById('divBrandMore').style.display = "none";
            $(document).unbind('click', hideMoreBrand);
        }
        $('#moreBrand').bind('click', function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            var moreBrandDiv = document.getElementById('divBrandMore');
            if (moreBrandDiv.style.display == "none") {
                $(document).bind('click', hideMoreBrand);
            }
            if (document.getElementById('locationDiv').style.display == "") {
                hideLocationDiv();
            }
            moreBrandDiv.style.display = "";
            moreBrandDiv.style.zIndex = 111;
            $(moreBrandDiv).offsetA($(target), 6)
            e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        });
        $('#divBrandMore').bind('click', function (e) {
            e = e || window.event;
            e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
            var target = e.target || e.srcElement;
            if (target.nodeName == 'A') {
                var pv = target.previousElementSibling || target.previousSibling;
                while (pv && pv.nodeType != 1) {
                    pv = pv.previousSibling
                }
                pv.checked = !pv.checked;
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }
        });
        $('#btnSelectBrand').bind('click', function (e) {
            e = e || window.event;
            var checkboxs = this.parentNode.getElementsByTagName('input');
            var listlen = checkboxs.length - 1;
            var brandIDs = '';
            var sortGroup = [],
                sortBrand = [];
            for (var i = 0; i < listlen; i++) {
                if (checkboxs[i].checked) {
                    if (checkboxs[i].value.indexOf('g') > -1) {
                        sortGroup.push(checkboxs[i].value);
                    } else {
                        sortBrand.push(checkboxs[i].value);
                    }
                }
            }
            if (sortGroup.length > 1) {
                sortGroup.sort(function (x, y) {
                    var a = parseInt(x.replace('g', '')),
                        b = parseInt(y.replace('g', ''));
                    return a - b;
                });
            }
            if (sortBrand.length > 1) {
                sortBrand.sort(function (x, y) {
                    var a = parseInt(x.replace('h', '')),
                        b = parseInt(y.replace('h', ''));
                    return a - b;
                });
            }
            brandIDs = sortGroup.join('') + sortBrand.join('');
            var fm = document.forms[0];
            fm.action = addressUrlConfig['brandMoreUrl'].replace('${brand}', brandIDs);
            fm.target = '_self';
            if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
            fm.submit();
            e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        });
        /* -------------------------------------- */
        $('#showResult').bind('click', function () {
            if (this.className == 'show') {
                document.getElementById('filter_content').style.display = 'none';
                document.getElementById("DivfilterSelected").style.borderBottom = "none";
                this.className = 'hide';
            } else {
                document.getElementById('filter_content').style.display = 'block';
                document.getElementById("DivfilterSelected").style.borderBottom = "1px dashed #CCCCCC";
                this.className = 'show';
            }
        })
    };

    this.set = function () { };
    this.Select = function (obj) {
        if (obj.length) {
            var list = obj.find('.c_sort_list');

            obj.bind('mouseover', function () {
                list.removeClass('hidden');
            }).bind('mouseout', function () {
                    list.addClass('hidden');
                });
        }

    };
    this.PriceRange = function (obj) {
        var timer = 0;
        var isShow = false;

        var inps = obj.find('input');
        inps.bind('focus', onFocus)
            .bind('blur', onBlur)
            .bind('keydown', onKeyDown);

        obj.bind('click', function (e) {
            e = e || window.event;
            e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        });

        function onKeyDown(e) {
            e = e || window.event;
            var code = e.keyCode || e.charCode;
            if (code == 13) {
                e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }
        }
        function onFocus() {
            obj[0].className = 'sort_range_hover c_sort_range';
            timer = setInterval(fix.bind(this), 100);
            if (!isShow) {
                $(document).bind('click', dismiss);
                isShow = true;
            }
        }
        function onBlur() {
            clearInterval(timer);
            fix.apply(this);
        }
        function fix() {
            if (!this.value || this.type == 'button') return;
            if (!/^\d+$/.test(this.value)) {
                this.value = this.value.replace(/[^0-9]+/, '');
            }
            if (this.value.indexOf('0') == 0 && this.value.length > 1) {
                this.value = this.value.substr(1);
            }
        }
        function dismiss() {
            obj[0].className = 'c_sort_range';
            $(document).unbind('click', dismiss);
            isShow = false;
        }
    };
});

//ok
var PromInfoBox = (function () {
    var holder;
    var container;
    return {
        init: function () {
            holder = $('#promInfo_box');
            container = holder.find('.pop_bd');
            holder.bind('click', this.onClick.bind(this));
            $(document).bind('click', this.dismiss);
            this.inited = true;
        },
        setTitle: function (txt) {
            holder.find('h3').html(txt);
        },
        setContent: function (data) {
            if (data && data.length) {
                container.html('<ul><li>' + data.join('</li><li>') + '</li></ul>');
            } else {
                container.html('');
            }
        },
        show: function (obj, c, d) {
            holder.removeClass('hidden');
            if (obj) {
                var r = obj.getBoundingClientRect();
                var scrollLeft = Math.max(document.documentElement ? document.documentElement.scrollLeft : 0, document.body ? document.body.scrollLeft : 0),
                    scrollTop = Math.max(document.documentElement ? document.documentElement.scrollTop : 0, document.body ? document.body.scrollTop : 0);
                holder[0].style.left = r.left + scrollLeft - 100 + "px";
                holder[0].style.top = r.top + scrollTop + 15 + "px";
            }
        },
        dismiss: function () {
            holder.addClass('hidden');
        },
        onClick: function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.getAttribute('data-dopost') == 'T') return false;
            if (target.className == 'delete') {
                this.dismiss();
            }
            e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
    };
})();

//ok
var VisitorNumber = new MadCat(function (C) {
    this.init = function () {
        var switcher = fm.v('vistorCount');
        if (switcher != 'T') return;
        $.ajax(addressUrlConfig['vistorCount'], {
            cache: false,
            onsuccess: function (response) { }
        });
    };
}, hotelDomesticConfig);

var HotelRoom = new MadCat(function (C) {
    var hotelHash = {};
    this.onAllRoomButtonClick = function (hotelId, obj, query, code) {
        var holder = document.getElementById('rl_' + hotelId);
        var htl = $('#' + hotelId);
        if (!hotelHash[hotelId]) {
            hotelHash[hotelId] = {};
        }
        var hotel = hotelHash[hotelId];
        var isShowAll = hotel['isShowAll'];
        $(obj).addClass('hidden');
        if (hotel.inited) {
            isShowAll || this.showAllRooms(hotelId, holder, null, null, code);
            htl.addClass('show_all_room');
            this.switchAllRoomLink(htl.find('.searchresult_toggle a')[0], false);
        } else {
            var img = new Image();
            img.src = 'http://pic.c-ctrip.com/common/loading.gif';
            obj.parentNode.appendChild(img);
            this.showAllRooms(hotelId, holder, function () {
                img.style.display = 'none';
                htl.addClass('show_all_room');
                this.switchAllRoomLink(htl.find('.searchresult_toggle a')[0], isShowAll);
            } .bind(this), query, code);
        }
    };
    this.switchAllRoomLink = function (btn, isShowAll) {
        if (isShowAll) {
            btn.className = btn.className.replace('show_fold', 'show_unfold');
            btn.innerHTML = roomMessageConfig['allroom'][0];
        } else {
            btn.className = btn.className.replace('show_unfold', 'show_fold');
            btn.innerHTML = roomMessageConfig['allroom'][1];
        }
    };
    this.onAllRoomLinkClick = function (hotelId, obj, num, query, code) {
        var holder = document.getElementById('rl_' + hotelId);
        if (!hotelHash[hotelId]) {
            hotelHash[hotelId] = {};
        }
        var hotel = hotelHash[hotelId];
        var isShowAll = hotel['isShowAll'];
        if (hotel.inited) {
            if (isShowAll) {
                obj.className = obj.className.replace('show_fold', 'show_unfold');
                obj.innerHTML = num ? (roomMessageConfig['allroom'][2] + num + roomMessageConfig['allroom'][3]) : roomMessageConfig['allroom'][0];

                var hotelDiv = obj.parentNode.parentNode;
                var r = hotelDiv.getBoundingClientRect();
                if (r.top < 0) {
                    var scrollLeft = Math.max(document.documentElement ? document.documentElement.scrollLeft : 0, document.body ? document.body.scrollLeft : 0),
                        scrollTop = Math.max(document.documentElement ? document.documentElement.scrollTop : 0, document.body ? document.body.scrollTop : 0);
                    window.scrollTo(scrollLeft, scrollTop + r.top);
                }
            } else {
                obj.className = obj.className.replace('show_unfold', 'show_fold');
                obj.innerHTML = roomMessageConfig['allroom'][1];
            }
        } else {
            $(obj).addClass('hidden');
            var nxt = obj.nextElementSibling || obj.nextSibling;
            while (nxt && nxt.nodeType != 1) {
                nxt = nxt.nextSibling
            }
            $(nxt).removeClass('hidden');
        }
        this.showAllRooms(hotelId, holder, function () {
            obj.className = obj.className.replace('show_unfold', 'show_fold');
            obj.innerHTML = roomMessageConfig['allroom'][1];
            var nxt = obj.nextElementSibling || obj.nextSibling;
            while (nxt && nxt.nodeType != 1) {
                nxt = nxt.nextSibling
            }
            $(nxt).addClass('hidden');
            $(obj).removeClass('hidden');
        }, query, code);
    };
    this.showAllRooms = function (hotelId, holder, cb, query, code) {
        var hotel = hotelHash[hotelId];
        var isShowAll = hotel['isShowAll'];
        var htl = $('#' + hotelId);
        if (hotel.inited) {
            if (isShowAll && C.ViewType == 'simple') {
                htl.removeClass('show_all_room');
                htl.find('.all_room_btn').removeClass('hidden');
                hotel['isShowAll'] = true;
                return;
            }
            isShowAll ?
                this.swap(holder, hotel.allRooms, hotel.original) :
                this.swap(holder, hotel.original, hotel.allRooms);
            if (isShowAll) {
                for (var i = 0, l = hotel.originalRows.length; i < l; i++) {
                    var el = hotel.originalRows[i];
                    el.isExpanded && this.clickName(el);
                }
            } else {
                for (var i = 0, l = hotel.allRoomRows.length; i < l; i++) {
                    var el = hotel.allRoomRows[i];
                    el.isExpanded && this.clickName(el);
                }
            }
            hotel['isShowAll'] = !isShowAll;
        } else {
            var param = {
                cache: true,
                onsuccess: function (response) {
                    var res = response.responseText;
                    if (!res) return;
                    hotel['isShowAll'] = true;
                    if (code) {
                        res = res.replace(/("hotel_roompic")/gi, '$1 data-ctm="' + code + '" ');
                    }
                    window.tmpNode.innerHTML = res;
                    hotel.allRooms = $(window.tmpNode).find('table');
                    hotel.allRoomRows = hotel.allRooms[0].rows;
                    hotel.original = $(holder).find('table');
                    hotel.originalRows = hotel.original[0].rows;
                    this.swap(holder, hotel.original, hotel.allRooms);
                    cb && cb();
                    hotel.inited = true;
                } .bind(this)
            }
            var pageInfo = getPageInfo(htl, true);
            $.ajax(addressUrlConfig['allRoom'] + 'hotel=' + hotelId + '&' + (query || '') + "&index=" + pageInfo.index + "&page=" + pageInfo.page + "&rs=" + pageInfo.rs, param);
        }
    };
    this.swap = function (holder, listA, listB) {
        var l = Math.max(listA.length, listB.length);
        for (var i = 0; i < l; i++) {
            var a = listA[i], b = listB[i];
            if (a) {
                if (b) holder.replaceChild(b, a);
                else holder.removeChild(a);
            } else if (b) {
                holder.appendChild(b);
            }
        }
    };
    this.clickName = function (row) {
        var a = row.cells[0].getElementsByTagName('a')[1];
        if (!a || a.className.indexOf("hotel_room_name") < 0) {
            a = row.cells[1].getElementsByTagName('a')[0];
        }
        a.onclick();
    };
    this.next = function (el) {
        var nxt = el.nextElementSibling || el.nextSibling;
        while (nxt && nxt.nodeType != 1) {
            nxt = nxt.nextSibling
        }
        return nxt;
    }
    this.prev = function (el) {
        var pv = el.previousElementSibling || el.previousSibling;
        while (pv && pv.nodeType != 1) {
            pv = pv.previousSibling
        }
        return pv
    }
    this.str2Tr = function (str) {
        window.tmpNode.innerHTML = '<table>' + str + '</table>';
        return window.tmpNode.firstChild.rows;
    };
    function getPageInfo(obj, isRoot) {
        var li = isRoot ? obj : $($(obj).parent('.searchresult_list')),
            info = {};

        return {
            index: li.attr('data-index') || '',
            page: li.attr('data-page') || '',
            rs: C.isNoResult || ''
        }

    };
    this.toggleDetails = function (tr, hotelId) {
        var trArr = [];
        var nxt = this.next(tr);
        if (!nxt || /\bt\b/.test(nxt.className)) {
            var subRoomList = tr.getElementsByTagName('input')[0];
            if (subRoomList && subRoomList.value) {
                if (tr.canClick === false) return;

                var row = this.str2Tr('<tr><td colspan="6"><img style="vertical-align:middle;" src="http://pic.ctrip.com/common/loading.gif" />' + roomMessageConfig['loading'] + '</td></tr>')[0];
                var pageInfo = getPageInfo(tr);
                tr.parentNode.insertBefore(row, nxt);
                tr.canClick = false;
                $.ajax(addressUrlConfig['roomInfo'] + '&hotel=' + hotelId + '&subRoomList=' + subRoomList.value + (hotelDomesticConfig['searchSingleRoomParam'] || '') + "&index=" + pageInfo.index + "&page=" + pageInfo.page + "&rs=" + pageInfo.rs, {
                    cache: true,
                    onsuccess: function (response) {
                        var txt = response.responseText;
                        if (!txt) return;
                        var Arr = this.str2Tr(txt);
                        if (Arr.length > 1) {
                            tr.className += ' expandedBaseRoom';
                        }
                        //$(Arr).removeClass('hidden');

                        var parentNode = tr.parentNode;
                        for (var i = 0, l = Arr.length - 1; i < l; i++) {
                            parentNode.insertBefore(Arr[0], row);
                        }
                        if (typeof tr.isExpanded == 'undefined' && Arr[0]) {
                            var imgs = Arr[0].getElementsByTagName('a');
                            for (var i = 0, l = imgs.length; i < l; i++) {
                                var img = imgs[i];
                                if (img.className == 'link') {
                                    img.style.backgroundImage = 'url(' + img.getAttribute('_src') + ')';
                                }
                            }
                        }
                        parentNode.replaceChild(Arr[0], row);
                        tr.isExpanded = true;
                    } .bind(this)
                })
            }
        } else {
            while (nxt && /\bunexpanded\b/.test(nxt.className)) {
                nxt = this.next(nxt);
            }
            trArr.push(nxt);
            while (nxt && /\bexpanded\b/.test(nxt.className)) {
                nxt = this.next(nxt);
                trArr.push(nxt);
            }
            if (tr.isExpanded) {
                if (trArr.length > 1) {
                    tr.className = tr.className.replace(/\bexpandedBaseRoom\b/ig, '');
                }
                trArr.each(function (el) {
                    $(el).addClass('hidden');
                });
                tr.isExpanded = false;
            } else {
                if (trArr.length > 1) {
                    tr.className += ' expandedBaseRoom';
                }
                trArr.each(function (el) {
                    $(el).removeClass('hidden');
                });
                if (typeof tr.isExpanded == 'undefined' && trArr[trArr.length - 1]) {
                    var imgs = trArr[trArr.length - 1].getElementsByTagName('a');
                    for (var i = 0, l = imgs.length; i < l; i++) {
                        var img = imgs[i];
                        if (img.className == 'link') {
                            img.style.backgroundImage = 'url(' + img.getAttribute('_src') + ')';
                        }
                    }
                }
                tr.isExpanded = true;
            }
        }
    };

    this.hideDetails = function (obj) {
        var tr = obj.parentNode.parentNode.parentNode;
        var roomRow = this.prev(tr);
        while (roomRow && /\bexpanded\b|\bunexpanded\b/.test(roomRow.className)) {
            roomRow = this.prev(roomRow);
        }
        this.clickName(roomRow);
    };

    this.onNameClick = function (obj, hotelId) {
        var tr = obj.parentNode.parentNode;
        this.toggleDetails(tr, hotelId);
    };

    this.onOrderButtonClick = function (hotel, room, payment, BRev, Minstate, PromoteType, StartDate, DepDate, requestTravelMoney, useFG, obj, ctmref, e) {
        if (!C.hasLogin) {
            if (!obj.id) {
                obj.id = "btnOrder_" + room + "_" + parseInt(Math.random() * 10000);
                if (obj.dataset) {
                    obj.dataset["hotel"] = hotel;
                    obj.dataset["room"] = room;
                    obj.dataset["payment"] = payment;
                    obj.dataset["brev"] = BRev;
                    obj.dataset["minstate"] = Minstate;
                    obj.dataset["promotetype"] = PromoteType;
                    obj.dataset["startdate"] = StartDate;
                    obj.dataset["depdate"] = DepDate;
                    obj.dataset["requesttravelmoney"] = requestTravelMoney;
                    obj.dataset["usefg"] = useFG;
                    obj.dataset["ctmref"] = ctmref;
                } else {
                    obj.setAttribute("data-hotel", hotel);
                    obj.setAttribute("data-room", room);
                    obj.setAttribute("data-payment", payment);
                    obj.setAttribute("data-brev", BRev);
                    obj.setAttribute("data-minstate", Minstate);
                    obj.setAttribute("data-promotetype", PromoteType);
                    obj.setAttribute("data-startdate", StartDate);
                    obj.setAttribute("data-depdate", DepDate);
                    obj.setAttribute("data-requesttravelmoney", requestTravelMoney);
                    obj.setAttribute("data-usefg", useFG);
                    obj.setAttribute("data-ctmref", ctmref);
                }
            }
            __SSO_booking(obj.id, typeof ISSSOQUICKLOGIN !== 'undefined' ? ISSSOQUICKLOGIN : 0);

        } else {
            this.order(hotel, room, payment, BRev, Minstate, PromoteType, StartDate, DepDate, requestTravelMoney, useFG, ctmref)
        }

        if (e = (e || window.event)) {
            e.returnValue = false;
            e.preventDefault && e.preventDefault();
        }
        return false;
    };

    this.order = function (hotel, room, payment, BRev, Minstate, PromoteType, StartDate, DepDate, requestTravelMoney, useFG, ctmref) {
        var params = {
            "Resource": hotel,
            "Room": room,
            "Paymentterm": payment,
            "BRev": BRev,
            "Minstate": Minstate,
            "PromoteType": PromoteType,
            "PromoteDate": '',
            "StartDate": StartDate,
            "DepDate": DepDate,
            "requestTravelMoney": requestTravelMoney,
            "useFG": useFG
        };
        fm.v(params);
        fm.action = fm.v('operationtype') == 'DELAYORDER' ? addressUrlConfig['delayOrder'] : addressUrlConfig['order'];

        var getctmref = '';
        if (window.location.href.indexOf('ctm_ref=') > 0) {
            if (ctmref != 'detailmapbook') {
                getctmref = '&ctm_ref=' + window.location.href.slice(window.location.href.indexOf('ctm_ref=')).replace('ctm_ref=', '');
            }
            fm.action += '?hotelid=' + hotel + getctmref;
        } else if (ctmref) {
            fm.action += '?hotelid=' + hotel + ctmref.replace('#', '&') + getctmref;
        } else {
            fm.action += '?hotelid=' + hotel;
        }
        fm.target = "_self";
        fm.submit();
    };

    this.onOrderNull = function (obj, txt) {
        if (obj && txt) {
            MOD.formValidator.method("show", {
                $obj: $(obj),
                data: txt,
                removeErrorClass: !0,
                isScroll: false
            })
            return false;
        }
    };
    this.onOrderRead = function (obj, txt) {
        if (obj && txt) {
            MOD.formValidator.method("show", {
                $obj: $(obj),
                data: txt,
                removeErrorClass: !0,
                isScroll: false
            })
            return false;
        }
    };

    this.PromInfo = (function (C) {
        return {
            render: function (hotelId, ctm) {
                var title = $.format(roomMessageConfig['prom'], '/hotel/' + hotelId + '.html', ctm);
                PromInfoBox.setTitle(title);
                PromInfoBox.setContent(C.Recommandprom[hotelId] || []);
            },
            show: function (hotelId, obj) {
                PromInfoBox.inited || PromInfoBox.init();
                this.render(hotelId, obj.getAttribute('data-ctm'));
                PromInfoBox.show(obj);
                var e = window.event || arguments.callee.caller.arguments[0];
                e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
            }
        };

    })(C);
}, hotelDomesticConfig)

//ok
var QueryEngine = (function () {
    var all;
    return {
        load: load
    };
    function initSearch() {
        var hotelSearchMod = new RegMod({
            city: $('#txtCity'),
            startDate: $('#txtCheckIn'),
            endDate: $('#txtCheckOut'),
            hotelPos: $('#txtHotelPsx'),
            hotelName: $('#txtHotelName'),
            offsetPos: 7
        });

        var timer = setTimeout(function () {
            clearTimeout(timer);
            if (typeof window.CHINA_HOTEL_CITY_RAW_DATA == 'undefined') {
                var fns = arguments.callee;
                timer = setTimeout(fns, 100);
                return;
            }
            getOtherDataByCity(hotelDomesticConfig['city']['id'], hotelDomesticConfig['city']['name'], function () {
                var txtHotelPsx = document.getElementById('txtHotelPsx');
                if (txtHotelPsx) {
                    txtHotelPsx.value = txtHotelPsx.defaultValue;
                    document.getElementById('hotelAreaName').value = txtHotelPsx.defaultValue;
                    MOD.n_hotelPos.method("checkValue");
                    if (/\/k1\S+/.test(window.location.href)) {
                        document.getElementById('positionArea').value = '';
                        document.getElementById('positionId').value = '';
                    }
                }
            });
        }, 50);

        HotelSearch.init();
        $('#btnSearch').bind('click', function (e) {
            var fm = document.getElementsByTagName('form')[0];
            if (HotelSearch.submit()) {
                fm.submit();
            }
            e.stop();
        });
        $('#btnSearchMapList').bind('click', function () {
            var fm = document.getElementsByTagName('form')[0];
            if (HotelSearch.submit(false, true)) {
                fm.target = '_blank';
                fm.submit();
            }
        })
    }
    function initMain() {
        window.tmpNode = document.createElement('div');
        window.tmpNode.className = 'hidden';
        document.body.appendChild(window.tmpNode)
        window.fm = document.forms[0];
        if (fm) {
            window.fm.v = function () {
                var a = arguments, l = a.length, eles = this.elements;
                if (l == 1) {
                    if (typeof a[0] == 'string')
                        return eles[a[0]] ? eles[a[0]].value.trim() : null;
                    else for (var p in a[0]) if (eles[p]) eles[p].value = a[0][p];
                } else if (l == 2) if (eles[a[0]]) eles[a[0]].value = a[1];
                return this;
            };
        }

        all = [
            HotelFilter,
            VisitorNumber
        ];
        invokeAll('init');

        $(document).bind('mousedown', function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.nodeName != 'A') {
                target = target.parentNode;
            }
            if (target && target.nodeType == 1 && target.nodeName == 'A' && target.getAttribute('href') != 'javascript:;') {
                var ctm = target.dataset ? target.dataset['ctm'] : target.getAttribute('data-ctm');
                if (ctm && !(/#ctm_ref=/.test(target.href))) {
                    target.href += ctm;
                }
            }
        }).bind('click', function (e) {
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (target.nodeName != 'A') {
                    target = target.parentNode;
                }
                if (target && target.nodeType == 1 && target.nodeName == 'A') {
                    var doPost = target.dataset ? target.dataset['dopost'] : target.getAttribute('data-dopost');
                    if (doPost) {
                        var fm = document.forms[0];
                        fm.action = target.href;
                        if (target.target) {
                            fm.target = target.target;
                        } else {
                            fm.target = "_self";
                        }
                        if (fm.__VIEWSTATE) fm.__VIEWSTATE.name = "NOVIEWSTATE";
                        fm.submit();
                        e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    }
                }
            });

        var param = {
            type: 'text/javascript',
            async: true,
            charset: 'utf-8',
            onload: function () {
                var imgload = new Lazyload({
                    elems: document.getElementsByName('hotelpic'),
                    container: window,
                    mode: "c",
                    ondataload: function (elem) {
                        elem.src = elem.getAttribute('_src');
                        elem.onmouseover = function () {
                            var next = this.nextElementSibling || this.nextSibling;
                            while (next && next.nodeType != 1) {
                                next = next.nextSibling
                            }
                            if (next && next.getAttribute('_src')) {
                                next.src = next.getAttribute('_src');
                                next.removeAttribute('_src');
                            }
                            if (cQuery.browser.isIE6) {
                                this.onmouseover = function () {
                                    var next = this.nextElementSibling || this.nextSibling;
                                    while (next && next.nodeType != 1) {
                                        next = next.nextSibling
                                    }
                                    if (next) {
                                        next.style.display = '';
                                    }
                                };
                            } else {
                                this.onmouseover = null;
                            }
                        };
                        if (cQuery.browser.isIE6) {
                            elem.onmouseout = function () {
                                var next = this.nextElementSibling || this.nextSibling;
                                while (next && next.nodeType != 1) {
                                    next = next.nextSibling
                                }
                                if (next) {
                                    next.style.display = 'none';
                                }
                            };
                        }
                        this.elock = false;
                    }
                });
            }
        }
        cQuery.loader.js(hotelDomesticConfig['isLocalhost'] ? '/WebResourceOnline/JavaScript/domestic/lazyload.js' : 'http://webresource.c-ctrip.com/uires/hotelbooking/online/JavaScript/domestic' + hotelDomesticConfig['webResourceReleaseNo'] + '/lazyload.js', param);

        $.mod.load("jmp", "1.0", function () {
            $(document).regMod('jmp', '1.0', { options: { alignTo: "cursor"} });
        });
        //hover thumbs of expanded rooms
        ; (function (document) {
            var big = new Image(),DELAY = 500,isTargetDom = function (dom) {
                return dom && dom.nodeName.toLowerCase() === 'a' && $(dom).hasClass('link');
            },target, timer,position = function (dom, pos) {
                dom.style.position = 'absolute';
                dom.style.left = pos.x + 'px';
                dom.style.top = pos.y + 'px';
            },changeView = function (dom, visible) {
                var src = dom.getAttribute('data-src'),toShow = src && visible,offset = $(dom).offset();
                if (toShow) {
                    big.setAttribute('src', src);
                    position(big, { x: offset.left + 80, y: offset.top });
                }
                $(big)[toShow ? 'removeClass' : 'addClass']('hidden');
            };
            document.body.appendChild(big);
            big.className = 'hotel_pic_big2 hidden';
            $('#hotel_list').bind('mouseover', function (e) {
                target = e.target;
                clearTimeout(timer);
                isTargetDom(target) && (timer = setTimeout(function () { changeView(target, true); }, DELAY));
            }).bind('mouseout', function (e) {
                    target = e.target;
                    isTargetDom(target) && changeView(target, false);
                });
        })(document);

    }
    function initSide() {
        var vistedHotels = $('#vistedHotels');
        if (vistedHotels.length) {
            var vistedClick = false;
            vistedHotels.bind('click', function (e) {
                if (vistedClick) return;
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (target.className == 'delete') {
                    vistedClick = true;
                    $.ajax('/Domestic/Tool/AjaxDeleteVistedB.aspx?hotel=' + (target.dataset ? target.dataset['id'] : target.getAttribute('data-id')), {
                        cache: true,
                        onsuccess: function (response) {
                            vistedClick = false;
                            if (response.responseText == 'success') {
                                var item = target.parentNode,
                                    box = item.parentNode;
                                box.removeChild(item);
                                if (!box.getElementsByTagName('li').length) {
                                    box.innerHTML = '<li>' + roomMessageConfig['noVisit'] + '</li>';
                                }
                            }
                        }
                    });
                }
            });
        }

        var cityId = hotelDomesticConfig['city']['id'];
        var timer = setTimeout(function () {
            clearTimeout(timer);
            if (typeof window.HOTEL_POSITION[cityId] == 'undefined') {
                var fns = arguments.callee;
                timer = setTimeout(fns, 100);
                return;
            }
            var hidCityIds = document.getElementById('hidCityIds').value;
            var cityIds = {};
            hidCityIds.replace(/([^\,]+)(\,|$)/gi, function (a, b) {
                cityIds[b] = '1';
            })
            var subCity = [];
            var subCityNoRes = [];
            var data = HOTEL_POSITION[cityId]['subCity'] || [];
            for (var i = 0, l = data.length; i < l; i++) {
                var d = data[i];
                if (/D\d+_\d+/.test(d.id)) continue;
                if (!cityIds[d.id]) {
                    subCity.push('<a target="_blank" data-dopost="T" href="/hotel/' + d.py + d.id + '" title="' + d.display + '">' + d.display + '</a>');
                }
                subCityNoRes.push('<a target="_blank" data-dopost="T" href="/hotel/' + d.py + d.id + '" title="' + d.display + '">' + d.display + '</a>');
            }
            if (subCity.length) {
                document.getElementById('divRoundCity').innerHTML += subCity.join('');
            } else if (!hidCityIds) {
                document.getElementById('divSiderRoundCity').style.display = 'none';
            }
            var divNoresult = document.getElementById("divNoresult");
            if (divNoresult) {
                if (subCityNoRes.length) {
                    var tipstr = "<p id=\"pNoResultSubCity\">1. " + noResultMessageConfig[0] + " ";
                    tipstr += subCityNoRes.join(' ');
                    tipstr += "</p><p>2. " + noResultMessageConfig[1] + "</p>";
                    divNoresult.innerHTML += tipstr;
                } else {
                    divNoresult.innerHTML += "<p>" + noResultMessageConfig[1] + "</p>";
                }
            }
        }, 100);


    }
    function initComplete() {
        $('#delHuixuan').bind('click', function () {
            document.getElementById("HuiXuan").style.display = "none";
        })
        var gotop = document.getElementById('gotop');
        if (cQuery.browser.isIE6 && gotop) {
            gotop.style.position = 'absolute';
            $(window).bind('scroll', function () {
                gotop.style.top = (document.documentElement.scrollTop + document.documentElement.clientHeight / 2) + 'px';
            });
        }
        $("#banner").regMod("allyes", "1.0", {
            mod_allyes_user: "ctrip|CTRIP_HOTEL_HOMEPAGE|HOTEL_BANNER@ctrip|CTRIP_HOTEL_INNERPAGE|HOTEL_INNER_BANNER"
        });

    }
    function load() {
        initSearch();
        initMain();
        initSide();
        initComplete();
    }
    function invokeAll(fn) {
        all.each(function (ob) { if (ob[fn]) { ob[fn]() } });
    }
})();

//ok
function __SSO_submit(a, t) {
    var obj = document.getElementById(a);
    if (obj) {
        hotelDomesticConfig.hasLogin = true;
        var hotel,
            room,
            payment,
            BRev,
            Minstate,
            PromoteType,
            StartDate,
            DepDate,
            requestTravelMoney,
            useFG,
            ctmref;
        if (obj.dataset) {
            hotel = obj.dataset["hotel"];
            room = obj.dataset["room"];
            payment = obj.dataset["payment"];
            BRev = obj.dataset["brev"];
            Minstate = obj.dataset["minstate"];
            PromoteType = obj.dataset["promotetype"];
            StartDate = obj.dataset["startdate"];
            DepDate = obj.dataset["depdate"];
            requestTravelMoney = obj.dataset["requesttravelmoney"];
            useFG = obj.dataset["usefg"];
            ctmref = obj.dataset["ctmref"];
        } else {
            hotel = obj.getAttribute("data-hotel");
            room = obj.getAttribute("data-room");
            payment = obj.getAttribute("data-payment");
            BRev = obj.getAttribute("data-brev");
            Minstate = obj.getAttribute("data-minstate");
            PromoteType = obj.getAttribute("data-promotetype");
            StartDate = obj.getAttribute("data-startdate");
            DepDate = obj.getAttribute("data-depdate");
            requestTravelMoney = obj.getAttribute("data-requesttravelmoney");
            useFG = obj.getAttribute("data-usefg");
            ctmref = obj.getAttribute("data-ctmref");
        }
        window.HotelRoom.onOrderButtonClick(hotel, room, payment, BRev, Minstate, PromoteType, StartDate, DepDate, requestTravelMoney, useFG, obj, ctmref);
    }
}

