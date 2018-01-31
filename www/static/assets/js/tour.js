//固定浮动
$(document).ready(function(e) {			
	t = $('.float-box').offset().top;
	//console.log(t)
	//var m =  document.body.scrollHeight;
		//console.log(m)
	//mh = $('.main').height();
	fh = $('.float-box').height();
	$(window).scroll(function(e){
		var m =  document.body.scrollHeight;
		s = $(document).scrollTop();
		var b = m-s;
		//console.log(b)	
		if(s > t-40){
			$('.float-box').css({'position':'fixed','top':'40px','background':'#fff','z-index':'130'});				
		}else{
			$('.float-box').css({'position':'','background':''});
		}
		if(b<1674){
			$('.float-box').css({'position':'','background':''});
		}
	})
});

$(".under_tab_detail").find("img").addClass("imgWith");		
	
//分享
function share(){
	if($(".share-box").hasClass("out")){
		$(".share-box").removeClass("out").addClass("in")
	}else if($(".share-box").hasClass("in")){
		$(".share-box").removeClass("in").addClass("out")
	}
}
//隐藏分享
$("body").click(function(){
	if($(".share-box").hasClass("in")){
		$(".share-box").removeClass("in").addClass("out")
	}
})

//收藏
function collect(id){
	var type;
	$.ajax({
		url:"/ajax/focus?id="+id+"&type="+1,
		success:function(result){
			//console.log(result)
			//alert(result.data)
			 _toastr(result.data,"top-right","success",false);
		}
	})

}

//评分统计
$(document).ready(function(){
	var id = $(".proid").val();
	$.ajax({
		url:"/ajax/productcommentall?productid="+id,
		success:function(result){
			// console.log(result)
			// console.log(result.data.data)
			var data = result.data.data;
			var count1=0,count2=0,count3=0,count4=0,count5=0,imgcount=0;
			for(var i=0;i<data.length;i++){
				if(data[i].score_total == 1){
					count1++;
				}else if(data[i].score_total == 2){
					count2++;
				}else if(data[i].score_total == 3){
					count3++;
				}else if(data[i].score_total == 4){
					count4++;
				}else if(data[i].score_total == 5){
					count5++;
				}
				if(data[i].comment_img !== "" && data[i].comment_img !== undefined && data[i].comment_img !== null){
					imgcount++;
				}
			}
			$(".count1").html("("+count1+")");
			$(".count2").html("("+count2+")");
			$(".count3").html("("+count3+")");
			$(".count4").html("("+count4+")");
			$(".count5").html("("+count5+")");
			$(".imgcount").html("("+imgcount+")");
		}
	})
})

