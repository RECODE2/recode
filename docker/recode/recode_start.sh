#!/bin/sh

if [ ! -e /home/recode/db.created ]; then
	mariadb -w -h recode_db -u root -e "CREATE DATABASE vit"
	mariadb -w -h recode_db -u root vit < /opt/recode/database/recode.sql
	touch /home/recode/db.created
fi

if [ -d /home/recode/persistent ]; then
    cd /home/recode/persistent
else
    cd /opt/recode
fi

npm run start
