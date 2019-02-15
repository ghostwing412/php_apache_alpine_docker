var myConfig = require('./conf/config');
var helper = require("./Lib/myHelper.js");
var schedule = require('node-schedule');
var redisC = helper.model('redisC');
var redisC_config = {};
if (typeof myConfig.config.redis_db !== "undefined"){
    redisC_config.db = myConfig.config.redis_db;
}
if(typeof myConfig.config.redis_host !== "undefined"){
    redisC_config.host = myConfig.config.redis_host;
}
// redisC.config({
// //     db: myConfig.config.redis_db
// // });
//redisC.config(redisC_config);
//redisC.setName('aa', 'bb', function(e,r){
//console.log(e, r);
//});
console.log(schedule.scheduledJobs);
