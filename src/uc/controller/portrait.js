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
	    let islogin = await this.jsonlogin();
	    if(!islogin){
	      return this.fail("未登录");
	    }

	    //获取用户信息
	    let userInfo = await this.model("member").find(this.user.uid);
	      //console.log(userInfo);
	      ////console.log(userInfo);
	    //this.assign("userInfo", userInfo);
	    let province, city, county, start_city;
	    //获取省份
	    if (checkMobile(this.userAgent())) {
	      province = await this.model('area').where({id: userInfo.province}).getField("name", true);
	      city = await this.model('area').where({id: userInfo.city}).getField("name", true);
	      start_city = await this.model('area').where({parent_id: userInfo.start_province}).getField("name", true);
	      county = await this.model('area').where({id: userInfo.county}).getField("name", true);
	    } else {
	      province = await this.model('area').where({parent_id: 0}).select();
	      city = await this.model('area').where({parent_id: userInfo.province}).select();
	      start_city = await this.model('area').where({parent_id: userInfo.start_province}).select();
	      county = await this.model('area').where({parent_id: userInfo.city}).select();
	    }
	    console.log(userInfo)
	    this.assign("info",userInfo)
	    this.meta_title = "头像设置";
	    //判断浏览客户端
	    if (checkMobile(this.userAgent())) {
	      this.active = "user/index";
	      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
	    }
 	}
 }