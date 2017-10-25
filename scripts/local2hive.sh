#!/bin/sh

# exp. sh /home/spd/spider_hive/local2hive.sh result_prod2_anjuke_info

if [ $# != 1 ] ; then
  echo "USAGE: $0 HIVE_TABLE_NAME"
  exit 1;
fi

HIVE_TABLE_NAME=$1

source /home/spd/login.sh

sql_ddl="
CREATE TABLE IF NOT EXISTS spider_hive_db.${HIVE_TABLE_NAME} ( RESULT STRING )
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '|'
LINES TERMINATED BY '\n'
STORED AS TEXTFILE;
"

beeline -e "${sql_ddl}"

echo "[success] hive table created : ${HIVE_TABLE_NAME}"

hadoop fs -put /data/hive/${HIVE_TABLE_NAME} /jc_spider/spider_hive_db/${HIVE_TABLE_NAME}/

echo "[success] hive file imported : ${HIVE_TABLE_NAME}"