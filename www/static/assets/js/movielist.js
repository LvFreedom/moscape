/***********************
**为电影类别绑定单击事件
************************/
$(".tab-content").on("click","a",function(){
	$(this).removeClass("btn-clean").addClass("btn-info");
	$(this).siblings().removeClass("btn-info").addClass("btn-clean");
	//选择类型
	var classify = $(".movietype>a.btn-info").attr("data-type")
	//选择供应商
	var supplier = $(".supplier>a.btn-info").attr("data-type")
	//页码，第一页
	var page = 1;
	//用户
	var uname = $("strong").html();
	htmllist(uname,classify,supplier,page)

})
/***********************
**为分页绑定单击事件
************************/
$(".pagelist").on("click","li",function(){
	//选择类型
	var classify = $(".movietype>a.btn-info").attr("data-type")
	//选择供应商
	var supplier = $(".supplier>a.btn-info").attr("data-type")
	//页码
	var page;
	if($(this).attr("class") == "prev"){
		page = parseInt($(".pagelist>ul>li.active>a").html())-1;
	}else if($(this).attr("class") == "next"){
		page = parseInt($(".pagelist>ul>li.active>a").html())+1;
	}else{
		page = parseInt($(this).children().html())
	}
	//用户
	var uname = $("strong").html();
	htmllist(uname,classify,supplier,page)
})
/**********************
**电影详情列表 ajax请求
***********************/
function htmllist(uname,classify,supplier,page){
	//发送请求
	$.ajax({
		type:"POST",
		data:{uname:uname,classify:classify,supplier:supplier,page:page},
		url:"/ajax/movielist",
		success:function(data){
			if(data.errno == 0){
				var moviedata = data.data.data;
				var html = "";
				for(var i=0;i<moviedata.length;i++){
					html += `<li class="col-xs-4 col-sm-3 col-md-3s">
			                    <div>
				                    <a href="/m/${moviedata[i].id}.html">
				                        <dl>
				                            <dt>
			                `
			        if(moviedata[i].video_cover=="" || moviedata[i].video_cover==undefined){
			        	html+=`<img src="/static/noimg.jpg" alt="">`;
			        }else{
			        	html+=`<img src="${moviedata[i].video_cover}" alt="">`;
			        }
			        html += `
			        			<div class="overlay-bg">
									<i></i>
								</div>
							</dt>
	                            <dd>
	                                <ul>
			        `;
			        if(moviedata[i].title=="" || moviedata[i].title==undefined){
			        	html+=`<li>名称：暂无</li>`;
			        }else{
			        	html+=`<li title="${moviedata[i].title}">名称：${moviedata[i].title}</li>`;
			        }
			        if(moviedata[i].main_actor=="" || moviedata[i].main_actor==undefined){
			        	html+=`<li>主演：暂无</li>`;
			        }else{
			        	html+=`<li title="${moviedata[i].main_actor}">主演：${moviedata[i].main_actor}</li>`;
			        }
			        if(moviedata[i].director=="" || moviedata[i].director==undefined){
			        	html+=`<li>导演：暂无</li>`;
			        }else{
			        	html+=`<li title="${moviedata[i].director}">导演：${moviedata[i].director}</li>`;
			        }
			        html+=`
							          		</ul>
			                            </dd>
			                        </dl>
		                        </a>
		                    </div>
		                </li>
			        `;
				}
				$(".video-info").html(html);
				var page = 	pages(data)
				$(".pagelist").html(page)
			}else if(data.errno == 1000){
				$(".video-info").html(data.errmsg);
				$(".pagelist").html("")
			}                                          
		}
	})
}