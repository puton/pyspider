# -*- coding: utf-8 -*-
import os

try:
    PROFILE = os.environ["SPD_PROFILE"]
except Exception,e:
    PROFILE = 'prod'

if PROFILE == 'dev':
    dacp_db = 'spdmgr/spdmgr_1Q#@oracle-datasource/pdb_spdmgr'
    redis_nodes =  [{'host':'192.168.136.130','port':7000},
                    {'host':'192.168.136.130','port':7001},
                    {'host':'192.168.136.130','port':7002},
                    {'host':'192.168.136.131','port':7000},
                    {'host':'192.168.136.131','port':7001},
                    {'host':'192.168.136.131','port':7002},
                    ]
    redis_expires = 30

elif PROFILE == 'vm':
    dacp_db = 'spdmgr/spdmgr_1Q#@oracle-datasource/pdb_spdmgr'
    redis_nodes = [{'host':'192.168.136.130','port':7000},
                    {'host':'192.168.136.130','port':7001},
                    {'host':'192.168.136.130','port':7002},
                    {'host':'192.168.136.131','port':7000},
                    {'host':'192.168.136.131','port':7001},
                    {'host':'192.168.136.131','port':7002},
                    ]
    redis_expires = 86400

elif PROFILE == 'test':
    dacp_db = 'pyspd_admin/pyspd_admin_1Q#@pdb_bdprd'
    redis_nodes =  [{'host':'20.26.25.224','port':7000},
                    {'host':'20.26.25.224','port':7001},
                    {'host':'20.26.25.224','port':7002},
                    {'host':'20.26.25.225','port':7000},
                    {'host':'20.26.25.225','port':7001},
                    {'host':'20.26.25.225','port':7002},
                    ]
    redis_expires = 86400

elif PROFILE == 'prod':
    dacp_db = 'spd_admin/spd_admin_1Q#@pdb_spider'
    redis_nodes =  [{'host':'10.78.155.61','port':16340},
                    {'host':'10.78.155.67','port':16340},
                    {'host':'10.78.155.68','port':16340},
                    {'host':'10.78.155.70','port':16340},
                    {'host':'10.78.155.71','port':16340},
                    {'host':'10.78.155.72','port':16340},
                    ]
    redis_expires = 86400
