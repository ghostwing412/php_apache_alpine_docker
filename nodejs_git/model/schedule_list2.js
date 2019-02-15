/**
 *
 * Created by ghostwing412 on 2016/8/30.
 */
var events = require('events'),
    util = require('util'),
    log4js = require('log4js');
var helper = require('../Lib/myHelper.js');
var redisC = helper.model('redisC');
var schedule_main = require('node-schedule');
var spawn = require('child_process').spawn;

/**
 * 调度控制器
 * @param list_obj
 */
var scheduleCtrl = function (list_obj) {
    this.schedule_list = list_obj;
};
//继承观察者
util.inherits(scheduleCtrl, events);
//schedule_list 内变量，提供内部当前job，当前设定run监听、cancel监听、scheduled监听
var job,
    job_run = function () {
    },
    job_cancel = function () {
    },
    job_scheduled = function () {
    };
function _asyncScheduleMain(name) {
    //异步执行
    var temp = new main();
    temp.init(function (temp_job) {
        temp_job.on('start', function () {
            temp_job.schedule_list.remove(name);
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
        var free = spawn(cmd[0], cmd[1]);
        free.stdout.on('data', function (d) {
            log4js.getLogger('schedule').info("DAT INFO:" + d);
        });
        free.stderr.on('data', function (d) {
            log4js.getLogger('schedule').error("DAT ERR:" + d);
        });
        free.on('exit', function (c, s) {

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
    var key_chk = {"y": "year", "m": "month", "d": "date", "h": "hour", "i": "minute", "s": "second"};
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
 * 设置调度任务
 * @param name
 * @param setting
 * @param cmd
 */
scheduleCtrl.prototype.setSchedule = function (name, setting, cmd) {
    var _this = this;
    var rule = _scheduleRule(setting.date);
    // console.log(rule);
    if (!(cmd instanceof Array)) {
        this.emit('error', '提交参数错误');
        return;
    }

    job = _scheduleJob(name, rule, cmd);
    // console.log(job);
    if (job) {
        this.schedule_list.add(name, setting);
        job.on('scheduled', job_scheduled);
        job.on('run', job_run);
        job.on('canceled', job_cancel);
    } else {
        this.emit('error', '时间设置错误');
    }
};
scheduleCtrl.prototype.initList = function () {
    for (var name in this.schedule_list.list) {
        //TODO:CONTINUE_LOAD_LIST
        var schedule_item = this['schedule_list']['list'][name];
        if (schedule_item == 'addOnce') {
            job_run = function () {//一次性任务执行立即删除REDIS记录
                _asyncScheduleMain(name);
            }
        } else {

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
            this.emit('error', '过时任务');
        }
    }
};
/**
 * 移除任务
 * 移除REDIS记录以及调度列表
 * @param name
 */
scheduleCtrl.prototype.remove = function (name) {
    this.schedule_list.remove(name);
    var job = schedule_main.scheduledJobs[name];
    return schedule_main.cancelJob(job);
};
var main = function () {
};
main.prototype.init = function (done) {
    var list = new scheduleList();
    var job = new scheduleCtrl(list);
    done(job);
    job.emit('start');
};
module.exports = main;