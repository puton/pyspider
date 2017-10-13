#!/usr/bin/env python
# -*- encoding: utf-8 -*-
# vim: set et sw=4 ts=4 sts=4 ff=unix fenc=utf8:
# Author: Binux<i@binux.me>
#         http://binux.me
# Created on 2014-10-19 16:23:55

from __future__ import unicode_literals

import json

import cx_Oracle
import time
from flask import render_template, request
from flask.ext import login

from pyspider.settings import dacp_db
from .app import app


@app.route('/listhivejob',methods=['GET'])
def listhivejob():
    jobs=list()
    db_conn = cx_Oracle.connect(dacp_db)
    cursor = db_conn.cursor()
    sql = "SELECT * FROM DACP_JOB ORDER BY JOB_TIME DESC"
    cursor.execute(sql)
    result = cursor.fetchall()
    for row in result:
        job=dict()
        job['JOB_ID']=row[0]
        job['JOB_TYPE']=row[1]
        job['JOB_DETAIL']=row[2]
        job['USER_NAME']=row[3]
        job['TABLE_NAME']=row[4]
        job['STATUS']=row[5]
        if job['STATUS'] in ['waiting','oracle2local','local2hive']:
            # blue - waiting,oracle2local,local2hive
            job['COLOR']='default'
            job['PROGRESS_ACTIVE']='active'
            job['VIEW_ACTIVE'] = 'disabled = "disabled"'
            job['ABORT_ACTIVE'] = ''
            job['DELETE_ACTIVE'] = 'disabled = "disabled"'
        elif job['STATUS'] in ['done']:
            # green - done
            job['COLOR'] = 'success'
            job['PROGRESS_ACTIVE'] = ''
            job['VIEW_ACTIVE'] = ''
            job['ABORT_ACTIVE'] = 'disabled = "disabled"'
            job['DELETE_ACTIVE'] = ''
        elif job['STATUS'] in ['error']:
            # red - error
            job['COLOR'] = 'danger'
            job['PROGRESS_ACTIVE'] = ''
            job['VIEW_ACTIVE'] = 'disabled = "disabled"'
            job['ABORT_ACTIVE'] = 'disabled = "disabled"'
            job['DELETE_ACTIVE'] = ''
        elif job['STATUS'] in ['abort']:
            # yellow - abort
            job['COLOR'] = 'warning'
            job['PROGRESS_ACTIVE'] = ''
            job['VIEW_ACTIVE'] = 'disabled = "disabled"'
            job['ABORT_ACTIVE'] = 'disabled = "disabled"'
            job['DELETE_ACTIVE'] = ''
        else:
            job['COLOR'] = 'warning'
            job['PROGRESS_ACTIVE'] = ''
            job['VIEW_ACTIVE'] = ''
            job['ABORT_ACTIVE'] = ''
            job['DELETE_ACTIVE'] = ''
        job['RATE'] = row[6]
        job['REMARK']=row[7].decode('gbk')
        job['JOB_TIME']=str(row[8])
        jobs.append(job)
    cursor.close()
    db_conn.commit()
    db_conn.close()

    return json.dumps(jobs, ensure_ascii=False)

@app.route('/addhivejob', methods=['POST'])
def addhivejob():
    current_user = login.current_user.get_id()
    job_type = request.values.get('job_type')
    table_name = request.values.get('table_name')

    db_conn = cx_Oracle.connect(dacp_db)

    job_id = 'JOB'+str(int(round(time.time() * 1000)))

    cursor = db_conn.cursor()
    sql = "INSERT INTO DACP_JOB(" \
          "JOB_ID," \
          "JOB_TYPE," \
          "JOB_DETAIL," \
          "USER_NAME," \
          "TABLE_NAME," \
          "STATUS," \
          "RATE," \
          "REMARK," \
          "JOB_TIME) " \
          "VALUES(" \
          "'"+job_id+"'," \
          "'"+job_type+"'," \
          "''," \
          "'"+current_user+"'," \
          "'"+table_name+"'," \
          "'waiting'," \
          "'10'," \
          "'等待'," \
          "SYSDATE)"
    cursor.execute(sql)
    cursor.close()
    db_conn.commit()
    db_conn.close()
    result = dict()
    result['status']='ok'
    return json.dumps(result)

@app.route('/aborthivejob', methods=['POST'])
def aborthivejob():
    job_id = request.values.get('job_id')
    db_conn = cx_Oracle.connect(dacp_db)
    cursor = db_conn.cursor()
    sql = "UPDATE DACP_JOB SET " \
          "STATUS='abort' " \
          ",RATE='100' " \
          ",REMARK='主动放弃任务' " \
          ",JOB_TIME=SYSDATE " \
          "WHERE JOB_ID='"+job_id+"'"
    cursor.execute(sql)
    cursor.close()
    db_conn.commit()
    db_conn.close()
    result = dict()
    result['status']='ok'
    return json.dumps(result)


@app.route('/deletehivejob', methods=['POST'])
def deletehivejob():
    job_id = request.values.get('job_id')
    db_conn = cx_Oracle.connect(dacp_db)
    cursor = db_conn.cursor()
    sql = "DELETE FROM DACP_JOB " \
          "WHERE JOB_ID='"+job_id+"'"
    cursor.execute(sql)
    cursor.close()
    db_conn.commit()
    db_conn.close()
    result = dict()
    result['status']='ok'
    return json.dumps(result)

@app.route('/hivejobdetail')
def hivejobdetail():
    current_user = login.current_user.get_id()

    return render_template(
        "hivejobdetail.html",
        current_user=current_user
    )

