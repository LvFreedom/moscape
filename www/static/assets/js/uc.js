// $(document).ready(function(){
// 	$.ajax({
// 		url:"/uc/seting/query",
// 		success:function(result){
// 			localStorage.setItem("username",JSON.stringify(result.username));
// 		}
// 	})
// })
$(document).ready(function(){
	var uname;
	$.ajax({
		url:"/uc/seting/query",
		async:false,
		success:function(result){
			localStorage.setItem("username",JSON.stringify(result.username));
			uname = result.username;
		}
	})
	var html = "";
	html+= '<div class="order-handing">'+
				'<div class="order-title">'+
	              	'<img src="/uc/index/avatar"  class=" rounded" alt="'+uname+'" style="width: 65px" />'+
		            '<span>'+uname+'</span>'+
		            //'<a class="btn btn-info apply" href="">申请成为商家</a>'+
	          	'</div>'+
	          	'<div class="order-content min-height2">'+
	          		'<div class="table-list">'+
		                '<a class="all-order" href="javascript:allOrder();">全部订单</a>'+
		                '<input class="pagetype" type="hidden" value="order"/>'+
		                //'<a class="not-start">未出行</a>'+
		                //'<a class="obligation-order">待付款</a>'+
		                //'<a class="pending-evaluation">待评价</a>'+
	        		'</div>'+
	        		'<div class="table-responsive order-table">'
	    ;
	html+=resultEach(1);
	html+=`							
			</div>
      	</div>
    </div>
		`;
	$(".aside-right").html(html);  
})
//显示和隐藏
function showHidden(){
	if($(".asideRight #set-header").hasClass("in")){
		$(".asideRight #set-header").removeClass("active").removeClass("in")
	}
	if($(".asideRight #upload-img").hasClass("out")){
		$(".asideRight #upload-img").addClass("out");
		$(".asideRight .show-upload").removeClass("out");
	}
	if($(".asideRight .evaluation-order").hasClass("in")){
		$(".asideRight .evaluation-order").removeClass("active").removeClass("in");
	}
}

/****
*订单
**/
function ucOrder(){
	queryorderlist();
	showHidden();	
}
//全部订单
function allOrder(){
	var html="";
	html+= resultEach(1);	

	$(".order-table").html(html);
}
//未出行
function notStart(){}
//待付款
function obligationOrder(){}
//待评价
function pendingEvaluation(){}
//订单详情
function orderDetail(n){
	var html="";
  	//var orderdata = orderdetail();
  	var orderDataList = localStorage.getItem("odrerData");
	orderDataList = JSON.parse(orderDataList);
  	var orderDataDetail = orderDataList[n];
  	console.log(orderDataDetail.product_id);
  	var tourdays;
  	$.ajax({
  		url:"/uc/booking/tourdays?tid="+orderDataDetail.product_id,
  		async:false,
  		success:function(result){
  			console.log(result)
  			tourdays = result[0].tourdays;
  		}
  	})
	html+=`
		<div class="detail-box">
	        <div>
	            <div class="detail-title">
	              订单详情
	            </div>
	            <div class="detail-content clear">
	              <div class="order-state">
	                <p>订单状态:${orderDataDetail.status_desc} </p>
	                <p>订单编号:${orderDataDetail.order_no}</p>
	              </div>
	    `;
    if(orderDataDetail.status == 2 || orderDataDetail.status == 2){
    	html += `
			<div class="order-select" >                           
                <a href="javascript:cannelorder(${orderDataDetail.order_no});">取消订单</a> 
            </div>         
    	`;
    }else if(orderDataDetail.status == 8){
    	html += `
			<div class="order-select" >                           
                <a href="javascript:showEvaluation(${orderDataDetail.product_id});">评价</a> 
            </div>         
    	`;
    }
    var newdate = new Date(orderDataDetail.start_date).getTime()
    newdate = 86400000*tourdays+newdate;
    newdate = new Date(newdate)
	var y = newdate.getFullYear();  
	var m = newdate.getMonth() + 1;  
	m = m < 10 ? ('0' + m) : m;  
	var d = newdate.getDate();  
	d = d < 10 ? ('0' + d) : d;   
	var time = y + '-' + m + '-' + d
	html += `          
	            </div>
	          </div>
	          <div>
	            <div class="detail-title">
	              <span>订单信息</span>
	            </div>
	            <div class="detail-content order-information">
	              <p>
	                ${orderDataDetail.title}
	              </p>
	`;
	var departure_place_name;
	$.ajax({
		url:"/ajax/query?id="+orderDataDetail.product_id,
		async:false,
		success:function(data){
			console.log(data);
			departure_place_name = data.departure_place_name
		}
	})
	html+=`
	              <p>
	                <span>出发城市${departure_place_name}</span>
	                <span>出发日期${orderDataDetail.start_date}</span>
	                <span>返回日期${time}</span>          
	 				<span>${orderDataDetail.adult_quantity}成人,${orderDataDetail.kid_quantity}儿童,${orderDataDetail.baby_quantity}婴儿</span>  
	                
	              </p>
	              <p>
	              <span>商品总价:￥${orderDataDetail.order_amount}</span>
	              <span>,优惠促销:￥${orderDataDetail.discount_amount}</span>
	              <span>,订单金额:￥${orderDataDetail.real_amount}</span>
	              </p>
	            </div>
	          </div>
	          <div>
	            <div class="detail-title">
	              <span>联系人</span>
	            </div>
	            <div class="detail-content">
	              <ul>
	                <li>
	                  <b>姓名</b>
	                  <span>${orderDataDetail.connect_name}</span>
	                </li>
	                <li>
	                  <b>Email</b>
	                  <span>${orderDataDetail.connect_email}</span>
	                </li>
	                <li>
	                  <b>手机号码</b>
	                  <span>${orderDataDetail.connect_phone}</span>
	                </li>
	              </ul>
	            </div>
	          </div>
	          <div>
	            <div class="detail-title">
	              <span>旅客</span>
	            </div>
	            <div class="detail-content">
	        <div>
	`;
	var travellersinfo = JSON.parse(orderDataDetail.travellersinfo);
	console.log(travellersinfo)
	$.each(travellersinfo,function(k,v){
		//console.log(k)
		console.log(v)
		if(v.type == 1){
			html+=`
			
                <div class="traveller-num">
                  <p>旅客${k+1}</p>
                  <span>成人</span>
                </div>       
            `;
		}else if(v.type == 2){
			html+=`
                <div class="traveller-num">
                  <p>旅客${k+1}</p>
                  <span>儿童</span>
                </div>       
            `;

		}else{
			html+=`
                <div class="traveller-num">
                  <p>旅客${k+1}</p>
                  <span>婴儿</span>
                </div>       
            `;
		}
		html+=`
			<ul>
              <li>
                <b>中文姓名</b><span>${v.name_zh}</span>
              </li>
              <li>
                <b>国籍</b><span>${v.country}</span>
              </li>
            `;
        if(v.credentials_type==0){
        	html+=`
			  <li>
                <b>证件类型</b><span>护照</span>
              </li>
        	`;
        }else if(v.credentials_type==1){
        	html+=`
			  <li>
                <b>证件类型</b><span>港澳通行证</span>
              </li>
        	`;
        }else if(v.credentials_type==2){
        	html+=`
			  <li>
                <b>证件类型</b><span>台湾通行证</span>
              </li>
        	`;
        }
        if(v.sexual==0){
        	 html+=`			                  
              <li>
                <b>性别</b><span>男</span>
              </li>
             `;
        }else if(v.sexual==1){
        	 html+=`			                  
              <li>
                <b>性别</b><span>女</span>
              </li>
             `;
        }
        html+=`			           
              <li>
                <b>出生日期</b><span>${v.birthday}</span>
              </li>
              <li>
                <b>联系电话</b><span>${v.phone}</span>
              </li>
            </ul>
		`;

	})
	html+=`                                  
              </div>
            </div>
          </div>
        </div>
	`;
	$(".aside-right").html(html);
}
//评价订单
function orderEvaluation(){
	 
  	var orderDataList = localStorage.getItem("odrerData");
	orderDataList = JSON.parse(orderDataList);
  	console.log(orderDataList);

  	for(var i=0;i<orderDataList.length;i++){
  		var html="";
  		var orderDataDetail = orderDataList[i];
  		if(orderDataDetail.status == 8){
			console.log(orderDataDetail);
			$.ajax({
				url:"/uc/booking/getproductinfo/product_id/"+orderDataDetail.product_id,
				async:false,
				success:function(result){
					//console.log(result);
					$(`.order-evaluation${orderDataDetail.product_id} .order-number`).html(orderDataDetail.order_no);
					$(`.order-evaluation${orderDataDetail.product_id} .evaluation-detail img`).attr("src",result.data.cover_url);
					$(`.order-evaluation${orderDataDetail.product_id} .evaluation-detail .order-tit`).html("【"+orderDataDetail.title+"】");
			        if(result.data.commentcount != 0){
			        	var mark = result.data.score;//result.data.commentcount;
			        	mark = mark.toFixed(1)
			        	//console.log(mark)
			        	//console.log(result.data.commentcount)
			        }
			       
			        if(result.data.commentcount == 0){
			        	html += `
				        	<div class="lf">
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>	
							</div>		                    
		                    <b style="padding-left:5px;"></b>
			        	`;
			        }else if(mark > 1 && mark < 2){
			        	html += `
				        	<div class="lf">
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>	
							</div>		                    
		                    <b style="padding-left:5px;">${mark}分</b>
			        	`;
			        }else if(mark >= 2 && mark < 3){
			        	html += `
				        	<div class="lf">
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
							</div>			                    
		                    <b style="padding-left:5px;">${mark}分</b>
			        	`;
			        }else if(mark >= 3 && mark < 4){
			        	html += `
				        	<div class="lf">
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>	
							</div>		                    
		                    <b style="padding-left:5px;">${mark}分</b>
			        	`;
			        }else if(mark >= 4 && mark < 5){
			        	html += `
				        	<div class="lf">
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart-empty total-points"></em>
							</div>			                    
		                    <b style="padding-left:5px;">${mark}分</b>
			        	`;
			        }else if(mark == 5){
			        	html += `
			        		<div class="lf">
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
								<em class="glyphicon glyphicon-heart total-points"></em>
							</div>			                    
		                    <b style="padding-left:5px;">${mark}分</b>
			        	`;
			        }     
			       	$(`.order-evaluation${orderDataDetail.product_id} .comment-evaluate`).html(html);	
				}
			})
  		}
  			
  	}
}
 
