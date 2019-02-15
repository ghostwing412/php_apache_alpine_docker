var http = require('http');
var log4js = require('log4js');
log4js.configure('F:/xampp/htdocs/myProject1/nodejs/conf/log4j_config.json', {
    cwd: 'F:/xampp/htdocs/myProject1/nodejs/'
});
var myParser = require('./Lib/webParser');
// var schedule = require('node-schedule');
// var schedule_list = require('./model/schedule_list');
var router = require('./Lib/myRouter');
var server = http.createServer(function (req, res) {
    try {
        var main = new router(req, res);
        main.use('parser', myParser);
        main.run();
    } catch (err) {
        log4js.getLogger('error').fatal(err);
        res.end(JSON.stringify({status: 0, msg: 'ERROR!'}));
    }
});

server.listen(3000, '127.0.0.1');
