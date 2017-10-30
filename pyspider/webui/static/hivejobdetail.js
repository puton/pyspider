 var $_GET = (function(){
        var url = window.document.location.href.toString();
        var u = url.split("?");
        if(typeof(u[1]) == "string"){
            u = u[1].split("&");
            var get = {};
            for(var i in u){
                var j = u[i].split("=");
                get[j[0]] = j[1];
            }
            return get;
        } else {
            return {};
        }
    })();

$(function () {

    var loadingImg="<img src='static/img/loading.gif'/>";

    var currentTableName="";
    var currentUserName="";
    var currentJobType="";
    var currentStatus="";
    var currentDate="";
    var currentSort="";
    var currentParams;

    init();

    function init() {

        if($_GET['project']!=null){
            $("#currentTableName").val($_GET['project']);
        }

        reloadHiveJobItemHtml();
        setInterval(refreshHiveJobItemHtml, 1000);
        $('.form_date').datetimepicker({
        weekStart: 1,
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0
        }).on('changeDate', function(ev){
            reloadHiveJobItemHtml();
        });
    }

    function updateFilterParams() {
        currentJobType=$("#currentJobType").val();
        currentTableName=$("#currentTableName").val();
        currentUserName=$("#currentUserName").val();
        currentStatus=$("#currentStatus").val();
        currentDate=$("#currentDate").val();
        currentSort=$("#currentSort").val();
        currentParams = {
             "currentJobType": currentJobType,
             "currentTableName": currentTableName,
             "currentUserName": currentUserName,
             "currentStatus": currentStatus,
             "currentDate": currentDate,
             "currentSort": currentSort
          }
    }


    $('.form-control').on('input',function () {
        reloadHiveJobItemHtml();
    });

    $('.selectpicker').on('changed.bs.select',function () {
        reloadHiveJobItemHtml();
    });

    $('#tbody-hivejob').on('click','.btn-abort-job',function () {
       jobId=$(this).parent().parent().data('id');
       abortHiveJob(jobId);
    });

    $('#tbody-hivejob').on('click','.btn-delete-job',function () {
       jobId=$(this).parent().parent().data('id');
       deleteHiveJob(jobId);
    });

    $('#tbody-hivejob').on('click','.btn-view-job',function () {
       row=$(this).parent().parent();
       renderResultModal(row);
    });

    $('.btn-sort').on('click',function () {
        $('.btn-sort').removeClass('active');
        $(this).addClass('active');
        $('#currentSort').val($(this).val());
        reloadHiveJobItemHtml();
    });

    $('#clearFilter').on('click',function () {
       window.location.reload();
    });


    function comdify(n){
    　　var re=/\d{1,3}(?=(\d{3})+$)/g;
    　　var n1=n.replace(/^(\d+)((\.\d+)?)$/,function(s,s1,s2){return s1.replace(re,"$&,")+s2;});
    　　return n1;
    }

    function bytesToSize(bytes) {
        if (bytes === 0) return '0 B';
        var k = 1024, // or 1024
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }

    function getJobType(jobType) {
        if(jobType=='once'){
            return '即时';
        }else if(jobType=='cycle'){
            return '周期';
        }else {
            return '其他';
        }
    }

    function genJobDetail(jobDetailStr) {
        if(jobDetailStr!=null && jobDetailStr!=""){
            jobDetail=JSON.parse(jobDetailStr);
            monthStr=jobDetail.rule.substring(0,2);
            weekStrNum=jobDetail.rule.substring(2,4);
            switch (weekStrNum){
                case "00":
                    weekStr="一";
                    break;
                case "01":
                    weekStr="二";
                    break;
                case "02":
                    weekStr="三";
                    break;
                case "03":
                    weekStr="四";
                    break;
                case "04":
                    weekStr="五";
                    break;
                case "05":
                    weekStr="六";
                    break;
                case "06":
                    weekStr="日";
                    break;
                default :
                    weekStr="--";
                    break;
            }
            hourStr=jobDetail.rule.substring(4,6);
            if(jobDetail.frequency=="day"){
                return "每日"+hourStr+"点";
            }else if(jobDetail.frequency=="week"){
                return "每周"+weekStr+hourStr+"点";
            }else if(jobDetail.frequency=="month"){
                return "每月"+monthStr+"号"+hourStr+"点";
            }
        }else{
            return "";
        }
    }

    function renderResultModal(row) {
        jobId=row.attr('data-id');
        userName=row.find('td:nth-child(3)').html();
        tableName=row.find('td:nth-child(4)').html();
        hiveTableName=userName+"_"+tableName;

        $('.modal-body-table').html("");

        $('#tbody-result-example').children().remove();
        $("#pre-result-example").text("");
        var settings = {
          "async": true,
          "url": "getresultexample",
          "dataType": "json",
          "method": "GET",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
          },
          "data": {
             "job_id": jobId
          }
        };
        $.ajax(settings).done(function (response) {
            var inHtml="";
            for(var key in response){
                inHtml+="<tr>" +
                    "<td>"+key+"</td>" +
                    "<td>"+response[key]+"</td>" +
                    "</tr>";
            }
            $("#tbody-result-example").html(inHtml);
            $("#pre-result-example").text(JSON.stringify(response));


            inHtmlSql="select \n";

            for(var key in response){
                inHtmlSql+="get_json_object(result,'$."+key+"'), \n";
            }
            inHtmlSql=inHtmlSql.slice(0,-3)+" \n";
            inHtmlSql+= "from spider_hive_db."+hiveTableName+" a limit 10;";

            $('.modal-body-table-name').html(hiveTableName);
            $('.modal-body-table-sql').html(inHtmlSql);

            $('#modal-publish-result').modal('show');
        });

    }

    function abortHiveJob(jobId) {
        var settings = {
          "async": true,
          "url": "aborthivejob",
          "dataType": "json",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
          },
          "data": {
             "job_id": jobId
          }
        };
        $.ajax(settings).done(function (response) {
            if(response.status=='ok'){
                refreshHiveJobItemHtml();
            }
        });
    }

    function deleteHiveJob(jobId) {
        var settings = {
          "async": true,
          "url": "deletehivejob",
          "dataType": "json",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
          },
          "data": {
             "job_id": jobId
          }
        };
        $.ajax(settings).done(function (response) {
            if(response.status=='ok'){
                reloadHiveJobItemHtml();
            }
        });
    }

    function refreshHiveJobItemHtml() {
        updateFilterParams();
        var settings = {
          "async": true,
          "url": "listhivejob",
          "dataType": "json",
          "method": "GET",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
          },
          "data": currentParams
        };

        $.ajax(settings).done(function (response) {
            for (var i = 0; i < response.length; i++) {
                item=response[i];
                node=$('tr[data-id="'+item['JOB_ID']+'"]');
                // alert(node.find('td:nth-child(4)').find('.progress-bar').css('width'));
                node.find('td:nth-child(1)').html(getJobType(item['JOB_TYPE']));
                node.find('td:nth-child(2)').html(genJobDetail(item['JOB_DETAIL']));
                node.find('td:nth-child(3)').html(item['USER_NAME']);
                node.find('td:nth-child(4)').html(item['TABLE_NAME']);
                node.find('td:nth-child(5)').find('.progress-bar').css('width',item['RATE']+"%");
                node.find('td:nth-child(5)').find('.progress-bar').attr('aria-valuenow',item['RATE']);
                node.find('td:nth-child(5)').find('.progress-bar').html(item['REMARK']);
                node.find('td:nth-child(5)').find('.progress-bar').attr("class","progress-bar progress-bar-"+item['COLOR']);
                if(item['PROGRESS_ACTIVE']==''){
                    node.find('td:nth-child(5)').find('.progress-striped').removeClass('active');
                }else{
                    node.find('td:nth-child(5)').find('.progress-striped').addClass('active');
                }
                node.find('td:nth-child(6)').html(item['JOB_TIME']);
                node.find('td:nth-child(7)').html((item['RECORD_COUNT']>0 ? comdify(item['RECORD_COUNT']):loadingImg));
                node.find('td:nth-child(8)').html((item['RECORD_SIZE']>0 ? bytesToSize(item['RECORD_SIZE']):loadingImg));
                if(item['VIEW_ACTIVE']==''){
                    node.find('td:nth-child(9)').find('button:nth-child(1)').removeAttr('disabled');
                }else{
                    node.find('td:nth-child(9)').find('button:nth-child(1)').attr('disabled','disabled');
                }
                if(item['ABORT_ACTIVE']==''){
                    node.find('td:nth-child(9)').find('button:nth-child(2)').removeAttr('disabled');
                }else{
                    node.find('td:nth-child(9)').find('button:nth-child(2)').attr('disabled','disabled');
                }
                if(item['DELETE_ACTIVE']==''){
                    node.find('td:nth-child(9)').find('button:nth-child(3)').removeAttr('disabled');
                }else{
                    node.find('td:nth-child(9)').find('button:nth-child(3)').attr('disabled','disabled');
                }

            }

        });
    }

    function reloadHiveJobItemHtml() {
        updateFilterParams();
        var settings = {
          "async": true,
          "url": "listhivejob",
          "dataType": "json",
          "method": "GET",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
          },
          "data": currentParams
        };

        $.ajax(settings).done(function (response) {
            $('#tbody-hivejob').children().remove();

            for (var i = 0; i < response.length; i++) {
                item=response[i];

                tpl = '<tr data-id="'+item['JOB_ID']+'">\n' +
        '                            <td>'+getJobType(item['JOB_TYPE'])+'</td>\n' +
        '                            <td>'+genJobDetail(item['JOB_DETAIL'])+'</td>\n' +
        '                            <td >'+item['USER_NAME']+'</td>\n' +
        '                            <td>'+item['TABLE_NAME']+'</td>\n' +
        '                            <td width="20%">\n' +
        '                                <div class="progress progress-striped '+item['PROGRESS_ACTIVE']+'">\n' +
        '                                    <div class="progress-bar progress-bar-'+item['COLOR']+'" role="progressbar"\n' +
        '                                         aria-valuenow="'+item['RATE']+'" aria-valuemin="0" aria-valuemax="100"\n' +
        '                                         style="width: '+item['RATE']+'%;">\n' +
        '                                        '+item['REMARK']+'\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                            </td>\n' +
        '                            <td>'+item['JOB_TIME']+'</td>\n' +
        '                            <td>'+(item['RECORD_COUNT']>0 ? comdify(item['RECORD_COUNT']):loadingImg)+'</td>\n' +
        '                            <td>'+(item['RECORD_SIZE']>0 ? bytesToSize(item['RECORD_SIZE']):loadingImg)+'</td>\n' +
        '                            <td>\n' +
        '                                <button type="button" class="btn btn-xs btn-default btn-view-job " '+item['VIEW_ACTIVE']+'>查看</button>\n' +
        '                                <button type="button" class="btn btn-xs btn-danger btn-abort-job " style="display: none" '+item['ABORT_ACTIVE']+'>终止</button>\n' +
        '                                <button type="button" class="btn btn-xs btn-danger btn-delete-job " '+item['DELETE_ACTIVE']+'>清理</button>\n' +
        '                            </td>\n' +
        '                        </tr>';

                $('#tbody-hivejob').append(tpl);
            }
        });
    }

});