//动态显示数量
function textCounter(n) {
	 var length=$('.totality'+n).val().length;
	 //console.log(length)
	 $(".word-number").html(500-length);
}
//显示订单评价
function showEvaluation(product_id){
	orderEvaluation();
	$('#evaluation-order'+product_id).addClass("active").addClass("in");
	$(".aside-right").html("");
}

//验证订单评价
function commentBlur(n){
	var commentcontent = $('.totality'+n).val()
	console.log(commentcontent)
	var reg = /^\s*$/g
	if(reg.test(commentcontent)){
		console.log("aaa")
		$('.totality'+n).val("请填写您的评价")
	}
}

//提交订单评价
function submitComment(id){
	console.log(id);
	// var data = $(".form-sub"+id).serialize();
	//console.log(data);
	let score_total = $(".form-sub"+id).find(".score-total").val()
	console.log(score_total)
	let commentcontent = $('.totality'+id).val()
	console.log(commentcontent)
	var reg = /^\s*$/g;
	let score_guide = $(".form-sub"+id).find(".score-guide").val(),
		score_service=$(".form-sub"+id).find(".score-service").val(),
		score_traffic=$(".form-sub"+id).find(".score-traffic").val(),
		score_hotel = $(".form-sub"+id).find(".score-hotel").val();
	if(score_total==0 || score_total==""){
		$(".form-sub"+id).find(".score-total").siblings("b").html("您还没有评分");
	}else if(reg.test(commentcontent)){
		$('.totality'+id).val("请填写您的评价");
	}else if(score_guide==""&&score_service==""&&score_traffic==""&&score_hotel==""){
		console.log("ad")
		var r = confirm("您未对产品满意度进行任何评分，系统将默认为5分")
		if(r){
			$(".form-sub"+id).find(".score-guide").val(5)
			$(".form-sub"+id).find(".score-service").val(5)
			$(".form-sub"+id).find(".score-traffic").val(5)
			$(".form-sub"+id).find(".score-hotel").val(5)
		}
	}else{
		var data = $(".form-sub"+id).serialize();
		$.ajax({
			type:"post",
			url:"/uc/booking/addcomment",
			data:data,
			success:function(result){
				console.log(result)
				if(result.errno == 0){
					 _toastr("评价成功.","top-right","success",false);
				}else{
					 _toastr("评价失败！","top-right","error",false);   
				}
			}
		})
	}
} 
//查看行程
function viewStroke(n){
	var html="";
	$.ajax({
		url:"/uc/booking/getproductinfo/product_id/"+n,
		success:function(result){
			console.log(result.data.product_route);
			html += `
				<div class="view-stroke">
		          	<div class="stroke-title">
		            	查看行程
		          	</div>
		          	<div class="stroke-content">
		              ${result.data.product_route}		
		          	</div>
		        </div>
		  	`;
		  $(".aside-right").html(html);
		}

	})  
}
//回调：订单列表
function queryorderlist(){
	var html="";
	$.ajax({
		url:"/uc/booking/query?page=1",
		success:function(result){
			var uname = JSON.parse(localStorage.getItem("username"));

			html=
  			'<div class="order-handing">'+
				'<div class="order-title">'+
	              	'<img src="/uc/index/avatar"  class=" rounded" alt="'+uname+'" style="width: 65px" />'+
		            '<span>'+uname+'</span>'+
		            //'<a class="btn btn-info apply" href="">申请成为商家</a>'+
	          	'</div>'+
	          	'<div class="order-content min-height">'+
	          	'<input class="pagetype" type="hidden" value="order"/>'+
	          		'<div class="table-list">'+
		                '<a class="all-order">全部订单</a>'+
		                //'<a class="not-start">未出行</a>'+
		                //'<a class="obligation-order">待付款</a>'+
		                //'<a class="pending-evaluation">待评价</a>'+
	        		'</div>'+
	        		'<div class="table-responsive order-table">'								
	        		;

			html+=resultEach(1);

			html+=`							
				</div>
          	</div>
        </div>
			`;
			$(".aside-right").html(html);     				
		}
	})	
};

//分页功能
function pagination(n,page){
	var html = "";
	var  count = 2;                               //当前页前后分页个数
	//动态填充分页页码
	var totalPages = page;      //总页数
	var currentPage = n;     	//当前页
	html += `<div class="pagination">`;
	if(currentPage > 1){        				  //上一页
		html += `<a class="prev-page" href=""><</a>`;
	}else{
		$(".aside-right").find(".prev-page").remove();
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
		html += `<a class="next-page" href="">></a>`;
	}else{
		$(".aside-right").find(".next-page").remove();
	}
	html += "</div>"
	return html;	
}

//为分页页码绑定单击事件
$(".aside-right").on("click",".pagination>a",function(e){
	if(e.preventDefault){
		e.preventDefault();
	}else{
		window.event.returnValue=false;
	}
	var pagetype = $(".pagetype").val();
	//console.log(pagetype)
	if($(this).hasClass("prev-page")){
		var index = parseInt($(".aside-right").find(".active-page").text()) - 1;
		//console.log(index)
	}else if($(this).hasClass("next-page")){
        var index = parseInt($(".aside-right").find(".active-page").text()) + 1;
        //console.log(index)
    }else if($(this).hasClass("active-page")){
        var index = parseInt($(this).data('page'));
        //console.log(index)
    }else{
        var index = parseInt($(this).data('page'));
        //console.log(index)
    }
    if(pagetype == "order"){
    	//console.log($(".pagetype").val())
    	pageTable(index);
    }else if(pagetype == "collection"){
    	//console.log($(".pagetype").val());
    	collectionPage(index);
    }
   
})

function pageTable(n){
	var html = "";
	html += resultEach(n)
	$(".aside-right").find(".order-table").html(html)
}


//回调:订单内容
function resultEach(pageNum){
	var h="";
	//console.log(pageNum)
	$.ajax({
		url:"/uc/booking/query?page="+pageNum,
		async:false,
		success:function(result){
			console.log(result.data)
			localStorage.setItem("odrerData",JSON.stringify(result.data));

			var orderDataList = localStorage.getItem("odrerData");
			orderDataList = JSON.parse(orderDataList);
			for(var i=0;i<orderDataList.length;i++){
				var v = orderDataList[i];
				//console.log(v)
				h+=`
					<table>
					<tr class="order-num">
						<td class="col-xs-3">
			              	<span>订单号：</span><a href="#" target="_blank">${v.order_no}</a>
			            </td>
			            <td class="col-xs-2">姓名</td>
			            <td class="col-xs-2">出发日期</td>
			            <td class="col-xs-1">订单金额</td>
			            <td class="col-xs-1">订单状态</td>
			            <td class="col-xs-1">操作</td>
					</tr>
					<tr>
						<td>
				          	<a class="goodsItem" target="_blank" href="/p/${v.product_id}.html">${v.title}</a>
				        </td>
				        <td>
							<span>${v.connect_name}</span>
				        </td>
			        	<td>${v.start_date}</td>
			        	<td>￥${v.real_amount}</td>
						<td>
							<span class="text-warning">${v.status_desc}</span><br>
							<a class="order-detail" href="javascript:orderDetail(${i})">查看详情 </a> 
						</td>
				`;
				if(v.status == 1){
			        h+=`
			            <td> 
			            	<a href="">编辑订单</a><br />              
							<a href="javascript:deleteOrder(${v.order_no});" >删除订单</a><br>
							<a href="javascript:viewStroke(${v.product_id});">查看行程 </a>
			            </td>												
			    	`;
			    }else if(v.status == 2){
			    	h += `
			    		<td>
							<a href="javascript:cannelorder(${v.order_no});" >取消订单 </a><br>
							<a href="javascript:viewStroke(${v.product_id});">查看行程 </a>
						</td>
			    	`;
			    }else if(v.status == 3){
			    	h += `
			    		<td>
							<a href="javascript:deleteOrder(${v.order_no});" >删除订单 </a><br>
							<a href="javascript:viewStroke(${v.product_id});">查看行程 </a>
						</td>
			    	`;
			    }else if(v.status == 6){
			    	h += `
			    		<td>				
							<a href="javascript:viewStroke(${v.product_id});">查看行程 </a>
						</td>
			    	`;
			    }else if(v.status == 8){
			    	h += `
			    		<td>
							<a href="javascript:viewStroke(${v.product_id});">查看行程 </a><br/>
							<a class="my-evaluation" href="javascript:showEvaluation(${v.product_id})">评价</a>
						</td>
			    	`;
			    }else if(v.status == 9){
			    	h += `
			    		<td>
							<a href="javascript:viewStroke(${v.product_id});">查看行程 </a>
						</td>
			    	`;
			    }else if(v.status == 15){
			    	h += `
			    		<td>
							<a href="javascript:viewStroke(${v.product_id});">查看行程 </a>
						</td>
			    	`;
			    }
			     h += `
					</tr>
				</table>	
			    `;
			}
			h += pagination(pageNum,result.totalPages);
		}
	})   
	return h;		
}
//取消订单
function cannelorder(orderid){
	//console.log(orderid);
	var pro;
	var r = confirm("您确定要取消该订单吗？")
	if(r){
		$.ajax({
			url:"/uc/booking/cannelorder?orderid="+orderid,
			async:false,
			success:function(result){
				//console.log(result);
				queryorderlist();
			}
		});
	}
	
	//console.log(pro)
	return pro;
};
//删除订单
function deleteOrder(orderid){
	var r = confirm("您确定要删除该订单吗？")
	var pro;
	if(r){
		$.ajax({
			url:"/uc/booking/delorder?orderid="+orderid,
			async:false,
			success:function(result){
				queryorderlist();
			}
		})
	}
	
	return pro;
}


