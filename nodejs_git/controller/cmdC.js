/**
 * Created by ghostwing412 on 2016/11/2.
 */
var spawn = require('child_process').spawn;
var log4js = require('log4js');

function _spawnHandle(cmd) {
    var free = spawn(cmd[0], cmd[1]);
    free.stdout.on('data', function (d) {
        log4js.getLogger('schedule').info("DAT INFO:" + d);
    });
    free.stderr.on('data', function (d) {
        log4js.getLogger('schedule').error("DAT ERR:" + d);
    });
    free.on('exit', function (c, s) {
        log4js.getLogger("schedule").info("cmd:" + cmd.toString() + ";exit");
    });
}
var cmdC = {
    active: function () {
        var cmd = this.get('cmd');
        if(cmd instanceof Array){
            _spawnHandle(cmd);
            this.success('OK!');
        }else{
            this.error("cmd is not instanceof Array!");
        }
    }
};
module.exports = cmdC;
