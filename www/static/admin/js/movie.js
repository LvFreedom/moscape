/**
*为select绑定change事件
*/
$(".select-user").change(function(){
	var name = $(this).val();
	$(".user>.user-name>b").html(name)
	//用户
	var uname = $(".user-name>b").html();
	//显示范围 0:显示全部 1:显示已添加
	var can_view = $(".able-watch>label>input").val();
	//选择电影类型
	var classify = $(".movie-type a.active").attr("data-type");
	//选择供应商
	var supplier = $(".supplier-type a.active").attr("data-type");
	//页码，第一页
	var page = 1;
	//console.log(uname,can_view,classify,supplier,page)
	htmllist(uname,can_view,classify,supplier,page);
})
/**
*为确定按钮绑定单击事件
*/
// $(".input-user").on("click",".btn",function(){
// 	var name = $(".input-user>input").val()
// 	//验证用户名是否存在
// 	$.ajax({
// 		type:"POST",
// 		data:{name:name},
// 		url:"/admin/video/prove",
// 		success:function(data){
// 			//console.log(data)
// 			if(data.errno == 0){
// 				$(".user-name>b").html(name)
// 			}else{
// 				if(data.errmsg == "用户名不能为空"){
// 					$(".user-name>b").html(" ")
// 				}else{
// 					toastr.error(data.errmsg);
// 				}
// 			}
// 		}
// 	})
// })
/**
*显示已添加 0:显示全部 1:显示已添加
*/
$(".able-watch").on("click","input",function(){
	if($(".able-watch label input").is(":checked")){
		$(".able-watch label input").val(1);
	}else{
		$(".able-watch label input").val(0);
	}
	//用户
	var uname = $(".user-name>b").html();
	//显示范围 0:显示全部 1:显示已添加
	var can_view = $(".able-watch>label>input").val();
	//选择类型
	var classify = $(".movie-type a.active").attr("data-type");
	//选择供应商
	var supplier = $(".supplier-type a.active").attr("data-type");
	//页码，第一页
	var page = 1;
	//console.log(uname,can_view,classify,supplier,page)
	htmllist(uname,can_view,classify,supplier,page);
})
/**
*选择电影类型 all:全部 1:武侠 2:犯罪 3:科幻 4:战争 5:恐怖 6:惊悚 7:纪录片 8:戏曲 9:歌舞 10:奇幻 11:冒险 12:悬疑 
*13:历史 14:动作 15:传记 16:动画 17:儿童 18:喜剧 19:爱情 20:剧情 21:运动 22:短片
*/
function movietype(movietype){
	$(".movie"+movietype).addClass("active");
	$(".movie"+movietype).siblings().removeClass("active");
	//用户
	var uname = $(".user-name>b").html();
	//显示范围 0:显示全部 1:显示已添加
	var can_view = $(".able-watch>label>input").val();
	//选择类型
	var classify = movietype;
	//选择供应商
	var supplier = $(".supplier-type a.active").attr("data-type");
	//页码，第一页
	var page = 1;
	//console.log(uname,can_view,classify,supplier,page)
	htmllist(uname,can_view,classify,supplier,page);
}
/**
*选择供应商
*/
function supplier(supplier){
	$(".supplier"+supplier).addClass("active");
	$(".supplier"+supplier).siblings().removeClass("active");
	//用户
	var uname = $(".user-name>b").html();
	//显示范围 0:显示全部 1:显示已添加
	var can_view = $(".able-watch>label>input").val();
	//选择类型
	var classify = $(".movie-type a.active").attr("data-type");
	//选择供应商
	var supplier = supplier;
	//页码，第一页
	var page = 1;
	//console.log(uname,can_view,classify,supplier,page)
	htmllist(uname,can_view,classify,supplier,page);
}

