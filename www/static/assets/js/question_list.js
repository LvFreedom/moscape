$(".cgy").on("click",function(){
    $(this).siblings().children("div").css("background-color","#896B63");
    $(this).children("div").css("background-color","#fff");
    var selectId = $(this).attr("id");
    var pId = selectId.split("select")[1];
    //console.log(pId);
    for (var i = 1; i <= 3; i++) {
        if(i!=pId){
            $("#page"+i).css("display","none");
        }
    }   
    $("#page"+pId).css("display","block");
    //console.log($("#page"+pId));
});

$(".order").on("click",function(){
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
 });


$(function(){
	var searchword = "";
	localStorage.setItem("question_searchword",JSON.stringify(searchword));

	tournote_pagination(1,0);

	tourquestion_pagination(1,0,0);

});

function updateTourNoteSearchWord() {
	var searchword = $("#searchTourNote").val();
	localStorage.setItem("note_searchword",JSON.stringify(searchword));
	tournote_pagination(1,1);
}
function tournote_pagination(page,iSearch){
	var searchword = '';
	if(0<iSearch){
		searchword = localStorage.getItem("note_searchword");
	}

	$.ajax({
		type:"get",
		url:"/ajax/question?cid=124&q="+searchword+"&page="+page,
		success:function(dataResult){
			//console.log(dataResult);
			var sn_html ='';
	    	if(page <= 1){
	    		sn_html_page1 ='<div class="studynote_page1"></div>';
				$(".studynote").html(sn_html_page1);
	    	}
			$.each(dataResult.data,function(k,v){
				if(0<v.imgurl.length){
					sn_html +='<a href="/mod/question/'+v.id+'"><div class="blog_post_item blog-post-item blog-post-item-inverse padding-top-10 padding-bottom-10 margin-bottom-0 clearfix" >\
						<figure class="figure_float margin-bottom-0" >\
                            <img class="immg" src="'+v.imgurl+'" >\
                        </figure>\
                        <div class="blog_item_content blog-item-small-content">\
                            <h2>'+v.title+'</h2>\
                            <p>'+v.detailtext+'</p>\
                        </div>\
                    </div></a>';
				}else{
					sn_html +='<a href="/mod/question/'+v.id+'"><div class="blog_post_item blog-post-item blog-post-item-inverse padding-top-10 padding-bottom-10 margin-bottom-0 clearfix" >\
                        <div class="blog_item_content blog-item-small-content" style="margin-left:254px;">\
                            <h2>'+v.title+'</h2>\
                            <p>'+v.detailtext+'</p>\
                        </div>\
                    </div></a>';
				}
			});
			if(dataResult.currentPage < dataResult.totalPages){
				var nextPage = page + 1;
				sn_html +='<div class="text-center margin-top-20 margin-bottom-20 sn_addmore">\
                 	 <a href="javascript:tournote_pagination('+nextPage+','+iSearch+');">点击加载更多</a>\
                </div>';
                $(".studynote_page"+page).after("<div></div>");
                $(".studynote_page"+page).next().addClass("studynote_page"+nextPage);
			}
			$(".sn_addmore").hide();
			$(".studynote_page"+page).html(sn_html);
		}
	});
}



function updateTourQuestionSearchWord() {
	var searchword = $("#searchTourQuestion").val();
	//console.log(searchword);
	localStorage.setItem("question_searchword",JSON.stringify(searchword));
	var order = localStorage.getItem("question_order");
	if(0<parseInt(order)){
		//console.log(parseInt(order));
		tourquestion_pagination(1,1,order);
	}else{
		tourquestion_pagination(1,0,order);
	}
	
}
function updateTourQuestionOrder(order) {
	//console.log(order);
	localStorage.setItem("question_order",JSON.stringify(order));
	var searchword = localStorage.getItem("question_searchword");
	//console.log(searchword);
	if(null!=searchword){
		tourquestion_pagination(1,1,order);
	}else{
		tourquestion_pagination(1,0,order);
	}
}
function tourquestion_pagination(page,iSearch,order){
	//var searchword = '';//GetQueryString("q");
	var searchword='';
	if (0<iSearch) {
		searchword = localStorage.getItem("question_searchword");
	}
	
	//order = localStorage.getItem("question_order");
	
	var tq_html ='';
	$.ajax({
		type:"get",
		url:"/ajax/question?cid=125&q="+searchword+"&page="+page+"&order="+order,
		success:function(dataResult){
			//console.log(dataResult);
			//console.log("/ajax/question?cid=125&q="+searchword+"&page="+page+"&order="+order);
			if(page <= 1){
	    		tq_html_page1 ='<div class="tourquestion_page1"></div>';
				$(".tourquestion").html(tq_html_page1);
	    	}
			$.each(dataResult.data,function(k,v){
				tq_html +='<div class="blog-post-item blog-post-item-inverse padding-top-10 padding-bottom-10 margin-bottom-0 clearfix" style="border: #eee 1px solid;margin-top: 20px;width:700px;" >\
                       <div class="qa_blog_congtent blog-item-small-content">\
                            <ul class="blog-post-info list-inline padding-bottom-10" style="border: 0px;">\
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
                	tq_html +='<li style="margin-left:5px;">\
                                    <div style="background-color: #1eb6c1;color: #fff;border-radius:3px;">&nbsp;待回答&nbsp;</div>\
                                </li>'
                }                
                                
                    tq_html += '</ul>\
                            <p>&nbsp;</p>\
                            <h2 style="margin-top: 5px;"><a href="/mod/question/'+v.id+'" title="'+v.title+'">'+v.title+'</a></h2>\
                            <p>'+v.detailtext+'</p>\
                             <ul class="blog-post-info list-inline margin-top-10" style="border: 0px;width: 250px;margin-left:400px;">\
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
                            </ul>\
                        </div>\
                    </div>';
			});
			if(dataResult.currentPage < dataResult.totalPages){
				//tournote_querystring_pagination(page,queryword)
				var nextPage = page +1 ;
				tq_html +='<div class="text-center margin-top-20 margin-bottom-20 tq_addmore">\
                 	 <a href="javascript:tourquestion_pagination('+nextPage+','+iSearch+','+order+');">点击加载更多</a>\
                </div>';
                $(".tourquestion_page"+page).after("<div></div>");
                $(".tourquestion_page"+page).next().addClass("tourquestion_page"+nextPage);
			}
			$(".tq_addmore").hide();
			$(".tourquestion_page"+page).html(tq_html);
			//$(".tourquestion").html(tq_html);
		}
	});

}