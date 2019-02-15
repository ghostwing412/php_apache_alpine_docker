/**
 * SOCKET解析器
 * Created by ghostwing412 on 2016/9/10.
 */
var responce = function (res) {
    this._res = res;
};
responce.prototype.send = function (output) {
    this._res.write(output);
};
var request = function (req) {
    // console.log(req);
    /**
     * 请求内容解析
     * @type {any}
     */
    this.controller = req.controller;
    this.method = req.method;
    var path_data = [];
    var request = {};
    for (var key in req) {
        if (key != 'controller' || key != 'method') {
            path_data.push(key + "=" + req[key]);
            request[key] = req[key];
        }
    }
    this.path_data = path_data.join('&');
    this.request = request;
};
module.exports.myResponce = responce;
module.exports.myRequest = request;