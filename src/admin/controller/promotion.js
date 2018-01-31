// +----------------------------------------------------------------------
// | PeanutRoll [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.peanutroll.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: zhengqsh <zhengqsh@126.com>
// +----------------------------------------------------------------------
'use strict';

import Base from './base.js';

export default class extends Base {
  init(http){
    super.init(http);
    this.tactive = "promotion"
  }
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    return this.display();
  }

  /**
   * goods action
   * 商品促销
   */
  goodsAction(){
    this.end("商品促销");
  }

  /**
   * 订单促销
   */
  orderAction(){
    this.end("订单促销")
  }

  /**
   * 捆绑销售
   */
  bundingAction(){
    this.end("捆绑销售")
  }

  /**
   * 团购
   */
  tuanAction(){
    this.end("团购")
  }

  /**
   * 限时抢购
   */
  flashAction(){
    this.end("限时抢购")
  }

  /**
   * 代金卷
   */
  async voucherAction(){
 
        this.end("代金券");
    
  }

    /**
   * 优惠券
   */
  async discountAction(){
 
        let status = this.get("status");
        let map={};
        if(!think.isEmpty(status)){
            map.status = status;
            this.assign('status',status);
        }
        map.is_del = 0
        map.type = 1;
       // this.config("db.nums_per_page",20)
        let data = await this.model("discount").where(map).page(this.get('page')).order("create_date DESC").countSelect();
        let Pages = think.adapter("pages", "page"); //加载名为 dot 的 Template Adapter
        let pages = new Pages(this.http); //实例化 Adapter
        let page = pages.pages(data);
        this.assign('pagerData', page); //分页展示使用
        //console.log(data.data);
        //this.active="admin/order/list";
        /*
        for(let val of data.data){
            switch (val.payment){
                case 100:
                    val.channel = "预付款支付";
                    break;
                case 1001:
                    val.channel = "货到付款";
                    break;
                default:
                    val.channel = await this.model("pingxx").where({id:val.payment}).getField("title",true);
            }
        }*/

        this.assign('list', data.data);
        this.meta_title = "优惠券";
        return this.display();
    
  }

  async discountaddAction(){
        let data = this.post()
        
        if(think.isEmpty(data) || think.isEmpty(data.discount_type)){
          return this.fail('类型为空');
        }
        if(think.isEmpty(data.discount_number)){
          return this.fail('数量为空');
        }
        if(think.isEmpty(data.discount_price)){
          return this.fail('价格为空');
        }
        if(think.isEmpty(data.validity_date)){
          return this.fail('有效期为空');
        }
        think.log(data,'PROMOTION_DISCOUNTADD');
        let discountinfo = {};
        for(let index = 0;index < Number(data.discount_number);){
          discountinfo.code = randomString(16);
          //验证优惠码是否已存在重复
          let find = await this.model("discount").where({code:discountinfo.code}).select();
          if(find.length > 0){
            think.log(find,'PROMOTION_DISCOUNTADD');
            continue;
          }

          discountinfo.type = 1;//目前只支持现金折扣1
          discountinfo.price = Number(data.discount_price).toFixed(2);
          discountinfo.validity_date = Date.parse(new Date(data.validity_date));
          discountinfo.create_date = new Date().getTime();
          discountinfo.create_uid = this.user.uid;
          let res =await this.model("discount").add(discountinfo);

          index++;

        }

        this.meta_title = "创建优惠券";
        return this.success({name:'操作成功'});
        //return this.action("article","index");
    }

  async discountdelAction(){
    let postdata = this.post();
    if(think.isEmpty(postdata.ids)){
        return this.fail("参数错误！");
    }
    console.log(postdata);
    let data = [];
    if(think.isArray(postdata.ids) ){
      for(let val of postdata.ids){
        let tempdata = {};
        tempdata.id = val;
        tempdata.is_del = 1;
        data.push(tempdata); 
      }
    }else{
      let tempdata = {};
      tempdata.id = postdata.ids;
      tempdata.is_del = 1;
      data.push(tempdata); 
    }
    console.log(data);
    let datalist = await this.model("discount").updateMany(data);

    this.meta_title = "删除优惠券";
    return this.success({name:'操作成功'});
    //return this.action("article","index");
  }


}