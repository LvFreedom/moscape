/**
 * Created by Arterli on 2016/10/10.
 */
$(function () {
    // if($("#detail").length>0){
    //     //载入编辑器
    //     var editor = new wangEditor('detail');
    //     // 上传图片
    //     editor.config.uploadImgUrl = '/uc/file/uploadpic/type/path';
    //     editor.config.uploadImgFileName = 'file';
    //     editor.create();
    //     if(($("#detail").html()).length==0){
    //         editor.clear();
    //     }
    // }

    //tags
    $('#keywords').tagsInput({
        autocomplete_url:'/admin/public/getkeyword',
        autocomplete:{selectFirst:true,autoFill:true},
        width:'auto',
        height:'43px',
        defaultText:'add a tag',
    });
    //下啦组件改造
    var question_select = $(".question_select");
     var ul = $(".question_select .dropdown-menu")
    var li = $(".question_select .dropdown-menu>li");
    $(document).on("click",".question_select .dropdown-menu>li",function () {
        var v = $(this).attr("data-value");
        var n = $(this).text();
        console.log(v);
        $(this).parents(".question_select").find("span.name").text(n);
        $(this).parents(".question_select").find("input").val(v);
        var isajax = $(this).parents().is("#group");
        //alert(isajax);
        //alert(v)
        if(!isajax){
            $.ajax({
                url:"/mod/question/ajax/getgroups/cid/"+v,
                success:function (res) {
                    if(res){
                        var li ="";
                            li += '<li data-value="0"><a href="javascript:;">不分组</a></li>';
                        $.each(res,function (k,v) {
                            li += '<li data-value="'+v.id+'"><a href="javascript:;">'+v.name+'</a></li>'
                        })
                        $("#group ul").html(li);
                        //console.log(li);
                        $("#group").removeClass("hide");
                    }else {
                        $("#group").addClass("hide");
                        $("#group").find("input").val(0)
                    }
                }
            })
        }

    })

//回复

    function addhtml(id) {
        var rhtml = "";
        //ajax
        $.ajax({
            url:"/mod/question/ajax/ajaxanswercomments/answer_id/"+id,
            // success:function (res) {
            //     var count = (res.data).length;
            //     if(count>0){
            //         $.each(res.data,function (k,v) {
            //             rhtml+='<li class="comment comment-reply">'+
            //                 '<img class="avatar" src="/uc/index/avatar/uid/'+v.uid+'" width="50" height="50" alt="avatar">'+
            //                 '<div class="comment-body">'+
            //                 '<a href="#" class="comment-author">'+
            //                 '<small class="text-muted pull-right">'+v.time+'</small>'+
            //                 '<span>'+v.username+'</span>'+
            //                 '</a>'+
            //                 '<p>'+v.message+'</p>'+
            //                 '</div>';
            //                     if(res.is_login){
            //                         rhtml+=  '<ul class="list-inline size-11 margin-top-10">'+
            //                 '<li>'+
            //                 '<a href="#" class="text-info commentreyplay" data-name="@'+v.username+':" data-id="'+id+'"><i class="fa fa-reply"></i> 回复</a>'+
            //                 '</li>';
            //             if(res.is_login==v.uid || res.is_admin){
            //             rhtml+='<li class="pull-right">'+
            //                 '<a href="/mod/question/ajax/delcomments/id/'+v.id+'" class="text-danger confirm ajax-get">删除</a>'+
            //                 '</li>';
            //             }
            //             rhtml+=  '</li></ul>';
            //                     }
            //             rhtml+= '</li>';
            //         })
            //     }else {
            //         rhtml += '<div class="alert alert-mini alert-warning margin-bottom-10 text-center">'+
            //             '暂无评论'+
            //             '</div>';
            //     }
            //     if(res.is_login){
            //         rhtml +=' <li>'+
            //             '<div class="input-group">'+
            //             '<input id="btn-input-'+id+'" type="text" class="form-control" placeholder="评论一下...">'+
            //             '<span class="input-group-btn">'+
            //             '<button class="btn btn-primary btn-chat" id="btn-chat-'+id+'" data-btn-id="'+id+'">'+
            //             '<i class="fa fa-reply"></i> 评论'+
            //             '</button>'+
            //             '</span>'+
            //             '</div>'+
            //             '</li>';
            //     }

            //     $('#comment-reply-'+id).html(rhtml);
            //     $('#comment-reply-'+id).addClass("isopen");
            //     $("#count-"+id).text(count);
            // }
        

           success:function (res) {
                var count = (res.data).length;
                if(count>0){
                    $.each(res.data,function (k,v) {
                        rhtml+='<li class="comment comment-reply">'+
                            '<b class="triangle"></b>'+
                            '<img class="avatar mui-pull-left" src="/uc/index/avatar/uid/'+v.uid+'" width="50" height="50" alt="avatar">'+
                            '<div class="comment-body mui-pull-left">'+
                            '<a href="#" class="comment-author">'+
                            '<span>'+v.username+'</span>'+
                            '<small class="text-muted">'+v.time+'</small>'+
                            '</a>'+
                            '<p>'+v.message+'</p>'+
                            '</div>';
                            
                                
        
                                if(res.is_login==v.uid || res.is_admin){
                                    rhtml+= '<ul class="list-inline size-11 margin-top-10 clear">'+
                                                '<li class="mui-pull-right">'+
                                                    '<a href="javascript:editdelete('+v.id+')" class="edit-delete confirm ajax-get">删除</a>'+
                                                '</li>';
                                    }
                                rhtml+=  '</li></ul>';
                            
                        rhtml+= '</li>';
                    })
                }else {
                    rhtml += '<div class="alert alert-mini alert-warning margin-bottom-10 text-center">'+
                        '暂无评论'+
                        '</div>';
                }
                if(res.is_login){
                    rhtml +=' <li id="write-reply-'+id+'">'+
                        '<div class="input-group clear">'+
                        '<input id="btn-input-'+id+'" type="text" class="form-control p-consult mui-pull-left" placeholder="评论一下...">'+
                        '<span class="input-group-btn">'+
                        '<button class="mui-btn muibtn-primary btn-chat b-consult mui-pull-left" id="btn-chat-'+id+'" data-btn-id="'+id+'">'+
                        '<i class="fa fa-reply"></i> 评论'+
                        '</button>'+
                        '</span>'+
                        '</div>'+
                        '</li>';
                }

                $('#comment-reply-'+id).html(rhtml);
                $('#write-reply-'+id).addClass("isopen");
                $("#count-"+id).text(count);
            } 


        })
    }
    $(".commentary").on("click",function () {
        var rid = $(this).attr("data-comment");
        //alert(rid)
        console.log(rid);
        var id = rid.split("-")[2];
        console.log(id);
        var isopen = $('#'+rid).is(".isopen");
        console.log(isopen);
        if(isopen){
            $('#'+rid).html("");
            $('#'+rid).removeClass("isopen");
            //$('#'+rid).removeClass("isopen");
            $("#oc-"+id).text("回复");
        }else {

            addhtml(id)
            $("#oc-"+id).text("关闭");
        }

    })


    //提交评论
    $(document).on("click",'.btn-chat',function () {
        var id = $(this).attr("data-btn-id");
        var val = $("#btn-input-"+id).val();
        if(val.length==0){
            mui.toast("评论不能为空!");
            return false;
        }
        $.ajax({
            type:"post",
            url:"/mod/question/ajax/ajaxanswercommentspost",
            data:{answer_id:id,message:val},
            success:function (data) {
                if (data.errno==0) {
                        mui.toast(data.data.name);
                        addhtml(id)
                }else{

                        mui.toast(data.errmsg);

                }
            }
        })
        //alert(id)
    })

    //回复评论
    $(document).on("click",'.commentreyplay',function (e) {
        e.preventDefault();
        var name = $(this).attr("data-name");
        var id =$(this).attr("data-id");
        //在光标位置插入回复者的姓名
        $("#btn-input-" + id).insertContent(name);
       // alert(name)
    })

        //提交评论
    $(document).on("click",'.btn_recommend',function () {
        var id = $(this).attr("data-recommend-id");
        console.log(id);
        
        $.ajax({
            type:"get",
            url:"/mod/question/ajax/ajaxrecommend/cmd/0/id/"+id,
            success:function (data) {
                if (data.errno==0) {
                        mui.toast(data.data.name);
                        addhtml(id)
                }else{

                        mui.toast(data.errmsg);

                }
            }
        })
        //alert(id)
    })
    //咨询
    // $(document).on("click",".consultation",function(){
    //     var data = $(".validate").serialize();
    //     console.log()
    //     $.ajax({
    //         type:"POST"
    //         url:"/mod/question/sys/updatetouranswer",
    //         data:data,
    //         success:function(data){
    //             console.log(data)
    //         }
    //     })
    // })
    
});
//删除评论
function editdelete(id){
    $.ajax({
        type:"get",
        url:"/mod/question/ajax/delcomments/id/"+id,
        success:function(data){
            if (data.errno==0) {
                    mui.toast(data.data.name);
                    setTimeout(function(){
                        mui.openWindow({url:window.location.href}) 
                    },1500)                                     
            }else{

                    mui.toast(data.errmsg);

            }
        }
    })
}
//咨询
function subTour(){
        var data = $("form.validate").serialize();
        var content = $(".zx-content").val();
        if(content == ""){
            mui.toast("咨询内容不能为空")
        }else{
            $.ajax({
                type:"POST",
                url:"/mod/question/sys/updatetouranswer",
                data:data,
                success:function(data){
                    console.log(data)
                    if(data.errno == 0){
                        mui.toast(data.data.name)
                        setTimeout(function(){
                            mui.openWindow({url:window.location.href}) 
                        },1500) 
                    }else{
                        mui.toast(data.errmsg)
                    }
                }
            })
        }
    }