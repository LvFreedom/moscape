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
export default class extends Base {
  init(http){
    super.init(http);
    this.status_desc=['','未提交','已提交','已取消','已付款','','卖家已确认','待成团','已成团','已作废','请求退款','确认退款','退款中','退款成功','','已评价'];
    //订单状态 status 1,未提交(草稿)2:已提交待确认待付款，3:已取消,4：已付款待确认，5：，6:卖家已确认订单，7:已确认待成团，8:已成团完成订单待评价，9：商户已作废订单， 10:请求退款待确认,11:确认退款，12,:退款中，13退款成功 14:，15:已成团已评价

  }
  /**
   * index action 预定产品
   * @return {Promise} []
   * orderid 已存订单ID
   * postdata: 
   *           product_id 产品唯一标示ID
   *           start_date 出发日期
   *           adult_quantity:成人数量   
   *           kid_quantity:儿童数量
   *           baby_quantity:婴儿数量
   *           differences_quantity:婴儿数量
   *           type:产品类型 需要置为空
   *
   *return:
   *        
   */
  async indexAction(){
    //auto render template file index_index.html
    this.meta_title = "产品预订";//标题1
    // this.keywords = this.setup.WEB_SITE_KEYWORD ? this.setup.WEB_SITE_KEYWORD : '';//seo关键词
    // this.description = this.setup.WEB_SITE_DESCRIPTION ? this.setup.WEB_SITE_DESCRIPTION : "";//seo描述
    // this.active = this.http.controller+"/"+this.http.action;

    //判断是否登陆
    await this.weblogin();
    let data = this.get();
    console.log(data)

    //输入保护检测
    if(!data.product_id ){
      this.http.error = new Error('未指定产品');
      return think.statusAction(702, this.http);
    }
    let document = this.model('document');
    let info = await document.detail(data.product_id);
    console.log(info)
    this.assign('info',info);

    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }
  }

}