/**
*添加按钮
*/
$(".video-info").on("click",".overlay-bg>a",function(){
	var uname = $(".user-name>b").html();
	if(uname=="" || uname==undefined){
		toastr.error("请先选择用户！");
	}else{
		var able_watch = $(this).siblings("input").val();
		if($(this).hasClass("add")){
			$.ajax({
				type:"POST",
				data:{uname:uname,able_watch:able_watch},
				url:"/admin/video/addmovie",
				success:function(data){
					if(data.errno == 0){
						$(".bg-num"+able_watch).addClass("top-0")
						$(".bg-num"+able_watch+">a.add").removeClass("in").addClass("out");
						$(".bg-num"+able_watch+">a.add-ok").removeClass("out").addClass("in");
					}else{
						toastr.error(data.errmsg);
					}
				}
			})
		}else if($(this).hasClass("add-ok")){
			$.ajax({
				type:"POST",
				data:{uname:uname,able_watch:able_watch},
				url:"/admin/video/deletemovie",
				success:function(data){
					if(data.errno == 0){
						$(".bg-num"+able_watch).removeClass("top-0")
						$(".bg-num"+able_watch+">a.add").removeClass("out").addClass("in");
						$(".bg-num"+able_watch+">a.add-ok").removeClass("in").addClass("out");
					}else{
						toastr.error(data.errmsg);
					}
				}
			})
		}
	}
})
/**
*page
*/
$(".pagelist").on("click","li",function(){
	//用户
	var uname = $(".user-name>b").html();
	//显示范围 0:显示全部 1:显示已添加
	var can_view = $(".able-watch>label>input").val();
	//选择类型
	var classify = $(".video-type a.active").attr("data-type");
	//选择供应商
	var supplier = $(".supplier-type a.active").attr("data-type");
	//页码
	var page;
	if($(this).attr("class") == "prev"){
		page = parseInt($(".pagelist>ul>li.active>a").html())-1;
	}else if($(this).attr("class") == "next"){
		page = parseInt($(".pagelist>ul>li.active>a").html())+1;
	}else{
		page = parseInt($(this).children().html())
	}

	htmllist(uname,can_view,classify,supplier,page);
})
/**
*电影详情列表 ajax请求
*/
function htmllist(uname,can_view,classify,supplier,page){
	//发送请求
	$.ajax({
		type:"POST",
		data:{uname:uname,can_view:can_view,classify:classify,supplier:supplier,page:page},
		url:"/admin/video/moviedata",
		success:function(data){
			//console.log(data)
			var html = "";
			if(data.errno == 0){
				var movielist = data.data.data;
				$.each(movielist,function(index,movie){
					html += `<li class="col-xs-4 col-sm-3 col-md-2">
								<div>
									<dl>
										<dt>
							`;
					if( movie.video_cover == "" || movie.video_cover == undefined){
						html+=`
							<img src="/static/admin/img/m0.jpg" alt="">
						`;
					}else{
						html+=`
							<img src="${movie.video_cover}" alt="">
						`;
					}
					html+=`						
							</dt>
							<dd>
								<ul>
						`;
					if(movie.title == "" || movie.title == undefined){
						html+=`<li>名称：暂无</li>`;
					}else{
						html+=`<li>名称：${movie.title}</li>`;
					}
					if(movie.main_actor == "" || movie.main_actor == undefined){
						html+=`<li>主演：暂无</li>`;
					}else{
						html+=`<li>主演：${movie.main_actor}</li>`;
					}
					if(movie.director == "" || movie.director == undefined){
						html+=`<li>导演：暂无</li>`;
					}else{
						html+=`<li>导演：${movie.director}</li>`;
					}
					html+=`
								</ul>
							</dd>
						</dl>
						`;
					if(movie.can_view == 1){
						html+=`
							<div class="overlay-bg bg-num${movie.id} top-0">
								<input type="hidden" value="${movie.id}"/>
								<a class="add out" href="#">添加</a>
								<a class="add-ok in" href="#"><i></i></a>
							</div>
						`
					}else{
						html+=`
							<div class="overlay-bg bg-num${movie.id}">
								<input type="hidden" value="${movie.id}"/>
								<a class="add in" href="#">添加</a>
								<a class="add-ok out" href="#"><i></i></a>
							</div>
						`;
					}
					html+=`
							</div>
						</li>
						`;
				})
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