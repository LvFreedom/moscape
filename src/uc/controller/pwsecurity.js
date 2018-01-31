'use strict';
import Jimp from "jimp";
import Base from './base.js';

export default class extends Base {
	async indexAction() {
		//判断是否登陆
    	await this.weblogin();
    	//判断浏览客户端
    	this.meta_title = "账号安全";
	    if (checkMobile(this.userAgent())) {
	      this.active = "user/index";
	      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
	    }
	}
}