//页面加载完之后异步加载点评信息
$(document).ready(function(){
	var id = $(".proid").val();
	var html = "";
	$.ajax({
		url:"/ajax/productcommentlist?limit="+5+"&page=1&productid="+id,
		success:function(result){
			html += evaluatecontent(result);
			html += `<input class="page-type" type="hidden" value="0"/>`;
			$(".evaluate-box").html(html);
		}
	})
})
//全部点评
function allevaluate(pagenum){
	var id = $(".proid").val();
	var html = "";
	$.ajax({
		url:"/ajax/productcommentlist?limit="+5+"&page="+pagenum+"&productid="+id,
		success:function(result){
			html += evaluatecontent(result);
			html += `<input class="page-type" type="hidden" value="0"/>`;
			$(".evaluate-box").html(html);
		}
	})
}
//5分评价
function evaluate5(pagenum){
	var id = $(".proid").val();
	var html = "";
	$.ajax({
		url:"/ajax/productcommentlist?limit="+5+"&page="+pagenum+"&productid="+id+"&score="+5,
		success:function(result){
			html += evaluatecontent(result);
			html += `<input class="page-type" type="hidden" value="5"/>`;
			$(".evaluate-box").html(html);
		}
	})
}
//4分评价
function evaluate4(pagenum){
	var id = $(".proid").val();
	var html = "";
	$.ajax({
		url:"/ajax/productcommentlist?limit="+5+"&page="+pagenum+"&productid="+id+"&score="+4,
		success:function(result){
			html += evaluatecontent(result);
			html += `<input class="page-type" type="hidden" value="4"/>`;
			$(".evaluate-box").html(html);
		}
	})
}
//3分评价
function evaluate3(pagenum){
	var id = $(".proid").val();
	var html = "";
	$.ajax({
		url:"/ajax/productcommentlist?limit="+5+"&page="+pagenum+"&productid="+id+"&score="+3,
		success:function(result){
			html += evaluatecontent(result);
			html += `<input class="page-type" type="hidden" value="3"/>`;
			$(".evaluate-box").html(html);
		}
	})
}
//2分评价
function evaluate2(pagenum){
	var id = $(".proid").val();
	var html = "";
	$.ajax({
		url:"/ajax/productcommentlist?limit="+5+"&page="+pagenum+"&productid="+id+"&score="+2,
		success:function(result){
			html += evaluatecontent(result);
			html += `<input class="page-type" type="hidden" value="2"/>`;
			$(".evaluate-box").html(html);
		}
	})
}
//1分评价
function evaluate1(pagenum){
	var id = $(".proid").val();
	var html = "";
	$.ajax({
		url:"/ajax/productcommentlist?limit="+5+"&page="+pagenum+"&productid="+id+"&score="+1,
		success:function(result){
			html += evaluatecontent(result);
			html += `<input class="page-type" type="hidden" value="1"/>`;
			$(".evaluate-box").html(html);
		}
	})
}
//有图评价
function evaluateimg(pagenum){
	var html = "";
	var id = $(".proid").val();
	$.ajax({
		url:"/ajax/productcommentlist?limit="+5+"&page="+pagenum+"&productid="+id+"&has_img="+1,
		success:function(result){
			html += evaluatecontent(result);
			html += `<input class="page-type" type="hidden" value="p"/>`;
			$(".evaluate-box").html(html);
		}
	})
}
//用户评价内容
function evaluatecontent(result){
	var html = "";
	//console.log(result)

	var v = result.data.data;
	for(var i=0;i<v.length;i++){
		//console.log(v[i])
		html+=`
			<div class="clear">
				<div class="evaluate-user clear">
					<p>
			`;
		if(v[i].score_total == 1){
			html+=`
				<i class="samll-solid"></i>
				<i class="samll-heart"></i>
				<i class="samll-heart"></i>
				<i class="samll-heart"></i>
				<i class="samll-heart"></i>
			`;
		}else if(v[i].score_total == 2){
			html+=`
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
				<i class="samll-heart"></i>
				<i class="samll-heart"></i>
				<i class="samll-heart"></i>
			`;
		}else if(v[i].score_total == 3){
			html+=`
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
				<i class="samll-heart"></i>
				<i class="samll-heart"></i>
			`;
		}else if(v[i].score_total == 4){
			html+=`
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
				<i class="samll-heart"></i>
			`;
		}else if(v[i].score_total == 5){
			html+=`
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
				<i class="samll-solid"></i>
			`;
		}
		var ip = v[i].ip.toString();
		ip = ip.slice(0,3)+"******"+ip.slice(ip.length-3,ip.length)			
		html+=`
						<span>${ip}</span>
					</p>
				</div>
				<div class="evaluate-content clear">
					<div class="comment-score">${v[i].score_total}分</div>
					<div class="comment-evaluate clear">
						<div class="detaile-score">
			`

		if(v[i].score_guide !== null && v[i].score_guide !== undefined && v[i].score_guide!==0){
			html+=`
				<div>
					<span>导游讲解:</span>
			`;
			if(v[i].score_guide == 1){
				html+=`<span class="grade">很糟</span>`;
			}else if(v[i].score_guide == 2){
				html+=`<span class="grade">差</span>`
			}else if(v[i].score_guide == 3){
				html+=`<span class="grade">一般</span>`;
			}else if(v[i].score_guide == 4){
				html+=`<span class="grade">比较满意</span>`;
			}else if(v[i].score_guide == 5){
				html+=`<span class="grade">很满意</span>`;
			}
								
			html+=`
								</div>
				`
		}
		if(v[i].score_service!==null&&v[i].score_service!==undefined && v[i].score_service!==0){	
			html+=`						
				<div>
					<b></b>
					<span>领队服务:</span>
			`;
			if(v[i].score_service == 1){
				html+=`<span class="grade">很糟</span>`;
			}else if(v[i].score_service == 2){
				html+=`<span class="grade">差</span>`
			}else if(v[i].score_service == 3){
				html+=`<span class="grade">一般</span>`;
			}else if(v[i].score_service == 4){
				html+=`<span class="grade">比较满意</span>`;
			}else if(v[i].score_service == 5){
				html+=`<span class="grade">很满意</span>`;
			}
			html+=`
								</div>
					`;
		}
		if(v[i].score_traffic!==null&&v[i].score_traffic!==undefined&&v[i].score_traffic!==0){	
			html+=`				
				<div>
					<b></b>
					<span>交通路线:</span>
			`;
			if(v[i].score_traffic == 1){
				html+=`<span class="grade">很糟</span>`;
			}else if(v[i].score_traffic == 2){
				html+=`<span class="grade">差</span>`
			}else if(v[i].score_traffic == 3){
				html+=`<span class="grade">一般</span>`;
			}else if(v[i].score_traffic == 4){
				html+=`<span class="grade">比较满意</span>`;
			}else if(v[i].score_traffic == 5){
				html+=`<span class="grade">很满意</span>`;
			}	
			html+=`
					</div>
					`;
		}
		if(v[i].score_hotel!==null&&v[i].score_hotel!==undefined&&v[i].score_hotel!==0){
			html+=`				
				<div>
					<b></b>
					<span>住宿餐食:</span>
			`;
			if(v[i].score_hotel == 1){
				html+=`<span class="grade">很糟</span>`;
			}else if(v[i].score_hotel == 2){
				html+=`<span class="grade">差</span>`
			}else if(v[i].score_hotel == 3){
				html+=`<span class="grade">一般</span>`;
			}else if(v[i].score_hotel == 4){
				html+=`<span class="grade">比较满意</span>`;
			}else if(v[i].score_hotel == 5){
				html+=`<span class="grade">很满意</span>`;
			}	
			html+=`
					</div>
					`;
		}
		html+=`
				</div>
				<div class="comment">
					${v[i].comment_content}
				</div>
			`;
		if(v[i].imgurls!==""&&v[i].imgurls!==null&&v[i].imgurls!==undefined){
			var img = v[i].imgurls;
			//console.log(img)
			html+=`<div class="img-box">`;
			for(var n=0;n<img.length;n++){
				html+=`<img src="${img[n]}" alt="">`;
			}
			html+=`</div>`;
		}					
		html+=`
				<ul>
			`;
		if(v[i].comment_guide!==null&&v[i].comment_guide!==undefined&&v[i].comment_guide!==""){
			html+=`
				<li>
					<span>[导游讲解]</span>
					<b>${v[i].comment_guide}</b>
				</li>
			`;
		}								
		if(v[i].comment_service!==null&&v[i].comment_service!==undefined&&v[i].comment_service!==""){
			html+=`
					<li>
						<span>[领队服务]</span>
						<b>${v[i].comment_service}</b>
					</li>
			`;
		}
		if(v[i].comment_traffic!==null&&v[i].comment_traffic!==undefined&&v[i].comment_traffic!==""){
			html+=`						
				<li>
					<span>[交通路线]</span>
					<b>${v[i].comment_traffic}</b>
				</li>
			`;
		}
		if(v[i].comment_hotel!==null&&v[i].comment_hotel!==undefined&&v[i].comment_hotel!==""){
			html+=`
				<li>
					<span>[住宿餐食]</span>
					<b>${v[i].comment_hotel}</b>
				</li>
			`;
		}
		var newdate = new Date(v[i].add_time)
		var y = newdate.getFullYear();  
		var m = newdate.getMonth() + 1;  
		m = m < 10 ? ('0' + m) : m;  
		var d = newdate.getDate();  
		d = d < 10 ? ('0' + d) : d;  
		var h = newdate.getHours();  
		var minute = newdate.getMinutes();  
			minute = minute < 10 ? ('0' + minute) : minute;  
		var time = y + '-' + m + '-' + d+' '+h+':'+minute;
		html+=`	
						</ul>
						<div class="evaluate-time">
							${time}
						</div>
					</div>
				</div>
			</div>
		`;
	}
	html+=pagination(result.data.totalPages,result.data.currentPage);
	return html;
	//$(".evaluate-box").html(html);
}

