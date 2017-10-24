$(function () {

    $("#frequency").on("changed.bs.select",function () {
        if($("#frequency").val()=="day"){
            $("#weekStr").selectpicker('val', '--');
            $("#monthStr").selectpicker('val', '--');
            $(".monthArea").hide();
            $(".weekArea").hide();
        }
        else if($("#frequency").val()=="week"){
            $("#monthStr").selectpicker('val', '--');
            $("#weekStr").selectpicker('val', '00');
            $(".monthArea").hide();
            $(".weekArea").show();
        }
        else if($("#frequency").val()=="month"){
            $("#monthStr").selectpicker('val', '01');
            $("#weekStr").selectpicker('val', '--');
            $(".weekArea").hide();
            $(".monthArea").show();
        }
    });


    $("#modal-publish-once").on('click','#btn-publish-once',function(){
        var settings = {
          "async": true,
          "url": "addhivejob",
          "dataType": "json",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
          },
          "data": {
              "job_type": "once",
              "table_name":current_table_name,
              "job_detail":""
          }
        };

        $.ajax(settings).done(function (response) {
            if(response.status=='ok'){
                $('#modal-publish-once').modal('hide');
                $('.msgbox-dacp').fadeIn(3000);
                $('.msgbox-dacp').fadeOut(5000);
            }
        });
    });

    $("#modal-publish-cycle").on('click','#btn-publish-cycle',function(){
        var job_detail={};
        job_detail.frequency=$("#frequency").val();
        job_detail.rule=$("#monthStr").val()+$("#weekStr").val()+$("#hourStr").val();
        job_detail.last="";
        var settings = {
          "async": true,
          "url": "addhivejob",
          "dataType": "json",
          "method": "POST",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
          },
          "data": {
              "job_type": "cycle",
              "table_name":current_table_name,
              "job_detail":JSON.stringify(job_detail)
          }
        };

        $.ajax(settings).done(function (response) {
            if(response.status=='ok'){
                $('#modal-publish-cycle').modal('hide');
                $('.msgbox-dacp').fadeIn(3000);
                $('.msgbox-dacp').fadeOut(5000);
            }
        });
    });
});