var log = require('log4js');
/**
 * 调度控制器
 * Created by ghostwing412 on 2016/9/1.
 */
var common_obj = {
    sock: null,
    job_err: function (err) {
        log.getLogger('schedule').info(err);
        common_obj.sock.error(err);
    },
    job_close: function () {
        common_obj.sock.success('OK!');
    },
    set_job: function (job) {
        job.on('error', common_obj.job_err);
        job.on('close', common_obj.job_close);
    }
};
var scheduleC = {
    /**
     * 添加一次性任务
     * @requires name String 任务标识
     * @requires y Int 年份
     * @requires m Int 月份 0-11
     * @requires d Int 日期 1-31
     * @requires h Int 小时 1-24
     * @requires i Int 分钟 1-60
     * @requires s Int 秒 1-60
     * @requires cmd Array 命令数组
     */
    addOnce: function () {
        common_obj.sock = this;
        var _this = this;
        var name = this.get('name');
        var y = this.get('y');
        var m = this.get('m');
        var d = this.get('d');
        var h = this.get('h');
        var i = this.get('i');
        var s = this.get('s');
        var cmd = this.get('cmd');
        var schedule = this.helper.model('schedule_key');
        schedule.init(function (job) {
            job.on('start', function () {
                job.addOnce(y, m, d, h, i, s, name, cmd);
            });
            common_obj.set_job(job);
        });
    },
    addLoop: function () {
        common_obj.sock = this;
        var name = this.get('name');
        var date = this.get('date');
        var cmd = this.get('cmd');
        // console.log(name, date, cmd);return;
        var schedule = this.helper.model('schedule_key');
        schedule.init(function (job) {
            job.on('start', function () {
                job.addLoop(date, name, cmd);
            });
            common_obj.set_job(job);
        });
    },
    remove: function () {
        common_obj.sock = this;
        var name = this.get('name');
        var schedule = this.helper.model('schedule_key');
        schedule.init(function (job) {
            job.on('start', function () {
                job.remove(name);
            });
            common_obj.set_job(job);
        });
    },
    getJobs: function () {
        var name = this.get('name');
        var schedule = require('node-schedule');
        var jobs = schedule.scheduledJobs;
        if (jobs) {
            if (name) {
                if (name in jobs) {
                    this.success('OK!', jobs[name]);
                } else {
                    this.error(name + ' is not exists!');
                }
            } else {
                this.success('OK!', jobs);
            }
        } else {
            this.error('Jobs Empty!');
        }
        // this.success('OK!', jobs);
        // for(var key in jobs){
        //     if()
        // }
    }
};
module.exports = scheduleC;
