#!/bin/sh

if [ ! -e /home/recode/db.created ]; then
	mariadb -h recode_db -u root -e "CREATE DATABASE vit"
	mariadb -h recode_db -u root vit < /opt/recode/database/recode.sql
	touch /home/recode/db.created
fi

cd /opt/recode
npm run start