/****
*个人档案
**/
function ucArchives(){
	showHidden();
	var html="";
  	$.ajax({
  		url:"/uc/seting/query",
  		success:function(data){
  			//console.log(data)
  			html+=`
				<div class="person-archives">
					<div class="archives-header">
	                	个人档案
	            	</div>
					<div class="archives min-height">
		              	<div class="tab-pane fade in active" id="info">
		                	<form role="form" action="/uc/seting/updateinfo" method="post" class="form-horizontal form-info">

								<div class="form-group">
			                    	<label class="col-md-2 control-label">手机</label>
			                    	<div class="col-md-4">
			    `;
			    if(data.mobile!=null&&data.mobile!=undefined&&data.mobile!=""){
			    	html+=`<p class="form-control-static uname">${data.mobile}</p>`;
			    }else{
			    	html+=`<p class="form-control-static uname">未设置</p>`;
			    }
			    html+=`			                    					                      		
                    	</div>
                    </div>
              		<div class="form-group">
                		<label class="col-md-2 control-label">昵称</label>
                    	<div class="col-md-10">
                      		<p class="form-control-static uname">${data.username}</p>
                    	</div>
              		</div>	                  
              		<div class="form-group">
                		<label class="col-md-2 control-label">姓名</label>
                		<div class="col-md-4">
               	`
               	if(data.real_name!=null&&data.real_name!=undefined&&data.real_name!=""){
               		html+=`<input type="text" placeholder="真实姓名" class="form-control" name="real_name" value="${data.real_name}">`;
               	}else{
               		html+=`<input type="text" placeholder="真实姓名" class="form-control" name="real_name">`;
               	}
               	html+=`
                			
                		</div>
              		</div>
		        `;
		    if(data.sex==1){
		    	html+=`
					<div class="form-group">
                		<label class="col-md-2 control-label">性别</label>
                		<div class="col-md-10">
							<label class="radio" style="margin-top: 3px;padding-top: 3px">
	                        	<input type="radio" checked="checked" value="1" name="sex">
	                        	<i></i> 男
                      		</label>
                      		<label class="radio" style="margin-top: 3px;padding-top: 3px">
                      			<input type="radio" value="2" name="sex">
                      			<i></i> 女
                    		</label>
                		</div>
              		</div>
		    	`;
		    }else if(data.sex==2){
		    	html+=`
					<div class="form-group">
                		<label class="col-md-2 control-label">性别</label>
                		<div class="col-md-10">
							<label class="radio" style="margin-top: 3px;padding-top: 3px">
	                        	<input type="radio" value="1" name="sex">
	                        	<i></i> 男
                      		</label>
                      		<label class="radio" style="margin-top: 3px;padding-top: 3px">
                      			<input type="radio" checked="checked" value="2" name="sex">
                      			<i></i> 女
                    		</label>
                		</div>
              		</div>
		    	`;
		    }
		    html+=`     		
          		<div class="form-group">
                    <label class="col-md-2 control-label">生日</label>
                    <div class="col-md-4">
            `;
            var B = time(data.birthday)
            if(data.birthday!=null&&data.birthday!=undefined&&data.birthday!=""){
            	html+=`<input type="text" name="birthday" onblur="birthBlur()" value="${B}" class="form-control masked bir" data-format="9999-99-99" data-placeholder="_" placeholder="年-月-日">`;
            }else{
            	html+=`<input type="text" name="birthday" onblur="birthBlur()" class="form-control masked bir" data-format="9999-99-99" data-placeholder="_" placeholder="年-月-日">`;
            }
            html+=`
                      	
                    </div>
                    <span class="cue"></span>
          		</div>
          		<div class="form-group">
            		<label class="col-md-2 control-label">固定电话</label>
            		<div class="col-md-10   landline-telephone">
            	`;
            if(data.phone_zone!=null&&data.phone_zone!=""){
            	html+=`<input type="text" name="phone_zone" value="${data.phone_zone}" class="area"  data-placeholder="区号" placeholder="区号">`;
            }else{
            	html+=`<input type="text" name="phone_zone" class="area"  data-placeholder="区号" placeholder="区号">`;
            }
            if(data.phone_number!=null&&data.phone_number!=""){
            	html+=`<input type="text" name="phone_number" value="${data.phone_number}" class="telephone"  data-placeholder="电话" placeholder="电话">`;
            }else{
            	html+=`<input type="text" name="phone_number" class="telephone"  data-placeholder="电话" placeholder="电话">`;
            }
            if(data.phone_ext!=null&&data.phone_ext!=""){
            	html+=`<input type="text" name="phone_ext" value="${data.phone_ext}" class="extension"  data-placeholder="分机" placeholder="分机">`;
            }else{
            	html+=`<input type="text" name="phone_ext" class="extension"  data-placeholder="分机" placeholder="分机">`;
            }
           	html+=`                          			              
            		</div>
          		</div>
				<div class="form-group">
                		<label class="col-md-2 control-label">常用出发城市</label>
                		<div class="col-md-10">
                      		<select class="form-control pointer" id="start_province1" name="start_province" style="width: 150px;display: inline-block">
                        		<option value="">--- 省份/直辖市 ---</option>
                        		`;
		    let area = getprovince();
		    $.each(area,function(k,n){
		    	if(n.id == data.start_province){
		    		html+=`					
            			<option value="${n.id}" selected>${n.name}</option>            		
		    		`;
		    	}
		    	html+=`
					
            		<option value="${n.id}">${n.name}</option>
            		
		    	`;
		    }) 
		    
		    html+=`                  		
          		</select>
          		<select class="form-control pointer  " id="start_city1" name="start_city" style="width: 150px;display: inline-block">
          		
          	`;
		    let m = data.start_province;//$(".aside-right").find("#start_province1>option:selected").attr("value");
		    //console.log(m);
		    let city2 = getcity(m);
		    if(m==null||m==""){
		    	html+=`<option value="">--- 城市 ---</option>`;
		    }else{
			    $.each(city2,function(k,n){
			    	if(n.id == data.start_city){
			    		html+=`                    		
	            			<option value="${n.id}" selected>${n.name}</option>                   		
			    		`;
			    	}
			    	html+=`                    		
	            		<option value="${n.id}">${n.name}</option>                   		
			    	`;
			    })
			}
		    html+=`
		                      		</select>
		                      		<p class="arhcives-state">为了更好地帮助您查询、使用花生卷提供的产品，您可以在此设置您的常用出发城市。</p>
	                    		</div>
	                  		</div> 		
	                  		<div class="form-group margin-top-30">
	                    		<div class="col-md-4 col-md-offset-2">
	                      			<button class="btn btn-primary ajax-post" target-form="form-info" type="submit" ><i class="fa fa-check"></i>保存更改 </button>
	                     		</div>
							</div>
	                	</form>
	              	</div>
				</div>	
	        </div>
	       		`;
			$(".aside-right").html(html);

  		}
  	})
}
function getprovince(){
		var pro;
		$.ajax({
			url:"/uc/address/getarea",
			async:false,
			success:function(result){
				pro = result;
			}
		})
		//console.log(pro)
		return pro;
}
function getcity(m){
		var citys;
		$.ajax({
			url:"/uc/address/getarea",
			data:{pid:m},
			async:false,
			success:function(result){
				citys = result;
			}
		})
		//console.log(citys);
		return citys;
}


/****
*头像设置
**/
function ucPortrait(){
	$(".asideRight #set-header").addClass("active").addClass("in");
	$(".aside-right").html("")
	if($(".asideRight #upload-img").hasClass("out")){
		$(".asideRight #upload-img").addClass("out");
		$(".asideRight .show-upload").removeClass("out");
	}
	if($(".asideRight .evaluation-order").hasClass("in")){
		$(".asideRight .evaluation-order").removeClass("active").removeClass("in");
	}        
}	


/****
*我的社区主页
**/
function ucCommunity(){}


/****
*账号安全
**/
function ucAccount(){
	showHidden();
	var html="";
	html=`
      <div class="security-title">
        账号安全
      </div>
      <div class="security-box min-height">
        <div class="alter">
          修改登录密码
        </div>
        <form class="form-password form-horizontal" action="/uc/seting/updatepassword" method="post">

                <div class="form-group">
                  <label class="control-label col-md-2">旧密码</label>
                  <div class="col-md-4">
                  <input type="password" class="form-control" name="oldpassword" placeholder="输入旧密码">
                  </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-md-2">新密码</label>
                  <div class="col-md-4">
                  <input type="password" class="form-control" minlength="6" maxlength="20" name="password" placeholder="密码长度6-20个字符">
                    </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-md-2">确认密码</label>
                  <div class="col-md-4">
                  <input type="password" class="form-control" minlength="6" maxlength="20" name="repassword" placeholder="密码长度6-20个字符">
                    </div>
                </div>

                <div class="form-group margin-top-30">
                  <div class="col-md-4 col-md-offset-2">
                    <button class="btn btn-primary ajax-post" target-form="form-password" type="submit" ><i class="fa fa-check"></i> 确认修改 </button>
                  </div>

                </div>
        </form>
      </div>

  	`;
  	$(".aside-right").html(html);
}


/****
*收藏
**/
function ucCollection(){
	showHidden();
	var html="";
	$.ajax({
		url:"/ajax/focuslist?page=1&limit=8",
		success:function(result){
			//console.log(result.data)
			html+=`
				<div class="collection">
			        <div class="collection-title">
			            收藏
			            <input class="pagetype" type="hidden" value="collection"/>
			        </div>
			        <div class="collection-content min-height clear">
			`;
			html+=collection(result.data)

			html+=`</div>
				</div>`;
			$(".aside-right").html(html)
		}
	})
}
//取消收藏
function cancelCollect(id){
		$.ajax({
		url:"/ajax/focus?id="+id+"&type="+2,
		success:function(result){
			 _toastr(result.data,"top-right","success",false);
			 ucCollection();
		}
	})
}
function collectionPage(page){
	var html="";
	$.ajax({
		url:"/ajax/focuslist?page="+page+"&limit=8",
		success:function(result){
			html = collection(result.data)
			$(".collection-content").html(html)
		}
	})
}
function collection(data){
	var html="";
	var v = data.data
	for(var i=0;i<v.length;i++){
		html+=`
			<div class="collection-box clear">
                <div class="cover-img">
                	<a target="_blank" href="/p/${v[i].question_id}.html">
						<img src="${v[i].productinfo.cover_url}" width="169px" height="108px" alt="">
                	</a>                  
                </div>
                <div class="collection-detail">
                	<a target="_blank" href="/p/${v[i].question_id}.html">
						<span class="product-title">
	                    	${v[i].productinfo.title} 
	                  	</span>
                	</a>
                  <p class="clear">
                    <a href="javascript:cancelCollect(${v[i].question_id});">取消收藏</a>
                    <span class="product-price">￥${v[i].productinfo.price}</span>
                  </p>
                </div>
        	</div>
		`
	}
	html+= pagination(data.currentPage,data.totalPages);
	return html;
}