//分页功能
function pagination(totalPages,currentPage){
	var html = "";
	var  count = 2;                               //当前页前后分页个数
	//动态填充分页页码
	var totalPages = totalPages      //总页数
	//console.log(totalPages)
	localStorage.setItem("totalPages",JSON.stringify(totalPages));
	var currentPage = currentPage    //当前页
	html += `<div class="pagination clear">`;
	if(currentPage > 1){        				  //上一页
		html += `<a class="prev-page" href=""><</a>`;
	}else{
		$(".evaluate-box").find(".prev-page").remove();
	}

	if(currentPage >= count*2 && totalPages != count){
		html += `<a href="" data-page="${1}">1</a><span>...</span>`;
	}

	var start = currentPage - count,
		end = currentPage + count;
	((start > 1 && currentPage < count) || currentPage == 1) && end++;
	(currentPage > totalPages - count && currentPage >= totalPages && start!=1) && start++;
	for(;start <= end;start++){
		if(start <= totalPages && start >= 1){
			if(start != currentPage){
				html += `<a href="" data-page="${start}">${start}</a>`;
			}else{
				html += `<a class="active-page" data-page="${start}" href="">${start}</a>`;
			}
		}
	} 

	if(currentPage + count < totalPages-1 && currentPage >= 1 && totalPages > count){
		var end = totalPages
		html += `<span>...</span><a href="" data-page="${totalPages}">${end}</a>`;
	}

	if(currentPage < totalPages){                 //下一页
		html += `<a class="next-page" href="">下一页></a>`;
	}else{
		$(".evaluate-box").find(".next-page").remove();
	}
	if(totalPages!=0 && totalPages!=""){
		html += `
			<b>到</b><input class="jump-page" type="number" /><b>页</b><a class="jump" href="">确定</a>
		`;
	}
	
	html += "</div>"
	return html;	
}

