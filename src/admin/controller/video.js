// +----------------------------------------------------------------------
// | PeanutRoll [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.peanutroll.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: zhengqsh <zhengqsh@126.com>
// +----------------------------------------------------------------------

'use strict';

import Base from './base.js';
import pagination from 'think-pagination';

export default class extends Base{
	init(http){
	    super.init(http);
	    this.tactive = "video";
	}
	/**
	*indexAction
	*/
	async indexAction(){
		let sortid = this.get('sortid')||0;
		//获取用户组
		let user = {'status': ['>', -1]}
		let userlist = await this.model("member").field("username").where(user).order('id DESC').select();	
		//获取电影信息
		let moviedata = await this.model("document_video").join({
				        table: "document",
				        join: "left", // 有 left,right,inner 3 个值
				        as: "document",
				        on: ["id", "id"]
				    }).page(1,30).order("document.id DESC").countSelect();

		let movielist = moviedata.data;
		////console.log(movielist);
		//获取电影分类信息
		let cate_id = 162;//电影分类
		let sort = await this.model("category").get_category(cate_id, 'documentsorts');
		//console.log(sort)
		if(sort){
			sort = JSON.parse(sort);
			if(sortid==0){
                sortid=sort.defaultshow;
            }
			let typevar = await this.model("typevar").where({sortid:sortid}).select();
			//console.log(typevar)
			for (let val of typevar){
				val.option= await this.model("typeoption").where({optionid:val.optionid}).find();
			    if(val.option.type == 'select' ||val.option.type == 'radio'){
			        if(!think.isEmpty(val.option.rules)){
			            val.option.rules = JSON.parse(val.option.rules);
			            val.rules=parse_type_attr(val.option.rules.choices);
			            val.option.rules.choices = parse_config_attr(val.option.rules.choices);
			            ////console.log(val.rules);
			        }
			    }else if(val.option.type == 'checkbox'){
			        if(!think.isEmpty(val.option.rules)){
			            val.option.rules = JSON.parse(val.option.rules);
			            val.rules=parse_type_attr(val.option.rules.choices);
			            //console.log(val.rules);
			            for(let v of val.rules){
			              	v.id = "l>"+v.id
			            }
			            val.option.rules.choices = parse_config_attr(val.option.rules.choices);
			            ////console.log(val.rules);
			        }
			    }else if(val.option.type == 'range'){
			        if(!think.isEmpty(val.option.rules)){
			            let searchtxt = JSON.parse(val.option.rules).searchtxt;
			            let searcharr = []
			            if(!think.isEmpty(searchtxt)){
			              	let arr = searchtxt.split(",");
			              	let len = arr.length;
			              	for (var i=0;i<len;i++){
				                let obj = {}
				                if (!think.isEmpty(arr[i-1])){
				                  	if(i==1){
					                    obj.id = 'd>'+arr[i];
					                    obj.name = '小于'+arr[i];
					                    obj.pid=0
					                    searcharr.push(obj);
				                  	}else {
					                    obj.id = arr[i-1]+'>'+arr[i];
					                    obj.name = arr[i-1]+"-"+arr[i];
					                    obj.pid=0
					                    searcharr.push(obj)
				                  	}

				                }
			              	}
			              	searcharr.push({id:'u>'+arr[len-1],name:arr[len-1]+'以上',pid:0})
			            }
			            ////console.log(searcharr);
			            val.option.rules = JSON.parse(val.option.rules);
			            val.rules=searcharr;
			            // val.option.rules.choices = parse_config_attr(val.option.rules.choices);
			        }
        		}
			}
			console.log(typevar)
			this.assign("typevar",typevar)
		}
		console.log(moviedata)
        let html = pagination(moviedata, this.http, {
	      desc: true, //show description
	      pageNum: 2,
	      url: 'javascript:;', //page url, when not set, it will auto generated
	      class: 'nomargin', //pagenation extra class
	      text: {
	        next: '下一页',
	        prev: '上一页',
	        total: '电影数量: ${count} , 总页数: ${pages}'
	      }
	    });
	    console.log('html:'+html)
	    this.assign("pagerData",html)
		this.assign({
            "navxs": true,
        });
        this.assign("userlist",userlist);
        this.assign("movielist",movielist);
		this.meta_title = '用户视频';
		return this.display();
	}
	/**
	*查询电影列表
	*/
	async moviedataAction(){
		let uname = this.post("uname") || "";
		let can_view = this.post("can_view") || 0;//0显示全部
		let classify = this.post("classify") || "all";
		let supplier = this.post("supplier") || "all";
		let page = this.post("page") || 1;
		let moviedata,collectlist;
		let cate_id = 162;//电影分类
		let sortid = this.get('sortid')||0;
		let pnum = this.post('pnum') || 30;
		let map = {};
		let tmp = [];
		let arr = [];

		if(!think.isEmpty(classify) && classify !=="all"){
			map.movietype =  ['like', '%'+'"'+classify+'"'+'%'];
		}
		if(!think.isEmpty(supplier) && supplier !=="all"){
			map.supplier = supplier;
		}

		let sort = await this.model("category").get_category(cate_id, 'documentsorts');
		//console.log(sort)
		if (sort) {
			sort = JSON.parse(sort);
			if(sortid==0){
		        sortid=sort.defaultshow;
		    }
			let table = "type_optionvalue"+sortid;
			if(!think.isEmpty(can_view) && can_view == 1){//只查询当前用户已添加
				if(!think.isEmpty(uname)){
					map.user_name = uname;
					map.able_watch = ['!=', null];
					//查询电影数据
					moviedata = await this.model("document_video").alias('a').join({
									table: "document",
							        join: "left", // 有 left,right,inner 3 个值
							        as: "document",
							        on: ["id", "id"]
								}).join({
							        table: table,
							        join: "left", // 有 left,right,inner 3 个值
							        as: "t",
							        on: ["id", "tid"]
							    }).join({
							    	table:"document_user_movie",
							    	join:"left",
							    	as:"c",
							    	on:["id", "able_watch"]
							    }).where(map).page(page,pnum).order('document.id DESC').countSelect();
					if(!think.isEmpty(moviedata.data)){
						let movielist = moviedata.data
						for(var j=0;j<movielist.length;j++){
							//添加标识，判断用户是否已添加该影片：0--否，1--是
							movielist[j].can_view = 1;
							arr.push(movielist[j])
						}
						moviedata.data = arr;
					}else{
						return this.fail("未查询到相关电影！")
					}
				}else{
					return this.fail("请先指定用户！")
				}
			}else if(can_view == 0){//查询全部
				//查询电影数据
				moviedata = await this.model("document_video").alias('a').join({
								table: "document",
						        join: "left", // 有 left,right,inner 3 个值
						        as: "document",
						        on: ["id", "id"]
							}).join({
						        table: table,
						        join: "left", // 有 left,right,inner 3 个值
						        as: "t",
						        on: ["id", "tid"]
						    }).where(map).page(page,pnum).order('document.id DESC').countSelect();
				if(!think.isEmpty(moviedata.data)){
					let movielist = moviedata.data
					if(!think.isEmpty(uname)){
						//获取电影收藏信息
						collectlist = await this.model("document_user_movie").field("able_watch").where({user_name:uname}).select();
						//console.log(collectlist)
						for(var i=0;i<collectlist.length;i++){
							tmp[collectlist[i].able_watch] = true;
						}
						for(var j=0;j<movielist.length;j++){
							//添加标识，判断用户是否已添加该影片：0--否，1--是
							if(tmp[movielist[j].id]){
								movielist[j].can_view = 1;
								arr.push(movielist[j])
							}else{
								movielist[j].can_view = 0;
								arr.push(movielist[j])
							}
						}
					}else{
						for(var j=0;j<movielist.length;j++){
							//添加标识，判断用户是否已添加该影片：0--否，1--是
							movielist[j].can_view = 0;
							arr.push(movielist[j])
						}
					}
					moviedata.data = arr;
				}else{
					return this.fail("未查询到相关电影！")
				}
			}
			// console.log(map)
			// console.log(moviedata)
			return this.success(moviedata);				    
		}
	}