/****
*常用旅客信息
**/
function ucTraveller(){
	showHidden();
	var html="";
  	$.ajax({
  		url:"/uc/traveller/query",
  		success:function(result){
  			//console.log(result);
  			html+=`
	            <div class="information-title">
	              <span>旅客姓名</span>
	              <input class="search-trave" type="text" placeholder="中文">
	              <a href="javascript:searchTraveller();">查询</a>
	              <a class="add-traveller" href="javascript:addTraveller();">新增</a>
	            </div>

	            <div class="information-list">  
	              <div class="traveller-list clear">
	                <div class="clear">
	                  <a class="col-xs-2">姓名</a>
	                  <a class="col-xs-2">手机/电话</a>
	                  <a class="col-xs-2">证件类型</a>
	                  <a class="col-xs-2">证件号码</a>
	                  <a class="col-xs-1">国籍</a>
	                  <a class="col-xs-1">性别</a>
	                  <a class="col-xs-2">操作</a>
	                </div>
	              </div>			 
	            <div class="detail-information clear min-height3">	            				             
  			`;
  			var  v = result.data;
  			localStorage.setItem("travellerList",JSON.stringify(v));
  			for(var i=0;i<v.length;i++){
  				//console.log(v[i])
  				html+=`												               				              
	               <div class="clear">
	                <input class="addr-checkbox" type="checkbox">
	                <table class="${v[i].id}">
	                    <tr>
	            `;
	            if(v[i].name_zh != "" && v[i].name_zh != undefined){
	            	html+=`<td class="col-xs-2">${v[i].name_zh}</td>`;
	            }else{
	            	html+=`<td class="col-xs-2">${v[i].name_en_last} ${v[i].name_en_first}</td>`
	            }
	            html+=`
	                      
	                      <td class="col-xs-2">${v[i].phone}</td>
	                      <td class="col-xs-2">${v[i].credentials_type_name}</td>
	                      <td class="col-xs-2">${v[i].credentials_value}</td>
	                      <td class="col-xs-1">${v[i].country}</td>
	            `;
	            if(v[i].sexual == 1){
	            	html+=` <td class="col-xs-1">男</td>`;
	            }else if(v[i].sexual == 2){
	            	html+=` <td class="col-xs-1">女</td>`;
	            }
	            html+=`
	                     
	                      <td class="col-xs-2">
	                        <a class="see-traveller" href="javascript:seeTraveller(${i});">查看</a>
	                        <a class="edit-traveller" href="javascript:editTraveller(${i});">编辑</a>
	                        <a href="javascript:deleteTraveller(${v[i].id})">删除</a>
	                      </td>
	                    </tr>
	                </table>
	              </div>
  				`;
  			}
  		html+=`
  				</div>
  				<div class="delete-all">
					<input class="check-all" type="checkbox" />
					<label><span>全选</span><a href="javascript:deleteAllTrave();">X删除</a></label>
				</div>
			</div>
  		`;
  		$(".aside-right").html(html);	
  		}
  	})
}
//查看旅客信息
function seeTraveller(n){
  	var val = JSON.parse(localStorage.getItem("travellerList"));
  	var v = val[n];
  	//console.log(v);
  	var html = "";
  	html += `
		<div class="check-traveller">
          <div class="check-title">
            查看常用旅客信息
          </div>
          <div class="check-information min-height">
            <div>旅客信息</div>
            <ul>
    	`;
    if(v.name_zh=="" || v.name_zh==null){
    	html+=`
			<li>
                <span>中文名</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
            	<span>中文名</span><b>${v.name_zh}</b>
            </li>
    	`;
    }
    if(v.name_en_first=="" ||v.name_en_first==null){
    	html+=`
			<li>
                <span>英文名</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
            	<span>英文名</span><b>${v.name_en_first} ${v.name_en_last}</b>
            </li>
    	`;
    }
    if(v.country=="" || v.country==null){
    	html+=`
			<li>
                <span>国籍</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
            	<span>国籍</span><b>${v.country}</b>
            </li>
    	`;
    }
    if(v.sexual==1){
    	 html+=`			                  
          <li>
            <span>性别</span><b>男</b>
          </li>
     `;
    }else if(v.sexual==2){
    	 html+=`			                  
          <li>
            <span>性别</span><b>女</b>
          </li>
         `;
    } 
    if(v.birthday=="" || v.birthday==null){
    	html+=`
			<li>
                <span>生日</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
                <span>生日</span><b>${v.birthday}</b>
            </li>
    	`;
    } 
    if(v.birthplace=="" || v.birthplace==null){
    	html+=`
			<li>
                <span>出生地</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
                <span>出生地</span><b>${v.birthplace}</b>
            </li>
    	`;
    }
    if(v.phone=="" || v.phone==null){
    	html+=`
			 <li>
                <span>手机号码</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
                <span>手机号码</span><b>${v.phone}</b>
            </li>
    	`;
    }
    if(v.tel_number=="" || v.tel_number==null){
    	html+=`
			<li>
                <span>联系电话</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
                <span>联系电话</span><b>${v.tel_zone} ${v.tel_number} ${v.tel_ext}</b>
            </li>
    	`;
    }
    if(v.fax_number=="" || v.fax_number==null){
    	html+=`
			<li>
                <span>传真号码</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
                <span>传真号码</span><b>${v.fax_zone} ${v.fax_number} ${v.fax_ext}</b>
            </li>
    	`;
    }
    if(v.email == "" || v.email == null){
    	html+=`	             	              	              	              	              
              <li>
                <span>Email</span><b>未设置</b>
              </li>
            </ul>
		`;
    }else{
    	html+=`	             	              	              	              	              
              <li>
                <span>Email</span><b>${v.email}</b>
              </li>
            </ul>
		`;
    }
	if(v.credentials_type==0){
    	html+=`
		   <div>证件信息</div>
            	<ul class="check-certificate clear">
	              <li>
	                <span>证件类型</span><b>护照</b>
	              </li>
    	`;
    }else if(v.credentials_type==1){
    	html+=`
		   <div>证件信息</div>
            <ul class="check-certificate clear">
              <li>
                <span>证件类型</span><b>港澳通行证</b>
              </li>
    	`;
    }else if(v.credentials_type==2){
    	html+=`
		   <div>证件信息</div>
            <ul class="check-certificate clear">
              <li>
                <span>证件类型</span><b>台湾通行证</b>
              </li>
    	`;
    }
    html+=`
              <li>
                <span>证件号码</span><b>${v.credentials_value}</b>
              </li>
              <li><span>有效期</span><b>${v.credentials_validity}</b></li>
            </ul> 
            <a class="go-back" href="javascript:ucTraveller();"><返回</a>
          </div>
         
        </div>

  	`;
  	$(".aside-right").html(html)
}
//编辑旅客信息
function editTraveller(n){
	var html="";
	html+=`
		<div class="new-increase">
          <span class="new-increase1">编辑常用旅客信息</span>
          <span class="new-increase2">请填写如下常用旅客信息,*为必选项</span>
          <a class="new-increase3"  href="javascript:ucTraveller();" >查看所有旅客信息</a>
        </div>    
	`;
	html+=add(n);
	$(".aside-right").html(html);
}
//新增旅客信息
function addTraveller(n){
	var html="";
	html+=`
		<div class="new-increase">
          <span class="new-increase1">新增常用旅客信息</span>
          <span class="new-increase2">请填写如下常用旅客信息,*为必选项</span>
          <a class="new-increase3"  href="javascript:ucTraveller();" >查看所有旅客信息</a>
        </div>    
	`;
	html+=add(n);
	$(".aside-right").html(html);
}
//删除旅客信息
function deleteTraveller(n){
	var r = confirm("您确定要删除旅客信息吗?")
	//console.log(r)
	if(r){
		$.ajax({
	        url:"/uc/traveller/deladdr",
	        data:{id:n},
	        success: function (res) {
	        	console.log(res)
	            if(res.errno == 0){
	               //swal(res.data, "您选择的旅客信息已经被删除.", "success");
	               _toastr("您选择的旅客信息已经被删除","top-right","success",false);
	               ucTraveller();		                		                
	           	}else{
	                //swal(res.errmsg, "您选择的旅客信息删除失败.", "error");
	                 _toastr("您选择的旅客信息删除失败！","top-right","error",false);
	           	}
	    	}
	    })
	}
}
//全选删除
function deleteAllTrave(){
	var a = $(".aside-right .addr-checkbox:checked").siblings("table")
	if(a.length>0){
		var r = confirm("您确定要删除旅客信息吗?")
		var a;
		if(r){
			for(var i=0;i<a.length;i++){
			var k = parseInt(a[i].className);
			  $.ajax({
	            url:"/uc/traveller/deladdr",
        		data:{id:k},
	            success: function (res) {
	                  if(res.errno == 0){
	                       //swal(res.data, "您选择的旅客信息已经被删除.", "success");
	                        _toastr("您选择的旅客信息已经被删除","top-right","success",false);
	                       ucTraveller();                                                    
	                    }else{
	                        //swal(res.errmsg, "您选择的旅客信息删除失败.", "error"); 
	                        _toastr("您选择的旅客信息删除失败！","top-right","error",false);                           
	                    }
	            	}
	        	})
			}
		}
	}else{
		alert("请选择要删除的信息")
	}

}
//回调:旅客编辑主体
function add(n){
	//console.log(n);
	var v ={};
	var val = JSON.parse(localStorage.getItem("travellerList"));
	if(typeof(n) !="undefined" && n < val.length && n >= 0){
		v = val[n];
	}
	//console.log(val);
	if(typeof(v.type) =="undefined" || !v.type){
  		v.type = 0;
  	}
  	if(typeof(v.name_zh) =="undefined" || !v.name_zh){
  		v.name_zh = '';
  	}
  	if(typeof(v.name_en_first) =="undefined" || !v.name_en_first){
  		v.name_en_first = '';
  	}
  	if(typeof(v.name_en_last) =="undefined" || !v.name_en_last){
  		v.name_en_last = '';
  	}
  	if(typeof(v.is_default) =="undefined" || !v.is_default){
  		v.is_default = 0;
  	}
  	if(typeof(v.country) =="undefined" || !v.country){
  		v.country = '';
  	}
  	if(typeof(v.sexual) =="undefined" || !v.sexual){
  		v.sexual = 0;
  	}
  	if(typeof(v.birthday) =="undefined" || !v.birthday){
  		v.birthday = '';
  	}
  	if(typeof(v.birthplace) =="undefined" || !v.birthplace){
  		v.birthplace = '';
  	}
  	if(typeof(v.phone) =="undefined" || !v.phone){
  		v.phone = '';
  	}
  	if(typeof(v.phone_zone) =="undefined" || !v.phone_zone){
  		v.phone_zone = '';
  	}
  	if(typeof(v.phone_external) =="undefined" || !v.phone_external){
  		v.phone_external = '';
  	}
  	if(typeof(v.tel_zone) =="undefined" || !v.tel_zone){
  		v.tel_zone = '';
  	}
  	if(typeof(v.tel_number) =="undefined" || !v.tel_number){
  		v.tel_number = '';
  	}
  	if(typeof(v.tel_ext) =="undefined" || !v.tel_ext){
  		v.tel_ext = '';
  	}
  	if(typeof(v.fax_zone) =="undefined" || !v.fax_zone){
  		v.fax_zone = '';
  	}
  	if(typeof(v.fax_number) =="undefined" || !v.fax_number){
  		v.fax_number = '';
  	}
  	if(typeof(v.fax_ext) =="undefined" || !v.fax_ext){
  		v.fax_ext = '';
  	}
  	if(typeof(v.email) =="undefined" || !v.email){
  		v.email = '';
  	}
  	if(typeof(v.credentials_type) =="undefined" || !v.credentials_type){
  		v.credentials_type = 0;
  	}
  	if(typeof(v.credentials_value) =="undefined" || !v.credentials_value){
  		v.credentials_value = '';
  	}
  	if(typeof(v.credentials_validity) =="undefined" || !v.credentials_validity){
  		v.credentials_validity = '';
  	}
  	//console.log(v);
  	//console.log(v.id);
  	var html = ""; 
	html += `
		<div class="increase-content">
	  		<div class="increase-title">旅客信息</div>
	  		<form onsubmit="return check()" action="/uc/traveller/addaddr"  mothod="post" class="edit-trav form-info">
	  			<div class="col-md-offset-2 ce">*中文名与英文名两者必填一项</div>
	  			<div class="form-group clear">
				    <label class="col-md-2 control-label" for="">中文名</label>
				    <span class="star">*</span>
				    <div class="col-md-4">
	        			<input class="form-control masked chinese-name" onblur="unameBlur()" maxlength="20" type="text" placeholder="请输入中文姓名" name="name_zh" value=${v.name_zh}>	        			
	    			</div>    
	    			<span class="cue col-md-5"></span>                                          
	  			</div>
				<div class="form-group clear">
				    <label class="col-md-2 control-label" for="">英文名</label>
				    <span class="star">*</span>
				    <div class="col-md-2 clear">
				      <input class="form-control masked first-name" onblur="unameBlur()" maxlength="20" type="text" placeholder="FirsName(名)" name="name_en_first" value=${v.name_en_first}>
				    </div>
			    	<div class="col-md-2 clear">
			      		<input class="form-control masked last-name" onblur="unameBlur()" maxlength="20" type="text" placeholder="LastName(姓)" name="name_en_last" value=${v.name_en_last}>
			    	</div>
			  	</div>
				<div class="col-md-offset-2 self">
				    <input class="checkself" type="checkbox" >设置为本人
				    <input class="self" type="hidden" name="is_default" value/>
				</div>
	  
				<div class="form-group clear">
				    <label class="col-md-2 control-label" for="">国籍</label>
				    <span class="star">*</span>
				    <div class="col-md-4">
				      	<input class="form-control masked nationality" onblur="nationalityBlur()" type="text" placeholder="中文/英文" name="country" value=${v.country}>
				    </div>
				    <span class="cue col-md-5"></span>                 
				</div>
			  <div class="form-group clear">
			    <label class="col-md-2 control-label">性别</label>
			    <span class="star">*</span>
			    <div class="col-md-10">
			      <label class="radio" style="margin-top: 3px;padding-top: 3px">
			      `;
			if(v.sexual == 1){
				html+=`<input type="radio" value="1" name="sexual" checked> <i></i> 男`;
			}else{
				html+=`<input type="radio" value="1" name="sexual"> <i></i> 男`;
			}
			html+=`      </label>
			      <label class="radio" style="margin-top: 3px;padding-top: 3px">
			     `;
			if(v.sexual == 2){
				html+=`<input type="radio" value="2" name="sexual" checked>
			        <i></i> 女`;
			}else{
				html+=`<input type="radio" value="2" name="sexual">
			        <i></i> 女`;
			}
			html+=`      </label>
			      </div>
			           
			  </div>
			  <div class="form-group clear">
			    <label class="col-md-2 control-label">生日</label>
			    <div class="col-md-4">
			      <input type="text" name="birthday" onblur="birthBlur()" value="${v.birthday}" class="form-control masked bir" data-format="9999-99-99" data-placeholder="_" placeholder="年-月-日">
			      <input type="hidden" name="type" class="type-name" value />
			    </div>
			    <span class="cue col-md-5"></span>  
			  </div>
			  <div class="form-group clear">
			    <label class="col-md-2 control-label" for="">出生地</label>
			    <div class="col-md-4">
			      <input class="form-control masked" type="text" name="birthplace" value="${v.birthplace}">
			    </div>                
			  </div>
			  <div class="form-group clear">
			    <label class="col-md-2 control-label">手机号码</label>
			    <span class="star">*</span>
			    <div class="col-md-4">
			      <input type="text" name="phone" onblur="phoneBlur()" value="${v.phone}" class="form-control masked phone-confir" data-format="99999999999" data-placeholder="X" placeholder="大陆手机" maxlength="11">
			    </div>
			    <span class="cue col-md-5"></span>  
			  </div>
			  <div class="form-group clear">
			    <label class="col-md-2 control-label">非大陆号码</label>
			    <div class="col-md-3">
			      <input type="text" name="phone_zone" value="${v.phone_zone}" class="form-control masked" data-format="99999999999" data-placeholder="X" placeholder="中国香港825" maxlength="11">
			     
			    </div>
			    <div class="col-md-3">
			        <input type="text" name="phone_external" value="${v.phone_external}" class="form-control masked" data-format="99999999999" data-placeholder="X" placeholder="非大陆手机" maxlength="11">
			    </div>
			  </div>
			  <div class="form-group clear">
			    <label class="col-md-2 control-label">联系电话</label>
			    <div class="col-md-10   landline-telephone">
			        <input type="text" name="tel_zone" value="${v.tel_zone}" class="area" maxlength="4" data-placeholder="区号" placeholder="区号">
			        <input type="text" name="tel_number" value="${v.tel_number}" class="telephone" maxlength="8"  data-placeholder="电话" placeholder="电话">
			        <input type="text" name="tel_ext" value="${v.tel_ext}" class="extension" maxlength="4"  data-placeholder="分机" placeholder="分机">
			    </div>
			  </div>
			  <div class="form-group clear">
			    <label class="col-md-2 control-label">传真号码</label>
			    <div class="col-md-10   landline-telephone">
			        <input type="text" name="fax_zone" value="${v.fax_zone}" class="area" maxlength="4"  data-placeholder="区号" placeholder="区号">
			        <input type="text" name="fax_number" value="${v.fax_number}" class="telephone" maxlength="8" data-placeholder="电话" placeholder="电话">
			        <input type="text" name="fax_ext" value="${v.fax_ext}" class="extension" maxlength="4" data-placeholder="分机" placeholder="分机">
			    </div>
			  </div>
			 <div class="form-group clear">
			    <label class="col-md-2 control-label" for="">Email</label>
			    <div class="col-md-4">
			      <input class="form-control masked email-confir" onblur="emailBlur()" type="email" name="email" value="${v.email}">
			    </div> 
			    <span class="cue col-md-5"></span>                 
			  </div>
			  <div class="form-group clear">
			    <div class="credentials">
			      证件信息
			    </div>
			    <label class="col-md-2 control-label" for="">证件类型</label>
			    <span class="star">*</span>
			    <div class="col-md-2">		
			      <select class="form-control credentials-select" name="credentials_type" id="">
		`;
			
	if(v.credentials_type == 0){
		html += `<option value="0" selected>护照</option>`;
	}else{
		html += `<option value="0">护照</option>`;
	}
	if(v.credentials_type == 1){
		html += `<option value="1" selected>港澳通行证</option>`;
	}else{
		html += `<option value="1">港澳通行证</option>`; 
	}
	if(v.credentials_type == 2){
		html += `<option value="2" selected>台湾通行证</option>`;
	}else{
		html += `<option value="2">台湾通行证</option>`;
	}		
			
			
	html +=`
	      </select>

	    </div> 
	    <label class="lf control-label credentials-num" for="">证件号码</label>
	    <span class="star">*</span>
	    <div class="lf" style="width:15%;margin-left:12px;margin-right:12px">
	      <input class="form-control cre-confir" onblur="creBlur()" type="text" name="credentials_value" value="${v.credentials_value}"> 
	    </div>  
	                
	    <label class="lf control-label credentials-num" for="">有效期</label>
	    <div class="lf" style="width:13%;margin-left:12px;margin-right:12px">
	      <input class="form-control validity-confir" onblur="validityBlur()" type="text" placeholder="yyyy-mm-dd" name="credentials_validity" value="${v.credentials_validity}">      
	    </div> 
	    <span class="cue cre-validity"></span>
	                                 
	  </div>

	  <div class="form-group margin-top-30 clear">
		    <div class="col-md-2 col-md-offset-2">
	`;
	if(v.id != undefined){
		html += `
	 		<input type="hidden" name="id" value="${v.id}">
		`;
	}		   
	html += `
	        <button class="btn btn-primary ajax-post sub-increase" type="submit" ><i class="fa fa-check"></i> 保存 </button>
	    </div>
	     <div class="col-md-2">
	      <button class="btn btn-primary" target-form="form-info" type="reset" > 取消 </button>
	    </div>
	  </div>


	</form>
	</div>
	`;
	return html;
}
//搜索旅客
function searchTraveller(){
	var uname = $("input.search-trave").val()
	$.ajax({
		url:"/uc/traveller/query?q="+uname,
		success:function(result){
			//console.log(result.data);
			var v = result.data;
			var html = "";
			for(var i=0;i<v.length;i++){
  				//console.log(v[i])
  				html+=`												               				              
	               <div class="clear">
	                <input class="addr-checkbox" type="checkbox">
	                <table class="${v[i].id}">
	                    <tr>
	            `;
	            if(v[i].name_zh != "" && v[i].name_zh != undefined){
	            	html+=`<td class="col-xs-1">${v[i].name_zh}</td>`;
	            }else{
	            	html+=`<td class="col-xs-1">${v[i].name_en_last} ${v[i].name_en_first}</td>`
	            }
	            html+=`
	                      
	                      <td class="col-xs-2">${v[i].phone}</td>
	                      <td class="col-xs-2">${v[i].credentials_type_name}</td>
	                      <td class="col-xs-3">${v[i].credentials_value}</td>
	                      <td class="col-xs-1">${v[i].country}</td>
	            `;
	            if(v[i].sexual == 1){
	            	html+=` <td class="col-xs-1">男</td>`;
	            }else if(v[i].sexual == 2){
	            	html+=` <td class="col-xs-1">女</td>`;
	            }
	            html+=`
	                     
	                      <td class="col-xs-2">
	                        <a class="see-traveller" href="javascript:seeTraveller(${i});">查看</a>
	                        <a class="edit-traveller" href="javascript:editTraveller(${i});">编辑</a>
	                        <a href="javascript:deleteTraveller(${v[i].id})">删除</a>
	                      </td>
	                    </tr>
	                </table>
	              </div>
  				`;
  			}
  			$(".detail-information").html(html);
		}
	})
}

