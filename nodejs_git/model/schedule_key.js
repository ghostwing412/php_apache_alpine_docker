/**
 * Created by ghostwing412 on 2016/10/18.
 */
var events = require('events'),
    util = require('util'),
    log4js = require('log4js'),
    myConfig = require('../conf/config');
var helper = require('../Lib/myHelper.js');
var redisC = helper.model('redisC');
var schedule_main = require('node-schedule');
var spawn = require('child_process').spawn;
var redisC_config = {};
if(typeof myConfig.config.redis_db !== 'undefined'){
	redisC_config.db = myConfig.config.redis_db;
}
if(typeof myConfig.config.redis_host !== 'undefined'){
	redisC_config.host = myConfig.config.redis_host;
}
redisC.config(redisC_config);
// var _next_list = [];
var _next = function (job) {
    redisC.dismiss();
    job.emit('close');
    // if (_next_list.length > 0) {
    //     for (var i = 0; i < _next_list.length; i++) {
    //         if (typeof _next_list[i] == 'function') {
    //             _next_list[i].call(job);
    //         }
    //     }
    // }
};
var _hfDbName = function (name) {
    return 'HF_' + name;
};
/**
 * 调度控制器
 * @param redis_obj
 */
var scheduleCtrl = function (redis_obj) {
    this.redis = redis_obj;
};//继承观察者
util.inherits(scheduleCtrl, events);
//schedule_list 内变量，提供内部当前job，当前设定run监听、cancel监听、scheduled监听
var job,
    job_run = function () {
    },
    job_cancel = function () {
    },
    job_scheduled = function () {
    };
/**
 * 异步执行主函数
 * @param name 任务名称
 * @private
 */
function _asyncScheduleMain(name) {
    //异步执行
    var temp = new main();
    temp.init(function (temp_job) {
        temp_job.on('start', function () {
            temp_job.remove(name);
        });
        temp_job.on('error', function (err) {
            //TODO:LOG
            log4js.getLogger('schedule').error(err);
        })
    });
}
function _scheduleRule(date) {
    var rule = new schedule_main.RecurrenceRule();
    // rule.recurs = false;
    for (var key in date) {
        // console.log(typeof parseInt(date[key]));
        rule[key] = date[key];
    }
    return rule;
}
/**
 * 任务设置
 * @param name
 * @param rule
 * @param cmd Array [任务执行主体 执行参数]
 * @returns {*}
 * @private
 */
function _scheduleJob(name, rule, cmd) {
    return schedule_main.scheduleJob(name, rule, function () {
        // console.log(123);
        log4js.getLogger("schedule").info("name:" + name + "cmd:" + cmd[0] + ";start");
        var free = spawn(cmd[0], cmd[1]);
        free.stdout.on('data', function (d) {
            log4js.getLogger('schedule').info("DAT INFO:" + d);
        });
        free.stderr.on('data', function (d) {
            log4js.getLogger('schedule').error("DAT ERR:" + d);
        });
        free.on('exit', function (c, s) {
            log4js.getLogger("schedule").info("name:" + name + "cmd:" + cmd[0] + ";exit");
        });
        //TODO:ACTION CMD
    });
}

/**
 * 添加一次性任务
 * @param y
 * @param m
 * @param d
 * @param h
 * @param i
 * @param s
 * @param name
 * @param cmd
 */
scheduleCtrl.prototype.addOnce = function (y, m, d, h, i, s, name, cmd) {
    // var name = uuid.v1();
    // var _this = this;
    var setting = {
        date: {},
        type: 'addOnce',
        cmd: cmd
    };
    setting.date = {
        // recurs: false,
        year: parseInt(y),
        month: parseInt(m),
        date: parseInt(d),
        hour: parseInt(h),
        minute: parseInt(i),
        second: parseInt(s)
    };
    // var time = new Date(setting.date.year + '-' + (setting.date.month + 1) + '-' + setting.date.date + ' ' + setting.date.hour + ':' + setting.date.minute + ':' + setting.date.second);
    // var set_expireat = function () {
    //     console.log(time);
    //     console.log(time.getTime());
    //     this.redis.actCommand('pexpireat', name, (time.getTime() + 20));
    // };
    // _next_list.push(set_expireat);
    job_run = function () {
        //异步执行
        _asyncScheduleMain(name);
        log4js.getLogger('schedule').info("【" + name + "】run once!");
    };
    job_cancel = function (date) {
        log4js.getLogger('schedule').info("CANCEL JOB 【" + name + "】");
        _asyncScheduleMain(name);
    };

    this.setSchedule(name, setting, cmd);
};

