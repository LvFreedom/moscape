$(function(){
    //console.log("search");
    var schoolType = '';
    localStorage.setItem("schoolType",schoolType);
});

function GetQueryString(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null){
        //console.log(r[2]);
        //console.log(decodeURI(r[2]));
        return  (decodeURI(r[2])); 
    }
    return '';
}

$(".cgy").on("click",function(){
    $(this).siblings().children("div").css("background-color","#896B63");
    $(this).children("div").css("background-color","#fff");
    var selectId = $(this).attr("id");
    var pId = selectId.split("select")[1];
   	for (var i = 1; i <= 4; i++) {
   		if(i!=pId){
   			$("#page"+i).css("display","none");
   		}
   	} 	
    $("#page"+pId).css("display","block");
});
    
$(".bpm").on("click",function(){
	var a=$(this).find("a");
	var hrf=a.attr("href")
	window.open(hrf);
});

$(".tourdest,.schooltype,.schoolclass").on("click","a",function(){
    //console.log($(this).attr("id"));
    $(this).siblings().removeClass("btn-danger");
    $(this).addClass("btn-danger");
    getSchoolType();

});

function getSchoolType() {
    var tourdest_id = $(".tourdest").children(".btn-danger").attr("id");
    var schoolclass_id = $(".schoolclass").children(".btn-danger").attr("id");
    var schooltype_id = $(".schooltype").children(".btn-danger").attr("id");
    var schoolType = tourdest_id+'|'+schooltype_id+'|'+schoolclass_id;
    //console.log(schoolType);
    //localStorage.setItem("schoolType",JSON.stringify(schoolType));
    localStorage.setItem("schoolType",schoolType);
    getschool();

}

//学校页面
function getschool(days=0) {
    var searchword = GetQueryString("q");
    var  getHtml = '';
    var schoolType = localStorage.getItem("schoolType");
    //console.log(schoolType);
     $.ajax({
        type:"get",
       url:"ajax/topic?q="+searchword+"&page=1&limit=5&value=141-0-0-18-"+schoolType,
        success:function(dataResult){
            //console.log(dataResult);
            console.log(dataResult);
            if (dataResult.length!=null) {
                getHtml +='<div class="tourschool_pagination tspage1 ">'
                $.each(dataResult.data,function(k,v){
                    if(0==v.cover_url.length){
                        getHtml +='<a target="_blank" href="/p/'+v.id+'.html"><div class="strategy-content">'+
                                
                                '<div class="strategy-txt"> '+
                                    '<p>'+
                                    '&nbsp;'+
                                    '</p>'+
                                    '<h2>'+
                                        v.title +
                                    '</h2>'+
                                    '<p>'+
                                        v.description+
                                    '</p>'+
                                '</div>'+
                                '</div></a>';  
                    }else{
                        getHtml +='<a target="_blank" href="/p/'+v.id+'.html"><div class="strategy-content">'+
                                '<img src='+v.cover_url+'>'+
                                '<div class="strategy-txt"> '+
                                    '<p>'+
                                    '&nbsp;'+
                                    '</p>'+
                                    '<h2>'+
                                        v.title +
                                    '</h2>'+
                                    '<p>'+
                                        v.description+
                                    '</p>'+
                                '</div>'+
                                '</div></a>';     
                    }          
                });
                if(dataResult.currentPage < dataResult.totalPages){
                    getHtml +='<div class="text-center ts-load-more">' + '<a href="javascript:tourschool_pagination(2);">加载更多</a>'+'</div></div><div class="tourschool_pagination tspage2 "></div>'
                }
                $(".tour_school").html(getHtml);

            }else{
                $(".school").html('<h4 class="text-center margin-top-100" style="font-weight:800;">即将上线 敬请期待</h4>');
            }
        }
    })
}

