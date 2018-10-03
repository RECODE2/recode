#!/bin/sh

MYSQL_OPTIONS="-w -h ${MYSQL_HOST} -u root"

[ -z "${MYSQL_ROOT_PASSWORD}" ] || MYSQL_OPTIONS="${MYSQL_OPTIONS} --password=${MYSQL_ROOT_PASSWORD}"

mkdir -p "/home/recode"

if [ ! -e /home/recode/db.created ]; then
	sleep 30s
#	mysql ${MYSQL_OPTIONS} -e "CREATE USER '${MYSQL_USER}' IDENTIFIED BY '${MYSQL_PASSWORD}';" && \
#	mysql ${MYSQL_OPTIONS} -e "CREATE TABLE ${MYSQL_DATABASE};" && \
#	mysql ${MYSQL_OPTIONS} -e "GRANT ALL PRIVILEGES ON * . * TO ${MYSQL_USER};" &&
	mysql ${MYSQL_OPTIONS} "${MYSQL_DATABASE}" < /opt/recode/database/recode.sql && \
	touch /home/recode/db.created
fi

if [ -d /home/recode/persistent ]; then
    cd /home/recode/persistent
else
    cd /opt/recode
fi

sleep 10s
npm run start
