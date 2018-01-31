'use strict';

import Base from './base.js';
import Segment from 'segment';
import pagination from 'think-pagination';
export default class extends Base {

  /**
   * 旅客信息管理
   * @returns {PreventPromise}
   */
  async indexAction() {
    //判断是否登陆
    await this.weblogin();
    let discountlist = await this.model("member").where({id: this.user.uid}).getField("discountlist", true);
    if(think.isEmpty(discountlist)){
        discountlist = [];
        
      }else{
        discountlist = JSON.parse(discountlist);
        //console.log(discountlist);
        discountlist = await this.model("discount").where({code:["IN", discountlist],is_del:0}).select();
      }
      //console.log(discountlist)
      this.meta_title = "优惠券";
      this.assign("list",discountlist);
      //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "user/index";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }
  }
  
}