function gettournote(days=0){
    var searchword = GetQueryString("q");
    var getHtml = "";
    if(days==7){
        getHtml = '<table class="table table  m-b-none" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><a href="javascript:gettournote();" class="btn btn-clean btn-xs relative">全部</a>\
                    <span class="btn btn-danger btn-xs relative">最近7天</span>\
                    <a href="javascript:gettournote(30);" class="btn btn-clean btn-xs relative">最近30天</a>\
                    <a href="javascript:gettournote(180);" class="btn btn-clean btn-xs relative">6个月内</a>\
                    <a href="javascript:gettournote(365);" class="btn btn-clean btn-xs relative">1年内</a>\
                    </td></tr></tbody></table>';
         //history.replaceState(" "," ","question?cid=124&day<=7");
    }else if(days==30){
        getHtml = '<table class="table table  m-b-none" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><a href="javascript:gettournote();" class="btn btn-clean btn-xs relative">全部</a>\
                    <a href="javascript:gettournote(7);" class="btn btn-clean btn-xs relative">最近7天</a>\
                    <span class="btn btn-danger btn-xs relative">最近30天</span>\
                    <a href="javascript:gettournote(180);" class="btn btn-clean btn-xs relative">6个月内</a>\
                    <a href="javascript:gettournote(365);" class="btn btn-clean btn-xs relative">1年内</a>\
                    </td></tr></tbody></table>';
          //history.replaceState(" "," ","question?cid=124&day<=30");
    }else if(days==180){
        getHtml = '<table class="table table  <m-b-none></m-b-none>" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><a href="javascript:gettournote();" class="btn btn-clean btn-xs relative">全部</a>\
                    <a href="javascript:gettournote(7);" class="btn btn-clean btn-xs relative">最近7天</a>\
                    <a href="javascript:gettournote(30);" class="btn btn-clean btn-xs relative">最近30天</a>\
                    <span class="btn btn-danger btn-xs relative">6个月内</span>\
                    <a href="javascript:gettournote(365);" class="btn btn-clean btn-xs relative">1年内</a>\
                    </td></tr></tbody></table>';
          //history.replaceState(" "," ","question?cid=124&day<=180");
    }else if(days==365){
        getHtml = '<table class="table table  m-b-none" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><a href="javascript:gettournote();" class="btn btn-clean btn-xs relative">全部</a>\
                    <a href="javascript:gettournote(7);" class="btn btn-clean btn-xs relative">最近7天</a>\
                    <a href="javascript:gettournote(30);" class="btn btn-clean btn-xs relative">最近30天</a>\
                    <a href="javascript:gettournote(180);" class="btn btn-clean btn-xs relative">6个月内</a>\
                    <span class="btn btn-danger btn-xs relative">1年内</span>\
                    </td></tr></tbody></table>';
         //history.replaceState(" "," ","question?cid=124&day<365");
    }else{
        getHtml = '<table class="table table  m-b-none" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><span class="btn btn-danger btn-xs relative">全部</span>\
                    <a href="javascript:gettournote(7);" class="btn btn-clean btn-xs relative">最近7天</a>\
                    <a href="javascript:gettournote(30);" class="btn btn-clean btn-xs relative">最近30天</a>\
                    <a href="javascript:gettournote(180);" class="btn btn-clean btn-xs relative">6个月内</a>\
                    <a href="javascript:gettournote(365);" class="btn btn-clean btn-xs relative">1年内</a>\
                    </td></tr></tbody></table>';  
        //history.replaceState(" "," ","question?cid=124&day=all");      
    }
        //'<tr class="type_tr_m"><td style="width: 70px;">所在版面：</td><td> <span class="btn btn-danger btn-xs relative">全部</span> <a href="javascript:;" class="btn btn-clean btn-xs relative">英伦半岛</a><a href="javascript:;" class="btn btn-clean btn-xs relative">旅行摄影</a><a href="javascript:;" class="btn btn-clean btn-xs relative">环游欧洲</a><a href="javascript:;" class="btn btn-clean btn-xs relative">美式风情</a></td></tr></tbody></table>';
    //console.log(days);
    //console.log("/ajax/question?cid=124&day="+days+"&q="+searchword);
     $.ajax({
        type:"get",
        url:"/ajax/question?cid=124&day="+days+"&q="+searchword,
        success:function(dataResult){
            //console.log(dataResult);
            getHtml +='<div class="tournote_pagination tpage1 ">'
            $.each(dataResult.data,function(k,v){
            	if(0==v.imgurl.length){
            		getHtml +='<a target="_blank" href="/mod/question/'+v.id+'.html"><div class="strategy-content">'+
                            
                            '<div class="strategy-txt"> '+
                                '<p>'+
                                '&nbsp;'+
                                '</p>'+
                                '<h2>'+
                                    v.title +
                                '</h2>'+
                                '<p>'+
                                    v.detailtext+
                                '</p>'+
                            '</div>'+
                            '</div></a>';  
            	}else{
                    getHtml +='<a target="_blank" href="/mod/question/'+v.id+'.html"><div class="strategy-content">'+
                            '<img src='+v.imgurl+'>'+
                            '<div class="strategy-txt"> '+
                                '<p>'+
                                '&nbsp;'+
                                '</p>'+
                                '<h2>'+
                                    v.title +
                                '</h2>'+
                                '<p>'+
                                    v.detailtext+
                                '</p>'+
                            '</div>'+
                            '</div></a>';     
            	}                  
            });
            if(dataResult.currentPage < dataResult.totalPages){
                getHtml +='<div class="text-center tn-load-more">' + '<a href="javascript:tournote_pagination(2);">加载更多</a>'+'</div></div><div class="tournote_pagination tpage2 "></div>'
            }else{
                //getHtml +='<div class="text-center no-more">'+'<p>已无更多</p>'+'</div></div>';
            }
            $(".strategy").html(getHtml);
        }
    })
};

