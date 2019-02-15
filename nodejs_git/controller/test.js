/**
 * Created by ghostwing412 on 2016/8/25.
 */
var log = require('log4js');
var common_obj = {
    sock: null,
    job_err: function (err) {
        common_obj.sock.send(err);
    },
    job_close: function () {
        common_obj.sock.send('OK');
    },
    set_job: function (job) {
        job.on('error', common_obj.job_err);
        job.on('close', common_obj.job_close);
    }
};
var ctrl = {
    run: function () {
        var _this = this;
        var name = this.get('name');
        var y = this.get('y');
        var m = this.get('m');
        var d = this.get('d');
        var h = this.get('h');
        var i = this.get('i');
        var s = this.get('s');
        var cmd = this.get('cmd');
        var file = this.get('file');
        var cmd1 = [file,cmd];
        var schedule = this.helper.model('schedule_list');
        // sock = this;
        schedule.init(function (job) {
            job.on('start', function () {
                job.addOnce(y, m, d, h, i, s, name, cmd1);
            });
            job.on('error', function (err) {
                _this.send(err);
            });
            job.on('close', function (info) {
                _this.send(info);
            });
        });
    },
    getJobs: function () {
        var job = require('node-schedule');
        log.getLogger('record').error(job);
        var jobs = job.scheduledJobs;
        this.send(JSON.stringify(jobs));
    },
    reloadJobs: function () {
        var schedule = this.helper.model('schedule_list');
        common_obj.sock = this;
        schedule.init(function (job) {
            job.on('start', function () {
                job.initList();
            });
            common_obj.set_job(job);
        });
    },
    remove: function () {
        var name = this.get('name');
        var schedule = this.helper.model('schedule_list');
        schedule.init(function (job) {
            job.on('start', function () {
                var res = job.remove(name);
                log.getLogger('record').error(res);
            });
            job.on('error', function (err) {
                _this.send(err);
            });
            job.on('close', function () {
                _this.send('ok!');
            });
        });
    }
};
module.exports = ctrl;