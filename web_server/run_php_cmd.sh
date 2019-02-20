#!/usr/bin/env bash
pro_type=$1
cmd=$2
root_dir='/usr/local/apache2/htdocs/'
pro_dir=''
process_result=''
function process_main(){
	process_result=`docker exec -it php_fpm /usr/local/bin/php ${pro_dir} ${cmd}`
}
function project_dir(){
	if [ ${pro_type} == 'caibow' ]; then
		pro_dir=${root_dir}myProject_appup/
	elif [ ${pro_type} == 'polocai' ]; then
		pro_dir=${root_dir}newpolocai/
	fi
	pro_dir=${pro_dir}cmd.php
}

project_dir
if [ ${pro_dir} == '' ]; then
	echo 'pro_type error'
else
	process_main
	echo $process_result
fi