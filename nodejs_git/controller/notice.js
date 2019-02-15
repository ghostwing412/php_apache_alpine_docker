/**
 * 提醒加入指定KEY新命令，获取并转化为定时任务
 * Created by ghostwing412 on 2016/8/26.
 */
var notice = {
    getKey:function () {
        var key = this.get('key');
        var _this = this;
        var redis_client = this.helper.model('redisC');
        // var redis_client = require('../model/redisC.js');
        redis_client.getName(key, function () {
            _this.send(this.data);
        });
    },
    setKey:function () {
        var _this = this;
        var key = this.get('key');
        var value = this.get('value');
        var redis_client = this.helper.model('redisC');
        redis_client.setName(key, value, function () {
            _this.send(this.data);
        });
    }
};
module.exports = notice;