function gettourquestion(days=0){
    var searchword = GetQueryString("q");
    //console.log(days);
    var getHtml = "";
    if(days==7){
        getHtml = '<table class="table table  m-b-none" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><a href="javascript:gettourquestion();" class="btn btn-clean btn-xs relative">全部</a>\
                    <span class="btn btn-danger btn-xs relative">最近7天</span>\
                    <a href="javascript:gettourquestion(30);" class="btn btn-clean btn-xs relative">最近30天</a>\
                    <a href="javascript:gettourquestion(180);" class="btn btn-clean btn-xs relative">6个月内</a>\
                    <a href="javascript:gettourquestion(365);" class="btn btn-clean btn-xs relative">1年内</a>\
                    </td></tr></tbody></table>';
        //history.replaceState(" "," ","question?cid=125&day=7");
    }else if(days==30){
        getHtml = '<table class="table table  m-b-none" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><a href="javascript:gettourquestion();" class="btn btn-clean btn-xs relative">全部</a>\
                    <a href="javascript:gettourquestion(7);" class="btn btn-clean btn-xs relative">最近7天</a>\
                    <span class="btn btn-danger btn-xs relative">最近30天</span>\
                    <a href="javascript:gettourquestion(180);" class="btn btn-clean btn-xs relative">6个月内</a>\
                    <a href="javascript:gettourquestion(365);" class="btn btn-clean btn-xs relative">1年内</a>\
                    </td></tr></tbody></table>';
        //history.replaceState(" "," ","question?cid=125&day=30");
    }else if(days==180){
        getHtml = '<table class="table table  m-b-none" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><a href="javascript:gettourquestion();" class="btn btn-clean btn-xs relative">全部</a>\
                    <a href="javascript:gettourquestion(7);" class="btn btn-clean btn-xs relative">最近7天</a>\
                    <a href="javascript:gettourquestion(30);" class="btn btn-clean btn-xs relative">最近30天</a>\
                    <span class="btn btn-danger btn-xs relative">6个月内</span>\
                    <a href="javascript:gettourquestion(365);" class="btn btn-clean btn-xs relative">1年内</a>\
                    </td></tr></tbody></table>';
        //history.replaceState(" "," ","question?cid=125&day=180");
    }else if(days==365){
        getHtml = '<table class="table table  m-b-none" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><a href="javascript:gettourquestion();" class="btn btn-clean btn-xs relative">全部</a>\
                    <a href="javascript:gettourquestion(7);" class="btn btn-clean btn-xs relative">最近7天</a>\
                    <a href="javascript:gettourquestion(30);" class="btn btn-clean btn-xs relative">最近30天</a>\
                    <a href="javascript:gettourquestion(180);" class="btn btn-clean btn-xs relative">6个月内</a>\
                    <span class="btn btn-danger btn-xs relative">1年内</span>\
                    </td></tr></tbody></table>';
        //history.replaceState(" "," ","question?cid=125&day=365");
    }else{
        getHtml = '<table class="table table  m-b-none" style="margin:10px 0px;"><tbody><tr class="type_tr_m">\
                    <td class="the-td">发帖时间：</td>\
                    <td><span class="btn btn-danger btn-xs relative">全部</span>\
                    <a href="javascript:gettourquestion(7);" class="btn btn-clean btn-xs relative">最近7天</a>\
                    <a href="javascript:gettourquestion(30);" class="btn btn-clean btn-xs relative">最近30天</a>\
                    <a href="javascript:gettourquestion(180);" class="btn btn-clean btn-xs relative">6个月内</a>\
                    <a href="javascript:gettourquestion(365);" class="btn btn-clean btn-xs relative">1年内</a>\
                    </td></tr></tbody></table>';
        //history.replaceState(" "," ","question?cid=125&day=all");        
    }
    getHtml += '<div class="tourquestion_page1"></div><div class="tourquestion_page2"></div>';
    $(".qsn-awr").html(getHtml);
    $(".tourquestion_page1").css("width","904px");
    var pageHtml = '';
     $.ajax({
        type:"get",
        url:"/ajax/question?cid=125&day="+days+"&q="+searchword,
        success:function(dataResult){
            $.each(dataResult.data,function(k,v){
                pageHtml +='<a target="_blank" href="/mod/question/'+v.id+'.html"><div class="showquestion">'+
                            '<ul class="blog-post-info list-inline padding-bottom-10" style="border: 0px;width:825px;">\
                                <li>\
                                    <a href="javascript:;"><img src="/uc/index/avatar/uid/'+v.uid+'" style="width: 50px;height: 50px;border-radius: 50%;"></a>\
                                    <a href="javascript:;">\
                                        <span class="font-lato span_userName">'+v.username+'</span>\
                                    </a>\
                                    <span class="font-lato">提了一个问题</span>\
                                </li>\
                                <li>\
                                    <span class="font-lato"> · </span>\
                                </li>\
                                <li>\
                                    <span class="font-lato">'+ v.create_time +'</span>\
                                </li>'
                if (0==v.answer_count) {
                    pageHtml += '<li style="margin-left:5px;">\
                                    <div style="background-color: #1eb6c1;color: #fff;border-radius:3px;">&nbsp;待回答&nbsp;</div>\
                                </li>'
                }
                pageHtml +='</ul>'+
                            '<p>'+
                            '&nbsp;'+
                            '</p>'+
                            '<h2 style="font-size:15px;margin-bottom:6px;"><a href="/mod/question/'+v.id+'" title="'+v.title+'">'+
                                v.title +
                            '</a></h2>'+
                            '<p>'+
                                v.detailtext+
                            '</p>'+
                            '<ul class="blog-post-info list-inline margin-top-10" style="border: 0px;width: 250px;margin-left:600px;">\
                                <li>\
                                    <img src="static/assets/images/reply.png" style="width: 16px;height: 16px;margin-top:-4px;"" />\
                                    <span class="font-lato">'+ v.answer_count +' 个回答</span>\
                                </li>\
                                <li style="margin:0px 10px;">\
                                    <div style="width:2px;height:13px ;background-color: black;"></div>\
                                </li>\
                                <li>\
                                    <img src="static/assets/images/browse.png" style="width: 16px;height: 16px;margin-top:-4px;"/>\
                                    <span class="font-lato">'+ v.view +' 人浏览</span>\
                                </li>\
                            </ul>'+
                            '</div></a>';  
            	
            	          
            });
            if(dataResult.currentPage < dataResult.totalPages){
                pageHtml +='<div class="text-center tq-load-more">' + '<a href="javascript:tourquestion_pagination(2);">加载更多</a>'+'</div></div>';
            }else{
                //getHtml +='<div class="text-center no-more">'+'<p>已无更多</p>'+'</div>';
            }
            $(".tourquestion_page1").html(pageHtml);
        }
    })
}; 

