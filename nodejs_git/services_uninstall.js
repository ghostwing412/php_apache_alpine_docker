/**
 * Created by ghostwing412 on 2016/9/8.
 */
var Service = require('node-windows').Service;
var path = require('path');
// Create a new service object
var svc = new Service({
    name:'NodejsSchedule',
    description: 'The nodejs.org example web server.',
    script: path.join(__dirname, 'net.js'),
    wait:2,
    grow:.5
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
    console.log('Uninstall complete.');
    console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();
