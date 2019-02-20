#!/usr/bin/env bash
act_type=$1

if [ ${act_type} == 'start' ]; then
docker-compose -f /Users/ghostwing412/Documents/webroot/web_server/docker-compose-fpm.yml up -d
elif [ ${act_type} == 'restart' ]; then
docker-compose -f /Users/ghostwing412/Documents/webroot/web_server/docker-compose-fpm.yml restart
elif [ ${act_type} == 'reload' ]; then
docker-compose -f /Users/ghostwing412/Documents/webroot/web_server/docker-compose-fpm.yml down
docker-compose -f /Users/ghostwing412/Documents/webroot/web_server/docker-compose-fpm.yml up -d
elif [ ${act_type} == 'stop' ]; then
docker-compose -f /Users/ghostwing412/Documents/webroot/web_server/docker-compose-fpm.yml down
fi
