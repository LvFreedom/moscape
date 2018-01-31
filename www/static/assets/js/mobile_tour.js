//固定浮动
$(document).ready(function(e) {			
	t = $('.product-introduce').offset().top;
	//console.log(t)
	//var m =  document.body.scrollHeight;
		//console.log(m)
	//mh = $('.main').height();
	fh = $('.product-introduce').height();
	$(window).scroll(function(e){
		var m =  document.body.scrollHeight;
		s = $(document).scrollTop();
		var b = m-s;
		//console.log(b)	
		if(s > t-45){
			$('.product-introduce').css({'position':'fixed','top':'20px','background':'#fff','z-index':'130'});			
		}else{
			$('.product-introduce').css({'position':'','background':''});
		}
	})
});

//点击显示
$("#js_detail_tab").on("click","a",function(){
	$("#js_detail_tab a").removeClass("current")
	$(this).addClass("current")
	if($(this).hasClass("xs-xcjs")){
		$(".product-info").removeClass("active").addClass("fade")
		$(".xcjs").removeClass("fade").addClass("active");
	}else if($(this).hasClass("xs-fy")){
		$(".product-info").removeClass("active").addClass("fade")
		$(".fy").removeClass("fade").addClass("active");
	}else if($(this).hasClass("xs-ydxz")){
		$(".product-info").removeClass("active").addClass("fade")
		$(".ydxz").removeClass("fade").addClass("active");
	}else if($(this).hasClass("xs-qz")){
		$(".product-info").removeClass("active").addClass("fade")
		$(".qz").removeClass("fade").addClass("active");
	}else if($(this).hasClass("xs-yhpj")){
		$(".product-info").removeClass("active").addClass("fade")
		$(".yhdp").removeClass("fade").addClass("active");
	}else if($(this).hasClass("xs-zx")){
		$(".product-info").removeClass("active").addClass("fade")
		$(".consult").removeClass("fade").addClass("active");
	}
})	
	
//分享
function share(){
	var height = document.getElementsByClassName("text-title");
	height = height[0].offsetHeight
	console.log(height)
	if($(".share-box").hasClass("out")){
		$(".share-box").removeClass("out").css({"position":"absolute","bottom":height,"right":0})
	}else{
		$(".share-box").addClass("out")
	}
}
//隐藏分享
$("body").click(function(){
	$(".share-box").addClass("out")
})