function studytour_pagination(page) {
    console.log('yoxuue fenye ');
    var searchword = GetQueryString("q");
    var value = GetQueryString("value");
    //console.log(value)
    var cover = '';
    var fav = '';
    var pageHTML = "";
    $.ajax({
        type:"get",
        url:"/ajax/topic?q="+searchword+"&page="+page+"&value="+value,
        success:function(dataResult){    
            $.each(dataResult.data,function(k,v){
                /*if(null==v.cover_url){
                    pageHTML +='<a target="_blank" href="/p/'+v.tid+'.html"><div class="strategy-content">'+
                            
                            '<div class="strategy-txt"> '+
                                '<p>'+
                                '&nbsp;'+
                                '</p>'+
                                '<h2>'+
                                    v.title +
                                    '<span class="price-span">'+
                                        v.price +
                                    '</span>'+
                                '</h2>'+
                                '<p>'+
                                    v.description+
                                '</p>'+
                            '</div>'+
                            '</div></a>';  
                }else{
                    pageHTML +='<a target="_blank" href="/p/'+v.id+'.html"><div class="strategy-content">'+
                            '<img src='+v.cover_url+'>'+
                            '<div class="strategy-txt"> '+
                                '<p>'+
                                '&nbsp;'+
                                '</p>'+
                                '<h2>'+
                                    v.title +
                                    '<span class="price-span">￥'+
                                    v.price +
                                    '/人起</span>'+
                                '</h2>'+

                                '<p>'+
                                    v.description+
                                '</p>'+
                            '</div>'+
                            '</div></a>';     
                }*/ 
                if(null==v.cover_url){
                    cover = '/static/noimg.jpg';
                }else{
                    cover = v.cover_url;
                }
                if (1==v.favflag) {
                    //console.log('favflaggggggg');
                    fav = '<img class="small-end-single" src=/static/assets/images/small_end_single.jpg> ';
                }
                pageHTML +='<a target="_blank" href="/p/'+v.id+'.html"><div class="strategy-content">'+
                            '<img src='+cover+'>'+
                            fav+
                            '<div class="strategy-txt"> '+
                                '<p>'+
                                '&nbsp;'+
                                '</p>'+
                                '<h2>'+
                                    v.title +
                                    '<span class="price-span">￥'+
                                    v.price +
                                    '/人起</span>'+
                                '</h2>'+

                                '<p>'+
                                    v.description+
                                '</p>'+
                            '</div>'+
                            '</div></a>';    
            });
           
            if(dataResult.currentPage < dataResult.totalPages){
                var nextPage = page+1;
                pageHTML +='<div class="text-center load-more">' + '<a href=javascript:studytour_pagination('+nextPage+')>加载更多</a>'+'</div>'
            }else{
                //pageHTML +='<div class="text-center no-more">'+'<p>已无更多</p>'+'</div>';
            }
            $(".load-more").hide();
            //console.log(pageHTML);
            if(0<$(".studytour_pagination"+page).length){
            	$(".studytour_pagination"+page).html(pageHTML); 
            }else{
            	 //console.log("创建新一页");
            	 var lastPage =  page-1;
            	 $(".studytour_pagination"+lastPage).after("<div></div>");
            	 $(".studytour_pagination"+lastPage).next().addClass("col-md-9 col-sm-9 left-part studytour_pagination"+page);
            	 $(".studytour_pagination"+page).html(pageHTML);
            }
            //$(".pagination"+page).html(pageHTML); 
            
        }
    });
}

