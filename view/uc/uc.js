$(function(){
	function uname(){
		$.ajax({
			url:"/uc/seting/query",
			success:function(result){
				localStorage.setItem("username",JSON.stringify(result.username));
			}
		})
	}
	uname();
	function main(){
		var html = "";
		var uname = JSON.parse(localStorage.getItem("username"));
		html+= '<div class="order-handing">'+
					'<div class="order-title">'+
		              	'<img src="/uc/index/avatar"  class=" rounded" alt="'+uname+'" style="width: 65px" />'+
			            '<span>'+uname+'</span>'+
			            //'<a class="btn btn-info apply" href="">申请成为商家</a>'+
		          	'</div>'+
		          	'<div class="order-content min-height">'+
		          		'<div class="table-list">'+
			                '<a class="all-order" href="javascript:allOrder();">全部订单</a>'+
			                //'<a class="not-start">未出行</a>'+
			                //'<a class="obligation-order">待付款</a>'+
			                //'<a class="pending-evaluation">待评价</a>'+
		        		'</div>'+
		        		'<div class="table-responsive order-table">'
		    ;
		var orderDataList = localStorage.getItem("odrerData");
		orderDataList = JSON.parse(orderDataList);
			for(var i=0;i<orderDataList.length;i++){
				//console.log(orderDataList[i])
				//console.log(i)
				var v = orderDataList[i];
				html+=resultEach(v,i);
			}
		html+=`							
				</div>
          	</div>
        </div>
			`;
		$(".aside-right").html(html);     
	}
	main();

})
/****
*订单
**/
function ucOrder(){
	queryorderlist();
}
//全部订单
function allOrder(){
	var html="";
      	$.ajax({
      		url:"/uc/booking/query",
      		success:function(result){
      			$.each(result.data,function(k,v){      				
      				html+= resultEach(v);	
      			})
      			$(".order-table").html(html);
      		}
      	})
}
//订单详情
function orderDetail(n){
	var html="";
  	//var orderdata = orderdetail();
  	var orderDataList = localStorage.getItem("odrerData");
	orderDataList = JSON.parse(orderDataList);
  	var orderDataDetail = orderDataList[n];
  	console.log(orderDataDetail);
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
	              <div class="order-select">                           
	                <button>取消订单</button> 
	              </div>         
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
	              <p>
	                <span>出发城市上海</span>
	                <span>出发日期${orderDataDetail.start_date}</span>
	                <span>返回日期${orderDataDetail.end_time}</span>
    `;
	var travellersinfo = JSON.parse(orderDataDetail.travellersinfo);
	var n=0;
	var m=0;
	$.each(travellersinfo,function(k,v){
		
		if(v.type == 1){
			n++;
		}else if(v.type == 2){
			m++
		}
	})

	 html +=`            
	 				<span>${n}成人,${m}儿童</span>  
	                <span>金额:￥${orderDataDetail.order_amount}</span>
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

	//console.log(travellersinfo)
	$.each(travellersinfo,function(k,v){
		//console.log(k)
		//console.log(v)
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
                  <p>旅客</p>
                  <span>儿童</span>
                </div>       
            `;

		}
		html+=`
			<ul>
              <li>
                <b>中文姓名</b><span>${v.name_zh}</span>
              </li>
              <li>
                <b>英文姓名</b><span>xxxxxxx</span>
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
//未出行
function notStart(){}
//待付款
function obligationOrder(){}
//待评价
function pendingEvaluation(){}
//回调：订单列表
function queryorderlist(){
	var html="";
	$.ajax({
		url:"/uc/booking/query?page=1",
		success:function(result){
			localStorage.setItem("odrerData",JSON.stringify(result.data));
			var uname = JSON.parse(localStorage.getItem("username"));
			console.log(result.data)
			//console.log(result)
			html=
  			'<div class="order-handing">'+
				'<div class="order-title">'+
	              	'<img src="/uc/index/avatar"  class=" rounded" alt="'+uname+'" style="width: 65px" />'+
		            '<span>'+uname+'</span>'+
		            //'<a class="btn btn-info apply" href="">申请成为商家</a>'+
	          	'</div>'+
	          	'<div class="order-content min-height">'+
	          		'<div class="table-list">'+
		                '<a class="all-order">全部订单</a>'+
		                //'<a class="not-start">未出行</a>'+
		                //'<a class="obligation-order">待付款</a>'+
		                //'<a class="pending-evaluation">待评价</a>'+
	        		'</div>'+
	        		'<div class="table-responsive order-table">'								
	        		;
			// $.each(result.data,function(k,v){
			// 	//console.log(v);
			
			// 	html+=resultEach(v);

			// })


			var orderDataList = localStorage.getItem("odrerData");
		orderDataList = JSON.parse(orderDataList);
			for(var i=0;i<orderDataList.length;i++){
				//console.log(orderDataList[i])
				//console.log(i)
				var v = orderDataList[i];
				html+=resultEach(v,i);

			}
			html+=`							
				</div>
          	</div>
        </div>
			`;
			$(".aside-right").html(html);     				
		}
	})	
};
//回调:订单内容
function resultEach(v,i){		
	var h="";
	h+=`
		<table>
		<tr>
			<td>
              	订单号：<a href="#" target="_blank">${v.order_no}</a>
            </td>
            <td>姓名</td>
            <td>出发日期</td>
            <td>总金额</td>
            <td>订单状态</td>
            <td>操作</td>
		</tr>
		<tr>
		<td>
          	<a class="goodsItem" target="_blank" href="/p/${v.product_id}.html">${v.title}</a>
        </td>
        <td>
			<span>${v.connect_name}</span>
        </td>
        <td>${v.start_date}</td>
        <td>￥${v.order_amount}</td>
	`;
	/*
	if(v.pay_status == 0 && v.delivery_status != 1 && v.status != 6 && v.status != 4){
    	h+=`
			<td>
				<span class="text-warning">已提交</span>
				<br />
				<a class="order-detail" href="${i}">订单详情</a>
			</td>
            <td>
				<a class="btn btn-danger btn-xs" href="/uc/pay/pay?order=${v.id}" target="_blank"><i class="fa fa-credit-card white"></i>立即付款 </a>
            </td>
			</tr>
			</table>													
    	`;
    }else if((v.pay_status == 1 || v.status ==3) && v.delivery_status != 1 && v.status != 6 && v.status != 4){
    	h+=`
			<td>
				<span class="text-warning">等待发货</span>
				<br />
				<a class="order-detail" href="${i}">订单详情</a>
			</td>
            <td>
				<a class="btn btn-warning btn-xs" href="#"><i class="fa fa-cart-plus white"></i>提醒发货 </a>
            </td>
		</tr>	
		</table>												
    	`;
    }else if(v.delivery_status == 1 && v.status != 6 && v.status != 4){
    	h+=`
			<td>
				<span class="text-success">等待收货</span>
				<br />
				<a class="order-detail" href="${i}">订单详情</a>
			</td>
            <td>
				<a class="btn btn-success btn-xs confirm ajax-get" href="/uc/order/confirmreceipt/id/${v.id}"><i class="fa fa-cart-plus white"></i>确认收货 </a>
            </td>
		</tr>
		</table>													
    	`;
    }else if(v.status == 6){
    	h+=`
			<td>
				<span class="text-danger">已取消</span>
				<br />
				<a class="order-detail" href="${i}">订单详情</a>
			</td>
            <td>
				 <a class="btn btn-default btn-xs" href="#"><i class="fa fa-cart-plus white"></i>再次购买 </a>
            </td>
		</tr>
		</table>													
    	`;
    }else if( v.status == 4){
    	h+=`
			<td>
				<span class="text-default">已完成</span>
				<br />
				<a class="order-detail" href="${i}">订单详情</a>
			</td>
            <td>
				 <a class="btn btn-default btn-xs" href="#"><i class="fa fa-cart-plus white"></i>再次购买 </a>
            </td>
		</tr>
		</table>													
    	`;
    }
    */
    //temp rewrite

    if(v.status == 2){
        h+=`
				<td>
					<span class="text-warning">${v.status_desc}</span><br>
					<a class="order-detail" href="javascript:orderDetail(${i})">查看详情 </a> 
				</td>
                <td>
                
				<a  href="javascript:cannelorder(${v.order_no});" >取消订单 </a><br>
				<a  href="javascript:;" >查看行程 </a>
                </td>
				</tr>
				</table>													
        	`;
    }else if(v.status == 3){
    	h+=`
				<td>
					<span class="text-warning" style="color:#afa79c !important">${v.status_desc}</span><br>
					<a class="order-detail" href="javascript:orderDetail(${i})">查看详情 </a>
				</td>
                <td>
					<a  href="javascript:;" >查看行程 </a>

                </td>
				</tr>
				</table>													
        	`;
    }else{
    	h+=`
				<td>
					<span class="text-warning">${v.status_desc}</span><br>
					<a class="order-detail" href="javascript:orderDetail(${i})">查看详情 </a> <br>
				</td>
                <td>
               
				<a  href="javascript:cannelorder(${v.order_no});" >取消订单 </a><br>
				<a  href="javascript:;" >查看行程 </a>
                </td>
				</tr>
				</table>													
        	`;
    }
	return h;		
}
//取消订单
function cannelorder(orderid){
		console.log(orderid);
		var pro;
		$.ajax({
			url:"/uc/booking/cannelorder?orderid="+orderid,
			async:false,
			success:function(result){
				console.log(result);
				queryorderlist();
			}
		});
		//console.log(pro)
		return pro;
};


/****
*个人档案
**/
function ucArchives(){
	var html="";
  	$.ajax({
  		url:"/uc/seting/query",
  		success:function(data){
  			console.log(data)
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
			                    		<p class="form-control-static uname">${data.phone_number}</p>
			                      		
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
		                    			<input type="text" placeholder="真实姓名" class="form-control" name="real_name" value="${data.real_name}">
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
                      	<input type="text" name="birthday" value="${data.birthday}" class="form-control masked" data-format="9999-99-99" data-placeholder="_" placeholder="年-月-日">
                    </div>
          		</div>
          		<div class="form-group">
            		<label class="col-md-2 control-label">固定电话</label>
            		<div class="col-md-10   landline-telephone">
              			<input type="text" name="phone_zone" value="${data.phone_zone}" class="area"  data-placeholder="区号" placeholder="区号">
              			<input type="text" name="phone_number" value="${data.phone_number}" class="telephone"  data-placeholder="电话" placeholder="电话">
              			<input type="text" name="phone_ext" value="${data.phone_ext}" class="extension"  data-placeholder="分机" placeholder="分机">
            		</div>
          		</div>
				<div class="form-group">
                		<label class="col-md-2 control-label">常用出发城市</label>
                		<div class="col-md-10">
                      		<select class="form-control pointer  " id="start_province1" name="start_province" style="width: 150px;display: inline-block">
                        		<option value="">--- 省份/直辖市 ---</option>
                        		`;
		    let area = getprovince();
		    $.each(area,function(k,n){
		    	html+=`
					
            		<option value="${n.id}">${n.name}</option>
            		
		    	`;
		    }) 
		    
		    html+=`                  		
          		</select>
          		<select class="form-control pointer  " id="start_city1" name="start_city" style="width: 150px;display: inline-block">
          	`;
		    let m = $("#start_province1 option:selected").val;
		    let city2 = getcity(m);
		    $.each(city2,function(k,n){
		    	html+=`                    		
            		<option value="${n.id}">${n.name}</option>                   		
		    	`;
		    })
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
	var html="";

	html=`
	 <div class="head-title">
      头像设置
     </div>
     <div class="add-picture min-height">
  
         <div class="" id="avatar-modal" aria-labelledby="avatar-modal-label" >
           <div class="">
             <div class="">
               <form class="avatar-form"  enctype="multipart/form-data" method="post">

                 <div class="modal-body">
                   <div class="avatar-body">
                    <div class="avatar-upload">
                       <input class="avatar-src" name="avatar_src" type="hidden">
                       <input class="avatar-data" name="avatar_data" type="hidden">

                       </div>
                     <div class="fancy-file-upload fancy-file-primary">
                       <b class="upload">头像</b>
                      
                       <input type="file" class="form-control avatar-input" id="avatarInput" name="file" onchange="jQuery(this).next('input').val(this.value);" />
                      
                       <span class="button">上传图片</span>
                       <span class="upload">仅支持jpg.gif.png格式图片,且文件小于2M</span>
                     </div>
                     <div class="row">

                      <div class="col-md-6 col-md-offset-1">
                        <div class="avatar-wrapper"></div>
                       </div>
                       <div class="col-md-4" style="vertical-align: bottom">
                         <div class="avatar-preview preview-lg"><img src="/uc/index/avatar"  alt="{{controller.user.username}}" /></div>
                         <div class="avatar-preview preview-md"><img src="/uc/index/avatar"  alt="{{controller.user.username}}" /></div>
                         <div class="avatar-preview preview-sm"><img src="/uc/index/avatar"  alt="{{controller.user.username}}" /></div>
                       </div>

                     </div>
                     <div class="row avatar-btns">
                       <div class="col-md-3">
                        <button class="btn btn-primary btn-block avatar-save" type="submit"><i class="fa fa-save"></i> 保存修改</button>
                       </div>
                       <div class="col-md-9">
                         <div class="btn-group">
                           <button class="btn" data-method="rotate" data-option="-90" type="button" title="Rotate -90 degrees"><i class="fa fa-undo"></i> 向左旋转</button>
                         </div>
                         <div class="btn-group">
                           <button class="btn" data-method="rotate" data-option="90" type="button" title="Rotate 90 degrees"><i class="fa fa-repeat"></i> 向右旋转</button>
                         </div>
                       </div>

                     </div>
                   </div>
                 </div>
               </form>
             </div>
           </div>
         </div>

         <div class="loading" aria-label="Loading" role="img" tabindex="-1"></div>
    
     </div>
	`;
    $(".aside-right").html(html);         
}	


/****
*我的社区主页
**/
function ucCommunity(){}


/****
*账号安全
**/
function ucAccount(){
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
                  <input type="password" class="form-control" name="password" placeholder="密码长度6-20个字符">
                    </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-md-2">确认密码</label>
                  <div class="col-md-4">
                  <input type="password" class="form-control" name="repassword" placeholder="密码长度6-20个字符">
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
function ucCollection(){}


/****
*常用旅客信息
**/
function ucTraveller(){
	var html="";
  	$.ajax({
  		url:"/uc/traveller/query",
  		success:function(result){
  			//console.log(result);
  			html+=`
	            <div class="information-title">
	              <span>旅客姓名</span>
	              <input type="text" placeholder="中文/英文">
	              <a>查询</a>
	              <a class="add-traveller" href="javascript:addTraveller();">新增</a>
	            </div>

	            <div class="information-list">  
	              <div class="traveller-list clear">
	                <div class="clear">
	                  <a class="col-xs-1">姓名</a>
	                  <a class="col-xs-2">手机/电话</a>
	                  <a class="col-xs-2">证件类型</a>
	                  <a class="col-xs-3">证件号码</a>
	                  <a class="col-xs-1">国籍</a>
	                  <a class="col-xs-1">性别</a>
	                  <a class="col-xs-2">操作</a>
	                </div>
	              </div>				            				             
  			`;
  			var  v = result.data;
  			localStorage.setItem("travellerList",JSON.stringify(v));
  			for(var i=0;i<v.length;i++){
  				console.log(v[i])
  				html+=`												               				              
	                <div class="detail-information clear min-height">
	                <input type="checkbox">
	                <table>
	                    <tr>
	                      <td class="col-xs-1">${v[i].name_zh}</td>
	                      <td class="col-xs-2">${v[i].phone}</td>
	                      <td class="col-xs-2">${v[i].credentials_type_name}</td>
	                      <td class="col-xs-3">${v[i].credentials_value}</td>
	                      <td class="col-xs-1">${v[i].country}</td>
	                      <td class="col-xs-1">${v[i].type_name}</td>
	                      <td class="col-xs-2">
	                        <a class="see-traveller" href="javascript:seeTraveller(${i});">查看</a>
	                        <a class="edit-traveller" href="javascript:editTraveller();">编辑</a>
	                        <a href="">删除</a>
	                      </td>
	                    </tr>
	                </table>
	              </div>
  				`;
  			}
  		html+=`
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
  	console.log(v);
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
    if(v.name_zh==null){
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
    if(v.name_en_first==null){
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
    if(v.country==null){
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
    if(v.sexual==0){
    	 html+=`			                  
          <li>
            <span>性别</span><b>男</b>
          </li>
     `;
    }else if(v.sexual==1){
    	 html+=`			                  
          <li>
            <span>性别</span><b>女</b>
          </li>
         `;
    } 
    if(v.birthday==null){
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
    if(v.birthplace==null){
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
    if(v.phone==null){
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
    if(v.tel_number==null){
    	html+=`
			<li>
                <span>联系电话</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
                <span>联系电话</span><b>${v.tel_number}</b>
            </li>
    	`;
    }
    if(v.fax_number==null){
    	html+=`
			<li>
                <span>传真号码</span><b>未设置</b>
            </li>
    	`;
    }else{
    	html+=`
			<li>
                <span>传真号码</span><b>${v.fax_number}</b>
            </li>
    	`;
    }
   	html+=`	             	              	              	              	              
              <li>
                <span>Email</span><b>XXX</b>
              </li>
            </ul>
		`;
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
              <li><span>有效期</span><b>XXXXXXXXXXX</b></li>
            </ul> 
            <a class="go-back" href=""><返回</a>
          </div>
         
        </div>

  	`;
  	$(".aside-right").html(html)
}
//编辑旅客信息
function editTraveller(){
	var html="";
	html+=`
		<div class="new-increase">
          <span class="new-increase1">编辑常用旅客信息</span>
          <span class="new-increase2">请填写如下常用旅客信息,*为必选项</span>
          <span class="new-increase3">查看所有旅客信息</span>
        </div>    
	`;
	html+=add();
	$(".aside-right").html(html);
}
//新增旅客信息
function addTraveller(){
	var html="";
	html+=`
		<div class="new-increase">
          <span class="new-increase1">新增常用旅客信息</span>
          <span class="new-increase2">请填写如下常用旅客信息,*为必选项</span>
          <span class="new-increase3">查看所有旅客信息</span>
        </div>    
	`;
	html+=add();
	$(".aside-right").html(html);
}

//回调:旅客编辑主体
function add(){
	var html=`
		<div class="increase-content">
	  		<div class="increase-title">旅客信息</div>
	  		<form action="">
	  			<div class="col-md-offset-2 ce">*中文名与英文名两者必填一项</div>
	  			<div class="form-group clear">
				    <label class="col-md-2 control-label" for="">中文名</label>
				    <span class="star">*</span>
				    <div class="col-md-4">
	        			<input class="form-control masked" type="text" placeholder="请输入中文姓名">
	    			</div>                                              
	  			</div>
				<div class="form-group clear">
				    <label class="col-md-2 control-label" for="">英文名</label>
				    <span class="star">*</span>
				    <div class="col-md-2 clear">
				      <input class="form-control masked" type="text" placeholder="LastName(姓)">
				    </div>
			    	<div class="col-md-2 clear">
			      		<input class="form-control masked" type="text" placeholder="FirsName(名)">
			    	</div>
			  	</div>
				<div class="col-md-offset-2 self">
				    <input type="checkbox">设置为本人
				</div>
	  
				<div class="form-group clear">
				    <label class="col-md-2 control-label" for="">国籍</label>
				    <span class="star">*</span>
				    <div class="col-md-4">
				      	<input class="form-control masked" type="text" placeholder="中文/英文">
				    </div>               
				</div>
	  <div class="form-group">
	    <label class="col-md-2 control-label">性别</label>
	    <span class="star">*</span>
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
	  <div class="form-group clear">
	    <label class="col-md-2 control-label">生日</label>
	    <div class="col-md-4">
	      <input type="text" name="birthday" value="{{userInfo.birthday|dateformat('Y-m-d')}}" class="form-control masked" data-format="9999-99-99" data-placeholder="_" placeholder="年-月-日">
	    </div>
	  </div>
	  <div class="form-group clear">
	    <label class="col-md-2 control-label" for="">出生地</label>
	    <div class="col-md-4">
	      <input class="form-control masked" type="text">
	    </div>                
	  </div>
	  <div class="form-group clear">
	    <label class="col-md-2 control-label">手机号码</label>
	    <span class="star">*</span>
	    <div class="col-md-4">
	      <input type="text" name="mobile" value="{{userInfo.mobile}}" class="form-control masked" data-format="99999999999" data-placeholder="X" placeholder="大陆手机">
	    </div>
	  </div>
	  <div class="form-group clear">
	    <label class="col-md-2 control-label">非大陆号码</label>*
	    <div class="col-md-3">
	      <input type="text" name="mobile" value="{{userInfo.mobile}}" class="form-control masked" data-format="99999999999" data-placeholder="X" placeholder="中国香港825">
	     
	    </div>
	    <div class="col-md-2">
	        <input type="text" name="mobile" value="{{userInfo.mobile}}" class="form-control masked" data-format="99999999999" data-placeholder="X" placeholder="非大陆手机">
	    </div>
	  </div>
	  <div class="form-group clear">
	    <label class="col-md-2 control-label">联系电话</label>
	    <div class="col-md-10   landline-telephone">
	        <input type="text" name="phone_zone" value="{data.phone_zone}" class="area"  data-placeholder="区号" placeholder="区号">
	        <input type="text" name="phone_number" value="{data.phone_number}" class="telephone"  data-placeholder="电话" placeholder="电话">
	        <input type="text" name="phone_ext" value="{data.phone_ext}" class="extension"  data-placeholder="分机" placeholder="分机">
	    </div>
	  </div>
	  <div class="form-group clear">
	    <label class="col-md-2 control-label">传真号码</label>
	    <div class="col-md-10   landline-telephone">
	        <input type="text" name="phone_zone" value="{data.phone_zone}" class="area"  data-placeholder="区号" placeholder="区号">
	        <input type="text" name="phone_number" value="{data.phone_number}" class="telephone"  data-placeholder="电话" placeholder="电话">
	        <input type="text" name="phone_ext" value="{data.phone_ext}" class="extension"  data-placeholder="分机" placeholder="分机">
	    </div>
	  </div>
	 <div class="form-group clear">
	    <label class="col-md-2 control-label" for="">Email</label>
	    <div class="col-md-4">
	      <input class="form-control masked" type="text">
	    </div>                
	  </div>
	  <div class="form-group clear">
	    <div class="credentials">
	      证件信息
	    </div>
	    <label class="col-md-2 control-label" for="">证件类型</label>
	    <span class="star">*</span>
	    <div class="col-md-2">
	      <input class="form-control " type="text">
	    </div> 
	    <label class="col-md-1 control-label credentials-num" for="">证件号码</label>
	    <span class="star">*</span>
	    <div class="col-md-3">
	      <input class="form-control " type="text">
	    </div>                
	    <label class="col-md-1 control-label credentials-num" for="">有效期</label>
	    <div class="col-md-2">
	      <input class="form-control " type="text" placeholder="yyyy-mm-dd">
	    </div>                               
	  </div>

	  <div class="form-group margin-top-30 clear">
	    <div class="col-md-2 col-md-offset-2">
	      <button class="btn btn-primary ajax-post" target-form="form-info" type="submit" ><i class="fa fa-check"></i> 保存 </button>
	    </div>
	     <div class="col-md-2">
	      <button class="btn btn-primary ajax-post" target-form="form-info" type="submit" > 取消 </button>
	    </div>
	  </div>


	</form>
	</div>
	`;
	return html;
}


/****
*常用地址
**/
function ucAddress(){
	var html="";
	$.ajax({
		url:"/uc/address/query",
		success:function(result){
			//console.log(result);
			html+=`
	            <div class="information-title">
	              <span>旅客姓名</span>
	              <input type="text" placeholder="中文/英文">
	              <button>查询</button>
	              <button>新增</button>
	            </div>

	            <div class="information-list">  
	              <div class="traveller-list clear">
	                <div class="clear">
	                	
	                  <a class="col-xs-1">收件人</a>
	                  <a class="col-xs-2">省份</a>
	                  <a class="col-xs-2">城市</a>
	                  <a class="col-xs-1">区县</a>
	                  <a class="col-xs-3">详细地址</a>
	                  <a class="col-xs-1">邮编</a>
	                  <a class="col-xs-2">操作</a>
	                </div>
	              </div>
	            
	             
			`;
			var  v = result.data;
			localStorage.setItem("addressList",JSON.stringify(v));
			for(var i=0;i<v.length;i++){
				html+=`												               				              
	                <div class="detail-information clear">
	                <input type="checkbox">
	                <table>
	                    <tr>
	                      <td class="col-xs-1">${v[i].accept_name}</td>
	                      <td class="col-xs-2">${v[i].province}</td>
	                      <td class="col-xs-2">${v[i].city}</td>
	                      <td class="col-xs-1">${v[i].county}</td>
	                      <td class="col-xs-3">${v[i].addr}</td>
	                      <td class="col-xs-1">${v[i].zip}</td>
	                      <td class="col-xs-2">
	                        <a class="see-address" href="javascript:seeAddress(${i});">查看</a>
	                        <a href="">编辑</a>
	                        <a href="">删除</a>
	                      </td>
	                    </tr>
	                </table>
	              </div>
	           
				`;
			}
			html+=`
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
	if(m.county==null){
		html+=`
			<li><span>地址简称</span><b>XXX</b></li>
		`;
	}else{
		html+=`
			<li><span>地址简称</span><b>XXX</b></li>
		`;
	}
	if(m.accept_name==null){
		html+=`
			<li><span>收件人姓名</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>收件人姓名</span><b>${m.accept_name}</b></li>
		`;
	}
	if(m.city==null){
		html+=`
			<li><span>所在地区</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>所在地区</span><b>${m.city}</b></li>
		`;
	}
	if(m.addr==null){
		html+=`
			<li><span>详细地址</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>详细地址</span><b>${m.addr}</b></li>
		`;
	} 
	 if(m.zip==null){
		html+=`
			<li><span>邮政编码</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>邮政编码</span><b>${m.zip}</b></li>
		`;
	}  
	if(m.mobile==null){
		html+=`
			<li><span>手机号码</span><b>未设置</b></li>
		`;
	}else{
		html+=`
			<li><span>手机号码</span><b>${m.mobile}</b></li>
		`;
	}             
	if(m.phone_number==null){
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
        <a class="go-back" href=""> <返回 </a>
      </div>
    </div>
	`;
	$(".aside-right").html(html)
}
//编辑地址信息
//新增地址信息


/****
*优惠券
**/
function ucCoupon(){
	var html="";
  	html+=`
		<div class="coupon-title clear">
            <span>优惠券</span>
            <div>
              <span class="add">添加新的优惠券</span>
              <input type="text" placeholder="输入16位优惠券验证码">
              <button>添加</button>
            </div>
         </div>
         <div class="coupon-content">
            <div class="table-list coupon-list">
                  <a>序列号/卡号</a>
                  <a>面值/折扣</a>
                  <a>截止有效时间</a>
                  <a>使用状态</a>
            </div>
            
            <div class="table-responsive coupon min-height">        
  	`;
  	$.ajax({
  		url:"/uc/booking/discountquery",
  		success:function(data){
  			localStorage.setItem("mcoupon",JSON.stringify(data));
  			var coupon = JSON.parse(localStorage.getItem("mcoupon"));
  			var m = data.length;
  			console.log(coupon)
  			html+=`
				<div class="coupon-count">
	                <b>所有优惠券</b>
	                <span>(共<a href=""> ${m} </a>个,可用优惠券<a href=""> N </a>个)</span>
	            </div>
  			`;
  			$.each(data,function(k,v){
  				var date = v.validity_date;
  				var validity = time(date)
  				var current = new Date().getTime();
  				console.log(current)
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
	var time = y + '-' + m + '-' + d+' '+h+':'+minute;
	return time;  
}


/****
*消息
**/
function ucMessage(){}