/****
*联系人表单验证
**/
//姓名验证
function unameBlur(){
	var cname = $(".aside-right .chinese-name").val();
	var lname = $(".aside-right .last-name").val();
	var fname = $(".aside-right .first-name").val();
	//console.log(cname)
	if(cname == "" && (lname == "" || fname == "")){
		$(".aside-right .chinese-name").parent().siblings("span.cue").html("X 中文名与英文名两者必填一项")
	}else{
		$(".aside-right .chinese-name").parent().siblings("span.cue").html("");
		return true;
	}
}
//国籍验证
function nationalityBlur(){
	var nationality = $(".aside-right .nationality").val();
	var reg = /\d+/g
	if(nationality == ""){
		$(".aside-right .nationality").parent().siblings("span.cue").html("X 请输入您的国籍")
	}else if(reg.test(nationality)){
		$(".aside-right .nationality").parent().siblings("span.cue").html("X 请输入正确的国籍")
	}else{
		$(".aside-right .nationality").parent().siblings("span.cue").html("")
		return true;
	}
}
//生日验证
function birthBlur(){
	var birth = $(".aside-right .bir").val();
	var reg = /^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$/
	if(birth == ""){
		$(".aside-right .bir").parent().siblings("span.cue").html("")
	}else if(!reg.test(birth)){
		$(".aside-right .bir").parent().siblings("span.cue").html("X 请按YYYY-MM-DD的格式输入正确的日期")
	}else{
		$(".aside-right .bir").parent().siblings("span.cue").html("")
	}
}
//手机号码验证
function phoneBlur(){
	var ph = $(".aside-right .phone-confir").val();
	var reg = /^1[3|4|5|7|8][0-9]{9}$/
	if(ph == ""){
		$(".aside-right .phone-confir").parent().siblings("span.cue").html("X 请输入手机号码")
	}else if(!reg.test(ph)){
		$(".aside-right .phone-confir").parent().siblings("span.cue").html("X 请输入正确的手机号码")
	}else{
		$(".aside-right .phone-confir").parent().siblings("span.cue").html("")
		return true;
	}
}
//非大陆手机号验证