	/**
	*addmovie
	*/
	async addmovieAction(){
		let uname = this.post("uname") || "";
		let able_watch = this.post("able_watch") || "";
		if(!think.isEmpty(uname)){
			if(!think.isEmpty(able_watch)){
				let data = await this.model("document_user_movie").where({user_name:uname,able_watch:able_watch}).find();
				if(think.isEmpty(data)){
					//添加数据
					let res = await this.model("document_user_movie").add({user_name:uname,able_watch:able_watch});
					//console.log(res)
					if(res){
						return this.success("添加成功！")
					}else{
						return this.fail("添加失败！")
					}
				}else{
					return this.fail("该电影添加重复！")
				}
			}else{
				return this.fail("缺少电影名！")
			}
		}else{
			return this.fail("用户名不能为空！")
		}
	}
	/**
	*deletemovie
	*/
	async deletemovieAction(){
		let uname = this.post("uname") || "";
		let able_watch = this.post("able_watch") || "";
		if(!think.isEmpty(uname)){
			if(!think.isEmpty(able_watch)){
				//添加数据
				let res = await this.model("document_user_movie").where({user_name:uname,able_watch:able_watch}).delete();
				//console.log(res)
				if(res){
					return this.success("删除成功！")
				}else{
					return this.fail("删除失败！")
				}
			}else{
				return this.fail("缺少电影名！")
			}
		}else{
			return this.fail("用户名不能为空！")
		}
	}
	/**
	*验证用户是否存在
	*/
	async proveAction(){
		let name = this.post("name") || "";
		if(!think.isEmpty(name)){
			let res = await this.model("member").where({username:name}).find();
			if(!think.isEmpty(res)){
				return this.success("用户名存在。")
			}else{
				return this.fail("用户名不存在！")
			}
		}else{
			return this.fail("用户名不能为空")
		}
	}
}