//为分页页码绑定单击事件
$(".evaluate-box").on("click",".pagination>a",function(e){
	if(e.preventDefault){
		e.preventDefault();
	}else{
		window.event.returnValue=false;
	}
	if($(this).hasClass("prev-page")){
		var index = parseInt($(".evaluate-box").find(".active-page").text()) - 1;
		//console.log(index)
	}else if($(this).hasClass("next-page")){
        var index = parseInt($(".evaluate-box").find(".active-page").text()) + 1;
        //console.log(index)
    }else if($(this).hasClass("active-page")){
        var index = parseInt($(this).data('page'));
        //console.log(index)
    }else if($(this).hasClass("jump")){
    	var index = parseInt($(".jump-page").val());
    	//console.log(index)
    }else{
        var index = parseInt($(this).data('page'));
        //console.log(index)
    }
    pageTable(index);
})

function pageTable(n){
	var totalPages = parseInt(localStorage.getItem("totalPages"));
	//console.log(totalPages);
	var reg = /^\+?[1-9][0-9]*$/;
	var pageType = $(".page-type").val()
	//console.log(pageType);
	if(reg.test(n) && n>0 && n<=totalPages){
		//console.log(n)
		if(pageType == "0"){
			allevaluate(n)
		}else if(pageType == "1"){
			evaluate1(n)
		}else if(pageType == "2"){
			evaluate2(n)
		}else if(pageType == "3"){
			evaluate3(n)
		}else if(pageType == "4"){
			evaluate4(n)
		}else if(pageType == "5"){
			evaluate5(n)
		}else if(pageType == "p"){
			evaluateimg(n)
		}
	}
	
}