function tournote_pagination(page) {
    var pageHTML = "";
    var searchword = GetQueryString("q");
    var dayString=$(".strategy span").text();
    var day;
    switch(dayString){
    	case "全部":
    		day = 0;
    		break;
    	case "最近7天":
    		day = 7;
    		break;
		case "最近30天":
    		day = 30;
    		break;
    	case "6个月内":
    		day = 180;
    		break;
    	case "1年内":
    		day = 365;
    		break;
    	default:
    	    day = 0;
    }

    //console.log(day);
    $.ajax({
        type:"get",
        url:"/ajax/question?cid=124&day="+day+"&page="+page+"&q="+searchword,
        success:function(dataResult){
            //console.log(dataResult);           
            $.each(dataResult.data,function(k,v){
                if(0==v.imgurl.length){
            		pageHTML +='<a target="_blank" href="/mod/question/'+v.id+'.html">'+'<div class="strategy-content">'+
            				'<div class="strategy-txt"> '+
                                '<p>'+
                                '&nbsp;'+
                                '</p>'+
                                '<h2>'+
                                    v.title +
                                '</h2>'+
                                '<p>'+
                                    v.detailtext+
                                '</p>'+
                            '</div>'+
                            '</div></a>';  
            	}else{
                    pageHTML +='<a target="_blank" href="/mod/question/'+v.id+'.html">'+'<div class="strategy-content">'+
                            '<img src='+v.imgurl+'>'+
                            '<div class="strategy-txt"> '+
                                '<p>'+
                                '&nbsp;'+
                                '</p>'+
                                '<h2>'+
                                    v.title +
                                '</h2>'+
                                '<p>'+
                                    v.detailtext+
                                '</p>'+
                            '</div>'+
                            '</div></a>';     
            	}
                   
            });
           
            if(dataResult.currentPage < dataResult.totalPages){
                var nextPage = page+1;
                pageHTML +='<div class="text-center  tn-load-more">' + '<a href=javascript:tournote_pagination('+nextPage+')>加载更多</a>'+'</div><div class="tournote_pagination tpage'+nextPage+'"><div><div class="tpage'+nextPage+'"></div>'
            }else{
                //pageHTML +='<div class="text-center no-more">'+'<p>已无更多</p>'+'</div>';
            }
            $(".tn-load-more").hide();
            $(".tpage"+page).html(pageHTML);

        }
    });
}

