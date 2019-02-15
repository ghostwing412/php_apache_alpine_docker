/**
 * Created by ghostwing412 on 2016/8/26.
 */
var redis = require('redis');
var _options = {};
var redis_client;
function _mergeOps(ops) {
    if (typeof ops == 'object') {
        for (var key in _options) {
            if (key in ops) {
                _options[key] = ops[key];
            }
        }
    }
}
function _client() {
    if (redis_client == undefined) {
        redis_client = redis.createClient(_options.port, _options.host, _options);
        redis_client.on('error', function (err) {
            //TODO:LOG
            _dismiss();
            throw new Error(err);
        });
        redis_client.on('close', function (d) {

        });
    }
}
function _dismiss() {//关闭链接，清楚客户端变量
    if (redis_client != undefined && redis_client.connected) {
        redis_client.quit();
        redis_client = undefined;
    }
}
/**
 * 获取指定DB数据
 * @param db
 * @param name
 * @param callback
 * @private
 */
// function _getName(name, callback) {
//     var _this = this;
//     redis_client.get(name, function (err, reply) {
//         _this.data = _fmt(reply);
//         callback.call(_this);
//     });
// }
/**
 * 设置指定DB数据
 * @param db
 * @param name
 * @param value
 * @param callback
 * @private
 */
// function _setName(name, value, callback) {
//     var _this = this;
//     redis_client.set(name, JSON.stringify(value), function (err, reply) {
//         callback.call(_this);
//     });
// }
/**
 * 删除指定key
 * @param name
 * @param callback
 * @private
 */
// function _delName(name, callback) {
//     var _this = this;
//     redis_client.del(name, function (err, reply) {
//         callback.call(_this, e, r);
//     });
// }

function _cmd(cmd, name, callback) {
    var _this = this;
    redis_client[cmd](name, function (err, reply) {
        _this.name = name;
        if (typeof callback == 'function') {
            callback.call(_this, err, reply);
        }
    });
}
function _cmdWithVal(cmd, name, value, callback) {
    var _this = this;
    redis_client[cmd](name, value, function (err, reply) {
        _this.name = name;
        if (typeof callback == 'function') {
            callback.call(_this, err, reply);
        }
    });
}
/**
 * 数据格式化
 * @param data
 * @private
 */
function _fmt(data) {
    return JSON.parse(data);
}
/**
 * 主函数，只负责实例化
 */
var redisC = function () {
    this.data = {};
    this.name = '';//操作中获取名称
    _options = {
        host: '127.0.0.1',
        port: '6379',
        db: '1'
    };
    // _mergeOps(ops);
};
redisC.prototype.config = function (ops) {
    _mergeOps(ops);
};
/**
 * 获取指定KEY
 * 每次获取链接一次，完成就关闭链接
 * @param name
 * @param callback 回调方法
 *
 * @public
 */
redisC.prototype.getName = function (name, callback) {
    if (arguments.length > 2) {
        callback = arguments[2];
        _mergeOps(arguments[1]);
    }
    _client();
    _cmd.call(this, 'get', name, function (e, r) {
        this.data = _fmt(r);
        if (typeof callback == 'function') {
            callback.call(this, e, r);
        }
    });
};
redisC.prototype.setName = function (name, value, callback) {
    if (arguments.length > 3) {
        callback = arguments[3];
        _mergeOps(arguments[2]);
    }
    _client();
    _cmdWithVal.call(this, 'set', name, JSON.stringify(value), callback);
};
redisC.prototype.delName = function (name, callback) {
    if (arguments.length > 2) {
        callback = arguments[2];
        _mergeOps(arguments[1]);
    }
    _client();
    _cmd.call(this, 'del', name, callback);
};
redisC.prototype.keys = function (name_preg, callback) {
    if (arguments.length > 2) {
        callback = arguments[2];
        _mergeOps(arguments[1]);
    }
    _client();
    _cmd.call(this, 'keys', name_preg, callback);
};
redisC.prototype.dismiss = function () {
    _dismiss();
};
module.exports = redisC;