//收藏
function collect(id){
	var type;
	$.ajax({
		url:"/ajax/focus?id="+id+"&type="+1,
		success:function(result){
			//console.log(result)
			//alert(result.data)
			 mui.toast(result.data);
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
mui.ready(function(){
	var id = $(".proid").val();
	var html = "";
	mui.ajax({
		url:"/ajax/productcommentlist?limit="+5+"&page=1&productid="+id,
		success:function(result){
			html += evaluatecontent(result);
			html += `<input id="page-type" type="hidden" value="0"/>`;
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
			html += `<input id="page-type" type="hidden" value="0"/>`;
			if(pagenum == 1){
				$(".evaluate-box").html(html);
			}else{
				$(".evaluate-box").append(html);
			}	
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
			html += `<input id="page-type" type="hidden" value="5"/>`;
			if(pagenum == 1){
				$(".evaluate-box").html(html);
			}else{
				$(".evaluate-box").append(html);
			}
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
			html += `<input id="page-type" type="hidden" value="4"/>`;
			if(pagenum == 1){
				$(".evaluate-box").html(html);
			}else{
				$(".evaluate-box").append(html);
			}
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
			html += `<input id="page-type" type="hidden" value="3"/>`;
			if(pagenum == 1){
				$(".evaluate-box").html(html);
			}else{
				$(".evaluate-box").append(html);
			}
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
			html += `<input id="page-type" type="hidden" value="2"/>`;
			if(pagenum == 1){
				$(".evaluate-box").html(html);
			}else{
				$(".evaluate-box").append(html);
			}
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
			html += `<input id="page-type" type="hidden" value="1"/>`;
			if(pagenum == 1){
				$(".evaluate-box").html(html);
			}else{
				$(".evaluate-box").append(html);
			}
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
			html += `<input id="page-type" type="hidden" value="p"/>`;
			if(pagenum == 1){
				$(".evaluate-box").html(html);
			}else{
				$(".evaluate-box").append(html);
			}
		}
	})
}
//用户评价内容
function evaluatecontent(result){
	var html = "";
	console.log(result)

	var v = result.data.data;
	html+=`<div class="evaluates">`
	for(var i=0;i<v.length;i++){
		var ip = v[i].ip.toString();
		ip = ip.slice(0,3)+"******"+ip.slice(ip.length-3,ip.length)	
		//console.log(v[i])
		html+=`
			<div class="clear evaluate-personal">
				<div class="evaluate-user clear">
					<em class="mui-pull-left"><img src="/uc/index/avatar/uid/${v[i].uid}" alt="" /></em>
					<p class="mui-pull-left">
			`;
		if(v[i].score_total == 1){
			html+=`

				<span>${ip}</span>
				<span class="mui-pull-right margin-left-30">1分</span>
				<span class="mui-pull-right">
					<i class="samll-solid"></i>
					<i class="samll-heart"></i>
					<i class="samll-heart"></i>
					<i class="samll-heart"></i>
					<i class="samll-heart"></i>
				</span>	
			`;
		}else if(v[i].score_total == 2){
			html+=`
				<span>${ip}</span>
				<span class="mui-pull-right margin-left-30">2分</span>
				<span class="mui-pull-right">
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
					<i class="samll-heart"></i>
					<i class="samll-heart"></i>
					<i class="samll-heart"></i>
				</span>	
			`;
		}else if(v[i].score_total == 3){
			html+=`
				<span>${ip}</span>
				<span class="mui-pull-right margin-left-30">3分</span>
				<span class="mui-pull-right">
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
					<i class="samll-heart"></i>
					<i class="samll-heart"></i>
				</span>					
			`;
		}else if(v[i].score_total == 4){
			html+=`
				<span>${ip}</span>
				<span class="mui-pull-right margin-left-30">4分</span>
				<span class="mui-pull-right">
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
					<i class="samll-heart"></i>
				</span>		
			`;
		}else if(v[i].score_total == 5){
			html+=`
				<span>${ip}</span>
				<span class="mui-pull-right margin-left-30">5分</span>
				<span class="mui-pull-right">
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
					<i class="samll-solid"></i>
				</span>		
			`;
		}		
		html+=`
			</p>
		</div>
		<div class="evaluate-content clear">
			<div class="comment">
				${v[i].comment_content}
			</div>
			<div class="comment-evaluate clear">
				<div class="detaile-score">
			`

		if(v[i].score_guide !== null && v[i].score_guide !== undefined && v[i].score_guide!==0){
			html+=`
				<div>
					<span>[导游讲解]</span>
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
		if(v[i].comment_guide!==null&&v[i].comment_guide!==undefined&&v[i].comment_guide!==""){
			html+=`
					<div>${v[i].comment_guide}</div>
			`;
		}
		if(v[i].score_service!==null&&v[i].score_service!==undefined && v[i].score_service!==0){	
			html+=`						
				<div>
					<b></b>
					<span>[领队服务]</span>
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
		if(v[i].comment_service!==null&&v[i].comment_service!==undefined&&v[i].comment_service!==""){
			html+=`
				<div>${v[i].comment_service}</div>
			`;
		}
		if(v[i].score_traffic!==null&&v[i].score_traffic!==undefined&&v[i].score_traffic!==0){	
			html+=`				
				<div>
					<b></b>
					<span>[交通路线]</span>
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
		if(v[i].comment_traffic!==null&&v[i].comment_traffic!==undefined&&v[i].comment_traffic!==""){
			html+=`						
				<div>${v[i].comment_traffic}</div>
			`;
		}	
		if(v[i].score_hotel!==null&&v[i].score_hotel!==undefined&&v[i].score_hotel!==0){
			html+=`				
				<div>
					<b></b>
					<span>[住宿餐食]</span>
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
		if(v[i].comment_hotel!==null&&v[i].comment_hotel!==undefined&&v[i].comment_hotel!==""){
			html+=`
				<div>${v[i].comment_hotel}</div>
			`;
		}	
		html+=`
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
						<div class="evaluate-time mui-pull-right">
							${time}
						</div>
					</div>
				</div>
			</div>
			
		`;
	}
	//html+=pagination(result.data.totalPages,result.data.currentPage);
	html += `</div>
			<input id="totalPages" type="hidden" value="${result.data.totalPages}"/>
			<input id="currentPage" type="hidden" value="${result.data.currentPage}"/>
			`
	var currentPage = parseInt(result.data.currentPage)
	var totalPages = parseInt(result.data.totalPages)
	if(currentPage<totalPages){
		html+=`<div id="more-comment" class="get-more"><span>展开更多</span> <b class="b1"></b><b class="b2"></b></div>`
	}
			
	return html;
	// $(".evaluate-box").html(html);
}


//点击加载更多评价
mui(".evaluate-box").on("tap","#more-comment",function(){
	//var totalPages = parseInt(mui(".totalPages"));
	var totalPages = parseInt(document.getElementById("totalPages").value),
		currentPage = parseInt(document.getElementById("currentPage").value)+1,
		pageType = document.getElementById("page-type").value;
		console.log(pageType)

	var a = document.getElementById("totalPages"),
		b = document.getElementById("currentPage"),
		c = document.getElementById("more-comment"),
		d = document.getElementById("page-type");
	a.parentNode.removeChild(a);
	b.parentNode.removeChild(b);
	c.parentNode.removeChild(c);
	d.parentNode.removeChild(d);
	//console.log(pageType);
	if(currentPage>0 && currentPage<=totalPages){
		//console.log(n)
		if(pageType == "0"){
			allevaluate(currentPage)
		}else if(pageType == "1"){
			evaluate1(currentPage)
		}else if(pageType == "2"){
			evaluate2(currentPage)
		}else if(pageType == "3"){
			evaluate3(currentPage)
		}else if(pageType == "4"){
			evaluate4(currentPage)
		}else if(pageType == "5"){
			evaluate5(currentPage)
		}else if(pageType == "p"){
			evaluateimg(currentPage)
		}
	}
})

//点击加载更多咨询
var btn = document.getElementById("more-consult");
mui.ready(function(){
	var array = $(".comment-box")
	if(array.length<3){
		btn.style.display="none";
	}
	if(array.length == 0){
		btn.style.display="none";
	}else{
		$.each(array,function(k,v){
			if(k<2){
				$(this).removeClass("consult-hidden").addClass("consult-active")
				console.log($(this))
			}
			
		})
	}
		
})

btn.addEventListener("tap",function () {
	$(".consult-active:last").next().removeClass("consult-hidden").addClass("consult-active")
							 .next().removeClass("consult-hidden").addClass("consult-active")
	var array = $(".consult-hidden")
	console.log(array)
	if(array.length == 0){
		btn.style.display="none"
	}
	var arr = $(".wangEditor-consult p")
	$.each(arr,function(k,v){
		var height = $(this).context.offsetHeight
		if(height>30){
			$(this).addClass("ellipsis");
			$(this).siblings("i").addClass("down")
		}
	})
})
//点击展开咨询
mui.ready(function(){
	var arr = $(".wangEditor-consult p")
	$.each(arr,function(k,v){
		var height = $(this).context.offsetHeight
		if(height>30){
			$(this).addClass("ellipsis");
			$(this).siblings("i").addClass("down")
		}
	})
	
})
mui(".wangEditor-consult").on("tap","i",function(){
	if($(this).siblings("p").hasClass("ellipsis")){
		$(this).siblings("p").removeClass("ellipsis")
		$(this).removeClass("down").addClass("top")
	}else{
		$(this).siblings("p").addClass("ellipsis")
		$(this).removeClass("top").addClass("down")
	}
})