scheduleCtrl.prototype.addLoop = function (date, name, cmd) {
    var setting = {
        date: {},
        type: 'addLoop',
        cmd: cmd
    };
    var key_chk = {"y": "year", "m": "month", "d": "date", "h": "hour", "i": "minute", "s": "second", "w": "dayOfWeek"};
    for (var i in key_chk) {
        if (i in date) {
            var temp = date[i];
            if (temp instanceof Array) {
                temp.sort();
            }
            setting['date'][key_chk[i]] = temp;
        }
    }
    // console.log(setting);return;
    job_scheduled = function (date) {
        log4js.getLogger('schedule').info("【" + name + "】scheduled " + date.toString());
    };
    job_run = function () {
        log4js.getLogger('schedule').info("【" + name + "】run loop!");
    };
    job_cancel = function (date) {
        log4js.getLogger('schedule').info("CANCEL JOB 【" + name + "】");
        _asyncScheduleMain(name);
    };
    this.setSchedule(name, setting, cmd);
};
/**
 * 移除任务
 * 移除REDIS记录以及调度列表
 * @param name
 */
scheduleCtrl.prototype.remove = function (name) {
    var _this = this;
    this.redis.delName(_hfDbName(name), function (e, r) {
        _next(_this);
    });
    var job = schedule_main.scheduledJobs[name];
    return schedule_main.cancelJob(job);
};
/**
 * 设置调度任务
 * @param name
 * @param setting
 * @param cmd
 */
scheduleCtrl.prototype.setSchedule = function (name, setting, cmd) {
    var _this = this;
    var rule = _scheduleRule(setting.date);
    if (!(cmd instanceof Array)) {
        this.emit('error', '提交参数错误');
        return;
    }
    var job_now = schedule_main.scheduledJobs[name];
    if (typeof job_now != 'undefined') {
        schedule_main.cancelJob(job_now);
    }
    job = _scheduleJob(name, rule, cmd);
    if (job) {
        this.redis.setName(_hfDbName(name), setting, function (e, r) {
            _next(_this);
        });
        job.on('scheduled', job_scheduled);
        job.on('run', job_run);
        job.on('canceled', job_cancel);
    } else {
        this.emit('error', '时间设置错误');
    }
};
/**
 * 导入redis任务列表
 */
scheduleCtrl.prototype.initList = function () {
    var redis = this.redis;
    var _this = this;
    this.redis.keys('HF_*', function (e, r) {
        if (r instanceof Array && r.length > 0) {
            var i = 0;
            for (; i < r.length; i++) {
                var db_name = r[i];
                redis.getName(db_name, function (e, r) {
                    var name = this.name.substring(3);
                    var schedule_item = this.data;
                    if (schedule_item.type == 'addOnce') {
                        job_run = function () {
                            _asyncScheduleMain(name);
                            log4js.getLogger('schedule').info("【" + name + "】run once!");
                        }
                    }
                    job_cancel = function (date) {
                        log4js.getLogger('schedule').info("CANCEL JOB 【" + name + "】");
                        _asyncScheduleMain(name);
                    };
                    var rule = _scheduleRule(schedule_item.date);
                    job = _scheduleJob(name, rule, schedule_item.cmd);
                    if (job) {
                        job.on('scheduled', job_scheduled);
                        job.on('run', job_run);
                        job.on('canceled', job_cancel);
                    } else {
                        //TODO:重载可能出现超时任务，需要具体如何处理
                        log4js.getLogger('schedule').error("【" + name + "】OUT TIME!");
                        _this.emit('error', '过时任务');
                    }
                });
            }
        }
    });
};
var main = function () {

};
main.prototype.init = function (done) {
    var job = new scheduleCtrl(redisC);
    done(job);
    job.emit('start');
};
module.exports = main;