//联系电话验证

//传真验证

//email验证
function emailBlur(){
	var email = $(".aside-right .email-confir").val();
	var reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/;
	if(email == ""){
		$(".aside-right .email-confir").parent().siblings("span.cue").html("")
	}else if(!reg.test(email)){
		$(".aside-right .email-confir").parent().siblings("span.cue").html("X 请输入正确的邮箱")
	}else{
		$(".aside-right .email-confir").parent().siblings("span.cue").html("")
	}
}
//证件号码验证
function creBlur(){
	var cre = $(".aside-right .cre-confir").val();
	if(cre == ""){
		$(".aside-right .cre-confir").parent().siblings("span.cre-validity").html("X 请输入证件号码")
	}else{
		$(".aside-right .cre-confir").parent().siblings("span.cre-validity").html("");
		return true;
	}
}
function validityBlur(){
	var val = $(".aside-right .validity-confir").val();
	var reg = /^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$/
	if(val == ""){
		$(".aside-right .validity-confir").parent().siblings("span.cre-validity").html("X 请输入有效期")
	}else if(!reg.test(val)){
		$(".aside-right .validity-confir").parent().siblings("span.cre-validity").html("X 请按YYYY-MM-DD输入")
	}else{
		$(".aside-right .validity-confir").parent().siblings("span.cre-validity").html("")
	}
}

//表单提交
$(".aside-right").on("click","button.sub-increase",function(e){
	if($(".checkself").is(":checked")){
		$(".self").val(1);
	}else{
		$(".self").val(0);
	}
	var birthday = $(".aside-right .bir").val();
	var birth = new Date(birthday).getTime(); 
	var current = new Date().getTime();
	if(birthday != "" && birthday != undefined && birthday != null ){
		var time = current - birth;
		if(time > 0 && time < 31536000000){
			$(".aside-right .type-name").val("2");
		}else if(time >= 31536000000 && time < 567648000000){
			$(".aside-right .type-name").val("1");
		}else if(time >= 567648000000){
			$(".aside-right .type-name").val("0");
		}
	}else{
		$(".aside-right .type-name").val("0");
	}
	//console.log(time);
	//console.log($(".aside-right .type-name").val())

	if(!unameBlur()){
		$(".aside-right .chinese-name").parent().siblings("span.cue").html("X 中文名与英文名两者必填一项");
	}else if(!nationalityBlur()){
		$(".aside-right .nationality").parent().siblings("span.cue").html("X 请输入您的国籍");
	}else if(!phoneBlur()){
		$(".aside-right .phone-confir").parent().siblings("span.cue").html("X 请正确输入手机号码");
	}else if(!creBlur()){
		$(".aside-right .cre-confir").siblings("span.cre-num").html("X 请输入证件号码");
	}else{
		var data = $(".aside-right").find("form.edit-trav").serialize();
		//console.log(data);
		$.ajax({
		     type: "POST", 
		     url: "/uc/traveller/addaddr",
		     data: data,
		     success: function(msg){ 
		     	//console.log(msg)
		           if(msg.errno == 0){
		            	_toastr("保存成功","top-right","success",false);	            
		           }else{
		               _toastr("编辑失败！","top-right","error",false); 
		           }
		            } 
		});
	}
})


