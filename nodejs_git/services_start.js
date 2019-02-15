/**
 * Created by ghostwing412 on 2016/9/8.
 */
var Service = require('node-windows').Service;
var EventLogger = require('node-windows').EventLogger;
var path = require('path');
var service_config = {
    name: 'NodejsSchedule',
    description: 'The nodejs.org example web server.',
    script: path.join(__dirname, 'net.js'),
    wait: 2,
    grow: .5
};
// Create a new service object
var svc = new Service(service_config);

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});
// svc.on('invalidinstallation', function () {
//     var log = new EventLogger('NodejsSchedule');
//     log.error(service_config.script + " is not exists!");
// });
svc.on('error', function (err) {
    var log = new EventLogger('NodejsSchedule');
    log.error(err);
});
svc.install();