/**
 * 工具对象
 * Created by ghostwing412 on 2016/8/27.
 */
var myHelper = {};
myHelper.model = function (name, ops) {
    var mod = require('../model/' + name + '.js');
    return new mod(ops);
};
module.exports = myHelper;