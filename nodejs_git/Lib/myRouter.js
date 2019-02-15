var log4js = require('log4js');
// var url = require('url');
// var querystring = require('querystring');
/**
 * 路由解析
 * @private
 */
var my_helper = require('./myHelper');
var _middle = {};
var my_router = function (req, res) {
    // console.log(req, res);
    this._res = res;//SOCK对象
    this._req = req;//request对象
    this._path_data = null;
    this._ops = {
        controller: '',
        method: ''
    };
    this.helper = my_helper;
    this._request = null;
    // _init.call(this);
    // console.log(this._ops);
};
/**
 * 初始化
 * @param req
 * @param res
 * @private
 */
function _init() {
    // this._req = req;
    this._request = {};
    // this._res = res;
    // this.use('parser').parse.call(this);
    _parse.call(this);
}
/**
 * 分解出访问控制器、方法、参数
 * @param request 访问对象
 * @private
 */
function _parse() {
    // console.trace(request);
    var parser = this.use('parser').myRequest;
    var parser_obj = new parser(this._req);
    //获取链接数据
    this._path_data = parser_obj.path_data;
    // this._path_data = url.parse(this._req.url, true);
    // var pathname = path.pathname;
    // console.log(this._path_data);
    // var link_info = this._path_data.pathname.split('/');
    // this._ops = this.use('parser').getCM(this.req);
    this._ops.controller = parser_obj.controller;//link_info[1];
    this._ops.method = parser_obj.method;//link_info[2];
    // console.log(url.urld);
    this._request = parser_obj.request;//this._path_data.query;
    // console.log(this._request);
}
function log(msg, level) {
    if (level == 'ERROR') {
        log4js.getLogger('error').error(msg);
    } else if (level == 'INFO') {
        log4js.getLogger('record').info(msg);
    } else if (level == 'ACCESS') {
        log4js.getLogger('access').info(msg);
    }
}
/**
 * 服务端主运行方法
 */
my_router.prototype.run = function () {
    // console.log(this._ops);
    _init.call(this);
    var ctrl = require('../controller/' + this._ops.controller);
    var link = this._ops.controller + "/" + this._ops.method;
    // console.log(this._request);
    if (this._ops.method in ctrl) {
        log("LINK:" + link + " DATA:" + this._path_data + " 200", 'ACCESS');
        ctrl[this._ops.method].call(this);
    } else {
        log("LINK:" + link + " DATA:" + this._path_data + '404', "ACCESS");
        this.error("method " + this._ops.method + " not exists!");
    }
};


/**
 * 输出函数
 * sock访问必须打印返回，否则会持续保持连接活动状态
 * @param data
 */
my_router.prototype.send = function send(data) {
    var output = '';
    // console.log(data);
    if (typeof data == 'object') {
        output = JSON.stringify(data);
    } else {
        output = data;
    }
    //中间件返回数据
    var responce = this.use('parser').myResponce;
    var responce_obj = new responce(this._res);
    responce_obj.send(output);
    // this._res.writeHead();
    // this._res.end(output);
};
my_router.prototype.success = function (msg, data) {
    var temp = {
        status: 1,
        msg: msg
    };
    if (data != undefined) {
        temp.data = data;
    }
    this.send(temp);
};
/**
 * 错误处理
 * @param info
 */
my_router.prototype.error = function error(info) {
    var temp = {
        status: 0,
        msg: info
    };
    this.send(temp);
};
my_router.prototype.get = function _get(key) {
    return this['_request'][key];
};
//加入中间件
my_router.prototype.use = function (name, obj) {
    if (obj != undefined) {
        _middle[name] = obj;
    } else if (name in _middle) {
        return _middle[name];
    } else {
        return null;
    }
};
module.exports = my_router;