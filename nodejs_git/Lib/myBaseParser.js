/**
 * 访问解析器
 * Created by ghostwing412 on 2016/9/10.
 */
var responce = function (res) {
    this._res = res;
};
responce.prototype.send = function (output) {
    //TODO:输出方法
};
/**
 * 请求数据处理
 * @param req
 */
var request = function (req) {
    this.path_data = '';//链接query
    this.controller = '';//控制器
    this.method = '';//方法
    this.request = {};//请求对象
};
module.exports.myResponce = responce;
module.exports.myRequest = request;