function tourquestion_pagination(page) {
    var pageHtml = "";
    var searchword = GetQueryString("q");
    var dayString=$(".qsn-awr span").text();
    var day;
    switch(dayString){
    	case "全部":
    		day = 0;
    		break;
    	case "最近7天":
    		day = 7;
    		break;
		case "最近30天":
    		day = 30;
    		break;
    	case "6个月内":
    		day = 180;
    		break;
    	case "1年内":
    		day = 365;
    		break;
    	default:
    	    day = 0;
    }
    $.ajax({
        type:"get",
        url:"/ajax/question?cid=125&day="+day+"&page="+page+"&q="+searchword,
        success:function(dataResult){
            //console.log(dataResult);       
            $.each(dataResult.data,function(k,v){
                pageHtml +='<a target="_blank" href="/mod/question/'+v.id+'.html"><div class="showquestion">'+
                            '<ul class="blog-post-info list-inline padding-bottom-10" style="border: 0px;width:825px;">\
                                <li>\
                                    <a href="javascript:;"><img src="/uc/index/avatar/uid/'+v.uid+'" style="width: 50px;height: 50px;border-radius: 50%;"></a>\
                                    <a href="javascript:;">\
                                        <span class="font-lato span_userName">'+v.username+'</span>\
                                    </a>\
                                    <span class="font-lato">提了一个问题</span>\
                                </li>\
                                <li>\
                                    <span class="font-lato"> · </span>\
                                </li>\
                                <li>\
                                    <span class="font-lato">'+ v.create_time +'</span>\
                                </li>'
                if (0==v.answer_count) {
                    pageHtml += '<li style="margin-left:5px;">\
                                    <div style="background-color: #1eb6c1;color: #fff;border-radius:3px;">&nbsp;待回答&nbsp;</div>\
                                </li>'
                }
                pageHtml +='</ul>'+
                            '<p>'+
                            '&nbsp;'+
                            '</p>'+
                            '<h2 style="font-size:15px;margin-bottom:6px;"><a href="/mod/question/'+v.id+'" title="'+v.title+'">'+
                                v.title +
                            '</a></h2>'+
                            '<p>'+
                                v.detailtext+
                            '</p>'+
                            '<ul class="blog-post-info list-inline margin-top-10" style="border: 0px;width: 250px;margin-left:600px;">\
                                <li>\
                                    <img src="static/assets/images/reply.png" style="width: 16px;height: 16px;margin-top:-4px;"" />\
                                    <span class="font-lato">'+ v.answer_count +' 个回答</span>\
                                </li>\
                                <li style="margin:0px 10px;">\
                                    <div style="width:2px;height:13px ;background-color: black;"></div>\
                                </li>\
                                <li>\
                                    <img src="static/assets/images/browse.png" style="width: 16px;height: 16px;margin-top:-4px;"/>\
                                    <span class="font-lato">'+ v.view +' 人浏览</span>\
                                </li>\
                            </ul>'+
                            '</div></a>';   
            });
           
            if(dataResult.currentPage < dataResult.totalPages){
                var nextPage = page+1;
                pageHTML +='<div class="text-center tq-load-more">' + '<a href=javascript:tourquestion_pagination('+nextPage+')>加载更多</a>'+'</div>'

                var nextPage = page +1 ;
                $(".tourquestion_page"+page).after("<div></div>");
                $(".tourquestion_page"+page).next().addClass(".tourquestion_page"+nextPage);
            }else{
                //pageHTML +='<div class="text-center no-more">'+'<p>已无更多</p>'+'</div>';
            }
            $(".tq-load-more").hide();
            $(".tourquestion_page"+page).html(pageHtml);
        }
    });
}

