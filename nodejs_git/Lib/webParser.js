/**
 * HTTP访问解析
 * @version 1.0.0
 * Created by ghostwing412 on 2016/9/10.
 */
var url = require('url');
var responce = function (res) {
    this._res = res;
};
responce.prototype.send = function (output) {
    this._res.end(output);
};
var request = function (req) {
    /**
     * 请求内容解析
     * @type {any}
     */
    var url_parse_data = url.parse(req.url, true);
    // console.log(url_parse_data);
    this.path_data = url_parse_data.serch;
    var link_info = url_parse_data.pathname.split('/');
    this.controller = link_info[1];
    this.method = link_info[2];
    this.request = url_parse_data.query;
    // this.path_data = url.parse(req.url, true);
};
module.exports.myResponce = responce;
module.exports.myRequest = request;
