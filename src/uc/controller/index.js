'use strict';
import Base from './base.js';
import fs from 'fs';

import moment from "moment"
moment.locale('zh-cn');
import pagination from 'think-pagination';

export default class extends Base {
  /**
   * index action
   * 用户中心主页
   * @return {Promise} []
   */
  async indexAction() { 
    return think.statusAction(702, this.http);
    //auto render template file index_index.html
    // if (!this.is_login) {
    //     return think.statusAction(700, this.http);
    // }
    //判断是否登陆
    await this.weblogin();
    // this.http.error = new Error('成功信息！');
    // return think.statusAction(701, this.http);
    // this.http.error = new Error('错误信息！');
    // return think.statusAction(702, this.http);
    //获取用户信息

    let userInfo = await this.model("member").join({
        table: "member_group",
        join: "left",
        as: "c",
        on: ["groupid", "groupid"]
    }).find(this.user.uid);

      this.assign("userInfo", userInfo);
    //订单交易总金额
    let order = await this.model("order").where({user_id: this.user.uid, pay_status: 1}).getField('order_amount');
    let orderTotal = eval(order.join("+"));
    this.assign("orderTotal", orderTotal);
    //进行中的订单
    let onOrder = await this.model("order").where({status: 4,user_id: this.user.uid}).count("id");
    this.assign("onOrder", onOrder);
    //带评价的商品 TODO
    this.meta_title = "用户中心";



        //判断是否登陆
    let islogin = await this.jsonlogin();
    if(!islogin){
      this.fail("未登录");
    }
    let status = this.param("status") || null;
    ////console.log(status);
    let map;

    //当前位置
    if (!think.isEmpty(status)) {
      this.assign('status', status);
    }
    //筛选订单

    if (status == 0) {//未付款的订单
      map = {
        type: 0,
        pay_status: 0,
        delivery_status: ["!=", 1],
        status: ["NOTIN", [4, 6]],
        is_del: 0,
        user_id: this.user.uid,
      }
    } else if (status == 1) {//代收货的订单
      //(item.pay_status == 1 or item.status ==3) and item.delivery_status != 1 and item.status != 6 and item.status != 4
      //item.delivery_status == 1 and item.status != 6 and item.status != 4
      // map={
      //     status: ["NOTIN", [4, 6]],
      //     delivery_status: ["!=", 1],
      //     is_del: 0,
      //     user_id: this.user.uid,
      //     _complex:{
      //         pay_status: 1,
      //         status: 3,
      //         _logic: "or"
      //     }
      // }
      map = {
        type: 0,
        status: ["NOTIN", [4, 6]],
        delivery_status: 1,
        is_del: 0,
        user_id: this.user.uid,
      }
    } else {
      map = {
        type: 0,
        is_del: 0,
        user_id: this.user.uid,
      }
    }


    //console.log(map);
    // this.config("db.nums_per_page",20)
    let data = await this.model("order_tour").where(map).page(this.param('page'),10000).order("create_time DESC").countSelect();
    let html = pagination(data, this.http, {
      desc: false, //show description
      pageNum: 2,
      url: '', //page url, when not set, it will auto generated
      class: 'nomargin', //pagenation extra class
      text: {
        next: '下一页',
        prev: '上一页',
        total: 'count: ${count} , pages: ${pages}'
      }
    });
    ////console.log(data);
    this.assign('pagination', html);
    data.html = html;
    for (let val of data.data) {
      switch (val.payment) {
        case 100:
          val.channel = "预付款支付";
          break;
        case 1001:
          val.channel = "货到付款";
          break;
        default:
          val.channel = await this.model("pingxx").where({id: val.payment}).getField("title", true);
      }
      val.province = await this.model("area").where({id: val.province}).getField("name", true);
      val.city = await this.model("area").where({id: val.city}).getField("name", true);
      val.county = await this.model("area").where({id: val.county}).getField("name", true);
      //未付款订单倒计时
      if (val.pay_status == 0) {
        val.end_time = date_from(val.create_time + (Number(this.setup.ORDER_DELAY) * 60000))
      }
      ////console.log(this.setup.ORDER_DELAY_BUND)
      //查出订单里面的商品列表
      val.goods = await this.model("order_goods").where({order_id: val.id}).select();
      let numarr=[];
      for (let v of val.goods) {
        v.prom_goods = JSON.parse(v.prom_goods);
        numarr.push(v.goods_nums);
        v = think.extend(v, v.prom_goods);
        delete v.prom_goods;
      }
      ////console.log(val.goods)
      val.nums = eval(numarr.join("+"));
    }
    //未付款统计
    let nopaid = await this.model("order").where({
      type: 0,
      pay_status: 0,
      delivery_status: ["!=", 1],
      status: ["NOTIN", [4, 6]],
      is_del: 0,
      user_id: this.user.uid,
    }).count("id");
    this.assign("nopaid", nopaid);
    //未付款统计
    let receipt = await this.model("order").where({
      type: 0,
      status: ["NOTIN", [4, 6]],
      delivery_status: 1,
      is_del: 0,
      user_id: this.user.uid,
    }).count("id");
    this.assign("nopaid", nopaid);
    this.assign("receipt", receipt);
    ////console.log(data.data);
    this.assign("count",data.count);
    this.assign('list', data.data);
    this.meta_title = "我的订单";





    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      let mtype = this.get('mtype')
      if(mtype == 'vue'){
        //vue
        let vuedata = {orderTotal:orderTotal,onOrder:onOrder}
        return this.json(vuedata)
      }else {//普通模板
        this.active = this.http.controller+"/"+this.http.action;
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
      }

    } else {
      return this.display();
    }









  }

  //获取头像
  async avatarAction() {
    let uid = this.get("uid")||this.user.uid
    let path;
    if(uid != 0 && !think.isEmpty(uid)){
      var uploadPath = think.RESOURCE_PATH + '/upload/avatar/' + uid;
      path = think.isFile(uploadPath + "/" + "/avatar.png");
    // uid 0 遊客採用默認頭像
    }
    this.type("image/png");
    let pic;
    if (path) {
      // this.download(uploadPath + "/" + "/avatar.png");
      pic = fs.readFileSync(uploadPath + "/" + "/avatar.png")
    } else {
      //this.download(think.RESOURCE_PATH + '/upload/avatar/avatar.jpg')
      pic = fs.readFileSync(think.RESOURCE_PATH + '/upload/avatar/avatar.jpg')
    }

    this.end(pic)
  }

}