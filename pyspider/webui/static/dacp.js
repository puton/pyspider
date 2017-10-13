$(function () {

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
             "table_name":current_table_name
          }
        }

        $.ajax(settings).done(function (response) {
            if(response.status=='ok'){
                $('#modal-publish-once').modal('hide');
                $('.msgbox-dacp').fadeIn(3000);
                $('.msgbox-dacp').fadeOut(5000);
            }
        });

    })
});