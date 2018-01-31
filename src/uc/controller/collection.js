// +----------------------------------------------------------------------
// | PeanutRoll [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.peanutroll.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: zhengqsh <zhengqsh@126.com>
// +----------------------------------------------------------------------
'use strict';
import moment from "moment"
moment.locale('zh-cn');
import Base from './base.js';
export default class extends Base {
 	async indexAction(){
 		//判断是否登陆
		await this.weblogin();
	    let args = this.post();
	    let where = {};//{'status':1};
	    let limit = this.get("limit") ? this.get("limit"): 5 ;
      	let page = this.get("page") ? this.get("page") : 1 ;
      	//console.log("limit:"+limit+",page:"+page);
      	where.uid = this.user.uid;

      	//0.获取查询关键字
      	let searchword = [];
      	let q = this.get("q");
      	if(!think.isEmpty(q)){
        	let segment = new Segment();
        	// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
        	await segment.useDefault();
        	// 开始分词
        	let segment_q= await segment.doSegment(q, {
            	simple: true,
            	stripPunctuation: true
	        });
	        for (let k=0; k<segment_q.length ;k++){
	            searchword.push("%"+segment_q[k]+"%");
	        }

	        if(searchword.length > 0){
	          where = think.extend({},where,{'title':["like",searchword]});
	        }
	    }

	    let productids = [];
	    let questions = await think.model('document_focus', think.config("db")).page(page,limit).where(where).order('add_time DESC').countSelect();
	    //console.log(questions);
	    if(!think.isEmpty(questions.data)){
	        //前端字符显示处理
	        for(let val of questions.data){
	          	let productinfo = await this.model('document').where({id:val.question_id}).getField("cover_id,title,price",true);
	          	productinfo.cover_url = await get_pic(productinfo.cover_id,1,120,80);
	          	productinfo.price = await get_price(productinfo.price,1);
	          	val.productinfo = productinfo;
	        }
	    }
	    console.log(questions);
	    this.assign("info",questions)
	    this.meta_title = "收藏";
	    //判断浏览客户端
	    if (checkMobile(this.userAgent())) {
	      this.active = "user/index";
	      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
	    }
 	}
 }