/****
*常用地址
**/
function ucAddress(){
	showHidden();
	var html="";
	$.ajax({
		url:"/uc/address/query",
		success:function(result){
			//console.log(result);
			html+=`
	            <div class="information-title">
	              <span>关键字</span>
	              <input class="search-addr" type="text" placeholder="收件人/中文">
	              <a href="javascript:searchAddress();">查询</a>
	              <a href="javascript:addAddress();">新增</a>
	            </div>

	            <div class="information-list min-height">  
	              <div class="traveller-list clear">
	                <div class="clear">
	                	
	                  <a class="col-xs-2">收件人</a>
	                  <a class="col-xs-1">省份</a>
	                  <a class="col-xs-1">城市</a>
	                  <a class="col-xs-5">详细地址</a>
	                  <a class="col-xs-1">邮编</a>
	                  <a class="col-xs-2">操作</a>
	                </div>
	              </div>
	            <div class="detail-information">
	             
			`;
			var  v = result.data;
			localStorage.setItem("addressList",JSON.stringify(v));
			//console.log(v);
			for(var i=0;i<v.length;i++){
				html+=`												               				              
	                <div class="clear">
		                <input class="addr-checkbox" type="checkbox">
		                <table class="${v[i].id}">
		                    <tr>
		                      <td class="col-xs-2">${v[i].accept_name}</td>
		                      <td class="col-xs-1">${v[i].province}</td>
		                      <td class="col-xs-1">${v[i].city}</td>		               
		                      <td class="col-xs-5">${v[i].addr}</td>
		                      <td class="col-xs-1">${v[i].zip}</td>
		                      <td class="col-xs-2">
		                        <a class="see-address" href="javascript:seeAddress(${i})">查看</a>
		                        <a href="javascript:editAddress(${i});">编辑</a>
		                        <a href="javascript:deleteAddr(${v[i].id})">删除</a>
		                      </td>
		                    </tr>
		                </table>
	             	</div>
	           
				`;
			}
			html+=` 
					</div>
					<div class="delete-all">
						<input class="check-all" type="checkbox" />
						<label><span>全选</span><a href="javascript:deleteAll();">X删除</a></label>
					</div>
				</div>
			`;
		$(".aside-right").html(html);	
		}
	})
}
//查看地址信息
function seeAddress(n){
	var val = JSON.parse(localStorage.getItem("addressList"));
	var m = val[n];
	var html="";
	html+=`
	<div class="check-address">
      <div class="check-title">
        查看常用地址
      </div>
      <div class="check-information min-height padding-top-30">
        <ul>
	`;
	if(m.county==null||m.county==""){
		html+=`
			<li><span>地址简称</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>地址简称</span><b>${m.sortname}</b></li>
		`;
	}
	if(m.accept_name==null||m.accept_name==""){
		html+=`
			<li><span>收件人姓名</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>收件人姓名</span><b>${m.accept_name}</b></li>
		`;
	}
	if(m.city==null||m.city==""){
		html+=`
			<li><span>所在地区</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>所在地区</span><b>${m.city}</b></li>
		`;
	}
	if(m.addr==null||m.addr==""){
		html+=`
			<li><span>详细地址</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>详细地址</span><b>${m.addr}</b></li>
		`;
	} 
	 if(m.zip==null|| m.zip==""){
		html+=`
			<li><span>邮政编码</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>邮政编码</span><b>${m.zip}</b></li>
		`;
	}  
	if(m.mobile==null||m.mobile==""){
		html+=`
			<li><span>手机号码</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>手机号码</span><b>${m.mobile}</b></li>
		`;
	}             
	if(m.phone_number==null||m.phone_number==""){
		html+=`
			<li><span>联系电话</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>联系电话</span><b>${m.phone_number}</b></li>
		`;
	}           
	          	          
	html+=`          		              		              
        </ul>
        <a class="go-back" href="javascript:ucAddress();"> <返回 </a>
      </div>
    </div>
	`;
	$(".aside-right").html(html)
}
//编辑地址信息
function editAddress(n){
	var val = JSON.parse(localStorage.getItem("addressList"));
	var m = {};
	if(typeof(n) !="undefined" && n < val.length && n >= 0){
		m = val[n];
		//console.log(m);
	}
	if(m.sortname == null || !m.sortname){
  		m.sortname = "";
  	}
  	if(m.accept_name == null || !m.accept_name){
  		m.accept_name = "";
  	}
  	if(m.addr == null || !m.addr){
  		m.addr = "";
  	}
  	if(m.zip == null || !m.zip){
  		m.zip = "";
  	}
  	if(m.mobile == null || !m.mobile){
  		m.mobile == "";
  	}
  	if(m.phone_zone == null || !m.phone_zone){
  		m.phone_zone = "";
  	}
  	if(m.phone_number == null || !m.phone_number){
  		m.phone_number = "";
  	}
  	if(m.phone_ext == null || !m.phone_ext){
  		m.phone_ext = "";
  	}
	//console.log(m)
	var html=`
		<div calss="add-address">
          	<div class="check-title">
            	编辑常用地址信息
          	</div>
          	<div class="add-content min-height">
            	<form role="form" action="/uc/address/addaddr" mothod="post" class="form-horizontal form-info edit-addr">

	                <div class="form-group clear">
	                <label class="col-md-2 control-label" for="">地址简称</label>
		                <div class="col-md-4">
		                    <input class="form-control masked addr-confir" onblur="addrBlur()" type="text" placeholder='如"家"，"我的公司"等' name="sortname" value=${m.sortname}>
		                </div>  
		                <span class="cue"></span>                                            
	                </div>

              <div class="form-group clear">
                <label class="col-md-2 control-label" for="">收件人姓名</label>
                <div class="col-md-4 clear">
                  <input class="form-control masked acc-confir" onblur="acceptBlur()" type="text" placeholder=""  name="accept_name" value=${m.accept_name}>
                </div>
                <span class="cue"></span>
              </div>
              
              <div class="form-group clear">
                <label class="col-md-2 control-label">所在地区</label>
                <div class="col-md-10">
                  <select class="form-control pointer sel-pro" onblur="proBlur()" id="start_province1" name="province" style="width: 150px;display: inline-block">
                    <option value="省份">-- 省份/直辖市 --</option>
        `;

        let area = getprovince();
		    $.each(area,function(k,n){
		    	if(n.id == m.province_num){
		    		html+=`					
            			<option value="${n.id}" selected>${n.name}</option>            		
		    		`;
		    	}
		    	html+=`					
            		<option value="${n.id}">${n.name}</option>            		
		    	`;
		    }) 

        html += `
                  </select>省
                  <select class="form-control pointer" id="start_city1" name="city" style="width: 150px;display: inline-block">
                    <option value="城市">-- 城市 --</option> 
            `;
        //let a = $(".aside-right").find("#start_province1>option:selected").attr("value");
        // if(a == "" || a == undefined){
        // 	let c = m.province_num;
        // 	console.log(c);
        // }else{
        // 	let c = a;
        // }
	    let c = m.province_num;
	    let city2 = getcity(c);
	    $.each(city2,function(k,n){
	    	if(n.id == m.city_num){
	    		html+=`                    		
        			<option value="${n.id}" selected>${n.name}</option>                   		
	    		`;
	    	}
	    	html+=`                    		
        		<option value="${n.id}">${n.name}</option>                   		
	    	`;
	    })    

        html += ` 
                  </select>市
                  <span class="cue"></span>
                </div>
              </div>  

              <div class="form-group clear">
                <label class="col-md-2 control-label" for="">详细地址</label>
                <div class="col-md-6 clear">
                  <input class="form-control masked addr-det" onblur="addressBlur()" type="text" placeholder=""  name="addr" value=${m.addr}>
                </div>
                <span class="cue"></span>
              </div>

               <div class="form-group clear">
                <label class="col-md-2 control-label" for="">邮政编码</label>
                <div class="col-md-4 clear">
                  <input class="form-control masked zip-confir" onblur="zipBlur()" type="text" maxlength="6" placeholder=""  name="zip" value=${m.zip}>
                </div>
                <span class="cue"></span>
              </div>

              <div class="col-md-offset-2 ce">手机号码与联系电话两者必填一项</div>

              <div class="form-group clear">
                <label class="col-md-2 control-label">手机号码</label>
                <div class="col-md-4">
                  <input type="text" maxlength="11" name="mobile" onblur="phoneBlur()" value="${m.mobile}" class="form-control masked phone-confir" data-format="99999999999" data-placeholder="X" placeholder="大陆手机">
                </div>
                <span class="cue"></span>
              </div>

              <div class="form-group clear">
                <label class="col-md-2 control-label">联系电话</label>
                <div class="col-md-10   landline-telephone">
                    <input type="text" name="phone_zone" maxlength="4" value="${m.phone_zone}" class="area"  data-placeholder="区号" placeholder="区号">
                    <input type="text" name="phone_number" maxlength="8" value="${m.phone_number}" class="telephone"  data-placeholder="电话" placeholder="电话">
                    <input type="text" name="phone_ext" maxlength="4" value="${m.phone_ext}" class="extension"  data-placeholder="分机" placeholder="分机">
                </div>
              </div>

               <div class="form-group margin-top-30 clear">
                <div class="col-md-2 col-md-offset-2">
        `;
        if(m.id != undefined){
			html += `
		 		<input type="hidden" name="id" value="${m.id}">
			`;
		}		 
		html += `
                  <button class="btn btn-primary ajax-post sub-addr" type="submit" ><i class="fa fa-check"></i> 保存 </button>
                </div>
              </div>

            </form>

          </div>
        </div>
		`;
	$(".aside-right").html(html)
}
//新增地址信息
function addAddress(){
	var html=`
		<div calss="add-address">
          	<div class="check-title">
            	新增常用地址信息
          	</div>
          	<div class="add-content min-height">
            	<form role="form" action="/uc/address/addaddr" mothod="post" class="form-horizontal form-info edit-addr">

	                <div class="form-group clear">
	                <label class="col-md-2 control-label" for="">地址简称</label>
		                <div class="col-md-4">
		                    <input class="form-control masked addr-confir" onblur="addrBlur()" type="text" maxlength="20" placeholder='如"家"，"我的公司"等' name="sortname">
		                </div>
		                <span class="cue"></span>                                               
	                </div>

              <div class="form-group clear">
                <label class="col-md-2 control-label" for="">收件人姓名</label>
                <div class="col-md-4 clear">
                  <input class="form-control masked acc-confir" onblur="acceptBlur()" type="text" maxlength="20" placeholder="" name="accept_name">
                </div>
                <span class="cue"></span>
              </div>
              
              <div class="form-group clear">
                <label class="col-md-2 control-label">所在地区</label>
                <div class="col-md-10">
                  <select class="form-control pointer sel-pro" onblur="proBlur()" id="start_province1" name="province" style="width: 150px;display: inline-block">
                    <option value="省份">-- 省份/直辖市 --</option>
        `;
        let area = getprovince();
		    $.each(area,function(k,n){
		    	html+=`					
            		<option value="${n.id}">${n.name}</option>            		
		    	`;
		    }) 

        html += `                    
                  </select>省
                  <select class="form-control pointer  " id="start_city1" name="city" style="width: 150px;display: inline-block">
                    
        `;

        let m = $(".aside-right").find("#start_province1>option:selected").attr("value");
		    //console.log(m);
		if(m == "" || m == undefined){
			html += `<option value="城市">-- 城市 --</option>`; 
		}else{
			let city2 = getcity(m);
		    $.each(city2,function(k,n){
		    	html+=`                    		
            		<option value="${n.id}">${n.name}</option>                   		
		    	`;
		    })
		}
		   

        html += `  
                  </select>市
                  <span class="cue"></span>
                </div>
              </div>  

              <div class="form-group clear">
                <label class="col-md-2 control-label" for="">详细地址</label>
                <div class="col-md-6 clear">
                  <input class="form-control masked addr-det" onblur="addressBlur()" type="text" placeholder="" name="addr">
                </div>
                <span class="cue"></span>
              </div>

               <div class="form-group clear">
                <label class="col-md-2 control-label" for="">邮政编码</label>
                <div class="col-md-4 clear">
                  <input class="form-control masked zip-confir" onblur="zipBlur()" type="text" maxlength="6" placeholder=""  name="zip">
                </div>
                <span class="cue"></span>
              </div>

              <div class="col-md-offset-2 ce">手机号码与联系电话两者必填一项</div>

              <div class="form-group clear">
                <label class="col-md-2 control-label">手机号码</label>
                <div class="col-md-4">
                  <input type="text" name="mobile" class="form-control masked phone-confir" onblur="phoneBlur()" data-format="99999999999" data-placeholder="X" placeholder="大陆手机" maxlength="11">
                </div>
                <span class="cue"></span>
              </div>

              <div class="form-group clear">
                <label class="col-md-2 control-label">联系电话</label>
                <div class="col-md-10   landline-telephone">
                    <input type="text" name="phone_zone" " class="area" maxlength="4"  data-placeholder="区号" placeholder="区号">
                    <input type="text" name="phone_number"  class="telephone" maxlength="8"  data-placeholder="电话" placeholder="电话">
                    <input type="text" name="phone_ext"  class="extension" maxlength="4" data-placeholder="分机" placeholder="分机">
                </div>
              </div>

               <div class="form-group margin-top-30 clear">
                <div class="col-md-2 col-md-offset-2">
                   <button class="btn btn-primary ajax-post sub-addr" type="submit" ><i class="fa fa-check"></i> 保存 </button>
                </div>
              </div>

            </form>

          </div>
        </div>
		`;
	$(".aside-right").html(html)
}
//查询地址
function searchAddress(){
	var uname = $(".search-addr").val();
	var html = "";
	$.ajax({
		url:"/uc/address/query?q="+uname,
		success:function(result){
			var  v = result.data;
			for(var i=0;i<v.length;i++){
				html+=`												               				              
	                <div class="clear">
		                <input class="addr-checkbox" type="checkbox">
		                <table class="${v[i].id}">
		                    <tr>
		                      <td class="col-xs-1">${v[i].accept_name}</td>
		                      <td class="col-xs-2">${v[i].province}</td>
		                      <td class="col-xs-2">${v[i].city}</td>
		                      <td class="col-xs-1">${v[i].county}</td>
		                      <td class="col-xs-3">${v[i].addr}</td>
		                      <td class="col-xs-1">${v[i].zip}</td>
		                      <td class="col-xs-2">
		                        <a class="see-address" href="javascript:seeAddress(${i})">查看</a>
		                        <a href="javascript:editAddress(${i});">编辑</a>
		                        <a href="javascript:deleteAddr(${v[i].id})">删除</a>
		                      </td>
		                    </tr>
		                </table>
	             	</div>	           
				`;
			}
			$(".detail-information").html(html);
		}
	})
}
//全选功能
$(".aside-right").on("click",".check-all",function(){
	if($(this).is(":checked")){
        $('.aside-right .addr-checkbox').prop("checked",true);
        

    }else{
        $('.aside-right .addr-checkbox').prop("checked",false);
       
    }
})
//删除地址信息
function deleteAddr(n){
	var r = confirm("您确定要删除该收货地址吗?")
	//console.log(r)
	if(r){
		$.ajax({
	        url:"/uc/address/deladdr",
	        data:{id:n},
	        success: function (res) {
	        	console.log(res)
	            if(res.errno == 0){
	               //swal(res.data, "您选择的旅客信息已经被删除.", "success");
	               _toastr("您选择的地址已经被删除.","top-right","success",false);
	               ucAddress() ;		                		                
	           	}else{
	                //swal(res.errmsg, "您选择的旅客信息删除失败.", "error");
	                 _toastr("您选择的地址删除失败！","top-right","error",false);
	           	}
	    	}
	    })
	}
}
//全选删除地址信息
function deleteAll(){
	var a = $(".aside-right .addr-checkbox:checked").siblings("table")
	if(a.length>0){
		var r = confirm("您确定要删除该收货地址吗?")
		var a;
		if(r){
			for(var i=0;i<a.length;i++){
			var k = parseInt(a[i].className);
			  $.ajax({
	            url:"/uc/address/deladdr",
        		data:{id:k},
	            success: function (res) {
	                  if(res.errno == 0){
	                       //swal(res.data, "您选择的旅客信息已经被删除.", "success");
	                        _toastr("您选择的地址已经被删除.","top-right","success",false);
	                       ucAddress();                                                    
	                    }else{
	                        //swal(res.errmsg, "您选择的旅客信息删除失败.", "error"); 
	                        _toastr("您选择的地址删除失败！","top-right","error",false);                           
	                    }
	            	}
	        	})
			}
		}
	}else{
		alert("请选择要删除的信息")
	}	
}
/****
*地址表单验证
**/
//地址简称
function addrBlur(){
	var addr = $(".aside-right .addr-confir").val();
	if(addr == ""){
		$(".aside-right .addr-confir").parent().siblings("span.cue").html("X 请输入地址简称")
	}else{
		$(".aside-right .addr-confir").parent().siblings("span.cue").html("");
		return true;
	}
}
//收件人
function acceptBlur(){
	var acce = $(".aside-right .acc-confir").val();
	if(acce == ""){
		$(".aside-right .acc-confir").parent().siblings("span.cue").html("X 请输入收件人姓名")
	}else{
		$(".aside-right .acc-confir").parent().siblings("span.cue").html("")
		return true;
	}
}
//省份
function proBlur(){
	var addr = $(".aside-right .sel-pro").val();
	if(addr == "省份"){
		$(".aside-right .sel-pro").siblings("span.cue").html(" X 请选择")
	}else{
		$(".aside-right .sel-pro").siblings("span.cue").html("")
		return true;
	}
}
//详细地址
function addressBlur(){
	var addr = $(".aside-right .addr-det").val();
	if(addr == ""){
		$(".aside-right .addr-det").parent().siblings("span.cue").html("X 请输入详细地址")
	}else{
		$(".aside-right .addr-det").parent().siblings("span.cue").html("");
		return true;
	}
}
//邮编
function zipBlur(){
	var zip = $(".aside-right .zip-confir").val();
	if(zip == ""){
		$(".aside-right .zip-confir").parent().siblings("span.cue").html("X 请输入邮编")
	}else{
		$(".aside-right .zip-confir").parent().siblings("span.cue").html("")
		return true;
	}
}
//表单提交验证
$(".aside-right").on("click",".sub-addr",function(){
	var data = $(".aside-right").find("form.edit-addr").serialize();
		//console.log(data);
	if(!addrBlur()){
		$(".aside-right .addr-confir").parent().siblings("span.cue").html("X 请输入地址简称")
	}else if(!acceptBlur()){
		$(".aside-right .acc-confir").parent().siblings("span.cue").html("X 请输入收件人姓名")
	}else if(!proBlur()){
		$(".aside-right .sel-pro").siblings("span.cue").html(" X 请选择")
	}else if(!addressBlur()){
		$(".aside-right .addr-det").parent().siblings("span.cue").html("X 请输入详细地址")
	}else if(!zipBlur()){
		$(".aside-right .zip-confir").parent().siblings("span.cue").html("X 请输入邮编")
	}else if(!phoneBlur() && $(".telephone").val() == ""){
		//console.log($(".telephone").val())
		$(".aside-right .phone-confir").parent().siblings("span.cue").html("X 请选择一项输入")
	}else{
		$.ajax({
		     type: "POST", 
		     url: "/uc/address/addaddr",
		     data: data,
		     success: function(msg){ 
		     	//console.log(msg)
		           if(msg.errno == 0){
		            	_toastr("保存成功","top-right","success",false);	            
		           }else{
		               _toastr("编辑失败！","top-right","error",false); 
		           }
		            } 
		});
	}
		
})


