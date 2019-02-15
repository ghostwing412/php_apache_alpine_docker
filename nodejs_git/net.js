var net = require('net');
var helper = require('./Lib/myHelper');
var router = require('./Lib/myRouter');
var myConfig = require('./conf/config');
var current_dir = myConfig.config.root_dir;//process.cwd();
// var schedule_list = require('./model/schedule_list');
var log4js = require('log4js');
log4js.configure(current_dir + '/conf/log4j_config.json', {
    cwd: current_dir + '/'
});
var schedule_list = helper.model('schedule_key');
schedule_list.init(function (job) {
    job.on('start', function () {
        job.initList();
    });
    job.on('error', function (err) {
        log4js.getLogger('error').error('reload schedule list:' + err);
    });
});
var host = '0.0.0.0';
var port = 6969;
var socketParser = require('./Lib/socketParser');
net.createServer(function (sock) {
    // console.log('CONNECTED:' + sock.remoteAddress + ':' + sock.remotePort);
    sock.on('data', function (data) {
        try {
            var req = JSON.parse(data);
            var res = sock;
            //获取传入JSON对象，使用自定义分解执行对应控制方法
            var main = new router(req, res);
            main.use('parser', socketParser);
            main.run();
        } catch (error) {
            //TODO:LOG
            log4js.getLogger('error').fatal(error);
            sock.write(JSON.stringify({status: 0, msg: 'ERROR!'}));
        }
    });
    sock.on('close', function (data) {
        log4js.getLogger('record').info('CLOSED:' + sock.remoteAddress + '' + sock.remotePort);
    });
    sock.on('error', function (d) {
        log4js.getLogger('error').error("SOCK_ERR:" + d);
    });
}).on('error', function (err) {
    log4js.getLogger('error').fatal(err);
}).listen(port, host);
// process.on('')