function tourschool_pagination(page) {
    var getHtml = '';
    var searchword = GetQueryString("q");
    var schoolType = localStorage.getItem("schoolType");
     $.ajax({
        type:"get",
        url:"ajax/topic?q="+searchword+"&page="+page+"&limit=5&value=141-0-0-18-"+schoolType,
        success:function(dataResult){
            //console.log(dataResult);
            $.each(dataResult.data,function(k,v){
                if(0==v.cover_url.length){
                    getHtml +='<a target="_blank" href="/p/'+v.id+'.html"><div class="strategy-content">'+
                            
                            '<div class="strategy-txt"> '+
                                '<p>'+
                                '&nbsp;'+
                                '</p>'+
                                '<h2>'+
                                    v.title +
                                '</h2>'+
                                '<p>'+
                                    v.description+
                                '</p>'+
                            '</div>'+
                            '</div></a>';  
                }else{
                    getHtml +='<a target="_blank" href="/p/'+v.id+'.html"><div class="strategy-content">'+
                            '<img src='+v.cover_url+'>'+
                            '<div class="strategy-txt"> '+
                                '<p>'+
                                '&nbsp;'+
                                '</p>'+
                                '<h2>'+
                                    v.title +
                                '</h2>'+
                                '<p>'+
                                    v.description+
                                '</p>'+
                            '</div>'+
                            '</div></a>';     
                }          
            });
            if(dataResult.currentPage < dataResult.totalPages){
                var nextPage = page +1 ;
                getHtml +='<div class="text-center ts-load-more">' + '<a href="javascript:tourschool_pagination('+nextPage+');">加载更多</a>'+'</div>';
                $(".tspage"+page).after("<div></div>");
                $(".tourschool_pagination.tspage"+page).next().addClass("tourschool_pagination tspage"+nextPage);
            }
            $(".ts-load-more").hide();
            $(".tspage"+page).html(getHtml);
        }
    })
    
}