/****
*优惠券
**/
function ucCoupon(){
	showHidden();

	var html="";
  	html+=`
		<div class="coupon-title clear">
            <span>优惠券</span>
            <div>
              <span class="add">添加新的优惠券</span>
              <input class="add-coupon" type="text" placeholder="输入16位优惠券验证码" maxlength="16">
              <a href="javascript:addCoupon();">添加</a>
            </div>
         </div>
         <div class="coupon-content">
            <div class="table-list coupon-list">
                  <a>序列号/卡号</a>
                  <a>面值/折扣</a>
                  <a>截止有效时间</a>
                  <a>使用状态</a>
            </div>
            
            <div class="table-responsive coupon min-height2">        
  	`;
  	$.ajax({
  		url:"/uc/booking/discountquery",
  		success:function(data){
  			localStorage.setItem("mcoupon",JSON.stringify(data));
  			var coupon = JSON.parse(localStorage.getItem("mcoupon"));
  			var m = data.length;
  			//console.log(coupon)
  			var N=0;
  			$.each(data,function(k,v){
  				
  				var date1 = v.validity_date;
  				var validity1 = time(date1)
  				var current1 = new Date().getTime();
  				if(date1>current1){
  					N++;
  				}
  				return N;
  			})
  			html+=`
				<div class="coupon-count">
	                <b>所有优惠券</b>
	                <span>(共<a href=""> ${m} </a>个,可用优惠券<a href=""> ${N} </a>个)</span>
	            </div>
  			`;
  			$.each(data,function(k,v){
  				var date = v.validity_date;
  				var validity = time(date)
  				var current = new Date().getTime();
  				//console.log(current);
  				html+=`
				
			              <table>
			                <tr>
			                  <td>${v.code}</td>
			                  <td>￥${v.price}</td>
			                  <td>${validity}</td>
			    `;
			    if(date>current){
			    	html+=`
						<td> <a href="">可用</a> </td>
					    </tr>
					  </table>
			    	`;
			    }else if(date<current){
			    	html+=`
						<td> <a href="">已失效</a> </td>
					    </tr>
					  </table>
			    	`;
			    }					                  					       					         
  			})
  			html+=` 
					</div>
	         </div>`
	         ;
  			$(".aside-right").html(html);
  		}
  	})
}
//添加优惠券
function addCoupon(){
	var coupon = $(".aside-right .add-coupon").val()
	//var pro;
	$.ajax({
		url:"/uc/booking/discountadd/code/"+coupon,
		async:false,
		success:function(result){
			if(result.errno == 1000){
				_toastr(result.errmsg,"top-right","error",false);
				ucCoupon();
			}else if(result.errno == 0){
				_toastr(result.data,"top-right","success",false);
				ucCoupon();
			}
		}
	});
	//console.log(pro)
	//return pro;
}
//更改时间格式
function time(date){
	var newdate = new Date(date)
	var y = newdate.getFullYear();  
	var m = newdate.getMonth() + 1;  
	m = m < 10 ? ('0' + m) : m;  
	var d = newdate.getDate();  
	d = d < 10 ? ('0' + d) : d;  
	var h = newdate.getHours();  
	var minute = newdate.getMinutes();  
		minute = minute < 10 ? ('0' + minute) : minute;  
	//var time = y + '-' + m + '-' + d+' '+h+':'+minute;
	var time = y + '-' + m + '-' + d
	return time;  
}


/****
*消息
**/
function ucMessage(){}