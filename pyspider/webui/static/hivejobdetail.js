$(function () {

    reloadHiveJobItemHtml();

    setInterval(refreshHiveJobItemHtml, 1000);

    $('#tbody-hivejob').on('click','.btn-abort-job',function () {
       jobId=$(this).parent().parent().data('id');
       abortHiveJob(jobId);
    });

    $('#tbody-hivejob').on('click','.btn-delete-job',function () {
       jobId=$(this).parent().parent().data('id');
       deleteHiveJob(jobId);
    });

    $('#tbody-hivejob').on('click','.btn-view-job',function () {
       userName=$(this).parent().parent().find('td:nth-child(3)').html();
       tableName=$(this).parent().parent().find('td:nth-child(4)').html();
       $('.modal-body-table').html(userName+"_"+tableName);
       row=$(this).parent().parent();
       jobId=row.attr('data-id');
       $('.modal-body-record-count').html(row.attr('data-record-count')+' 条');
       $('.modal-body-record-size').html(row.attr('data-record-size')+' Bytes');

       getResultExample(jobId);

       $('#modal-publish-result').modal('show');
    });


    function getResultExample(jobId) {
        $('#tbody-result-example').children().remove();
        $("#pre-result-example").text("");
        var settings = {
          "async": true,
          "url": "getresultexample?job_id="+jobId,
          "dataType": "json",
          "method": "GET",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
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
        var settings = {
          "async": true,
          "url": "listhivejob",
          "dataType": "json",
          "method": "GET",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
          }
        };

        $.ajax(settings).done(function (response) {
            for (var i = 0; i < response.length; i++) {
                item=response[i];
                node=$('tr[data-id="'+item['JOB_ID']+'"]');
                // alert(node.find('td:nth-child(4)').find('.progress-bar').css('width'));
                node.attr('data-record-count',item['RECORD_COUNT']);
                node.attr('data-record-size',item['RECORD_SIZE']);
                node.find('td:nth-child(1)').html(item['JOB_TYPE']);
                node.find('td:nth-child(2)').html(item['JOB_DETAIL']);
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
                if(item['VIEW_ACTIVE']==''){
                    node.find('td:nth-child(7)').find('button:nth-child(1)').removeAttr('disabled');
                }else{
                    node.find('td:nth-child(7)').find('button:nth-child(1)').attr('disabled','disabled');
                }
                if(item['ABORT_ACTIVE']==''){
                    node.find('td:nth-child(7)').find('button:nth-child(2)').removeAttr('disabled');
                }else{
                    node.find('td:nth-child(7)').find('button:nth-child(2)').attr('disabled','disabled');
                }
                if(item['DELETE_ACTIVE']==''){
                    node.find('td:nth-child(7)').find('button:nth-child(3)').removeAttr('disabled');
                }else{
                    node.find('td:nth-child(7)').find('button:nth-child(3)').attr('disabled','disabled');
                }

            }

        });
    }

    function reloadHiveJobItemHtml() {
        var settings = {
          "async": true,
          "url": "listhivejob",
          "dataType": "json",
          "method": "GET",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
          }
        };

        $.ajax(settings).done(function (response) {
            $('#tbody-hivejob').children().remove();

            for (var i = 0; i < response.length; i++) {
                item=response[i];

                tpl = '<tr data-id="'+item['JOB_ID']+'" data-record-count="'+item['RECORD_COUNT']+'" data-record-size="'+item['RECORD_SIZE']+'">\n' +
        '                            <td>'+item['JOB_TYPE']+'</td>\n' +
        '                            <td></td>\n' +
        '                            <td >'+item['USER_NAME']+'</td>\n' +
        '                            <td>'+item['TABLE_NAME']+'</td>\n' +
        '                            <td width="30%">\n' +
        '                                <div class="progress progress-striped '+item['PROGRESS_ACTIVE']+'">\n' +
        '                                    <div class="progress-bar progress-bar-'+item['COLOR']+'" role="progressbar"\n' +
        '                                         aria-valuenow="'+item['RATE']+'" aria-valuemin="0" aria-valuemax="100"\n' +
        '                                         style="width: '+item['RATE']+'%;">\n' +
        '                                        '+item['REMARK']+'\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                            </td>\n' +
        '                            <td>'+item['JOB_TIME']+'</td>\n' +
        '                            <td>\n' +
        '                                <button type="button" class="btn btn-xs btn-default btn-view-job " '+item['VIEW_ACTIVE']+'>查看</button>\n' +
        '                                <button type="button" class="btn btn-xs btn-danger btn-abort-job " '+item['ABORT_ACTIVE']+'>终止</button>\n' +
        '                                <button type="button" class="btn btn-xs btn-danger btn-delete-job " '+item['DELETE_ACTIVE']+'>清理</button>\n' +
        '                            </td>\n' +
        '                        </tr>';

                $('#tbody-hivejob').append(tpl);
            }
        });
    }

});