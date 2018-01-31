'use strict';
import moment from "moment"
moment.locale('zh-cn');
import Base from './base.js';
import pagination from 'think-pagination';
export default class extends Base {
  //我的订单
  async indexAction() {
    //判断是否登陆
    await this.weblogin();
    let status = this.param("status") || null;
    ////console.log(status);
    let map;
    let limit = think.isEmpty(this.param("limit")) ? 5 : this.param("limit");

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


    ////console.log(map);
    // this.config("db.nums_per_page",20)
    let data = await this.model("order_tour").where(map).page(this.param('page'),limit).order("create_time DESC").countSelect();
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
    this.assign('pagination', html);
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
    this.assign('list', data);
    this.meta_title = "我的订单";
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      if(this.isAjax("get")){
        for(let v of data.data){
          v.create_time =moment(v.create_time).format('lll')
        }
        return this.json(data);
      }else {
        this.active = "user/index";
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
      }
    } else {
      return this.display();
    }
  }

  async queryAction() {
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
    let data = await this.model("order_tour").where(map).page(this.param('page')).order("create_time DESC").countSelect();
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

    return this.json(data);
  }
  /***
  *mobile 订单详情页面
  */
  async detailAction(){
     //判断是否登陆
    await this.weblogin();

    var order_no = this.get("order_no");
    var product_id = this.get("product_id");
    console.log(order_no)

    let status = this.param("status") || null;
    ////console.log(status);
    let map;
    let document = this.model('document');
    let detail = await document.detail(product_id);
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
        order_no:order_no,
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
        order_no:order_no,
      }
    } else {
      map = {
        type: 0,
        is_del: 0,
        user_id: this.user.uid,
        order_no:order_no,
      }
    }


    ////console.log(map);
    // this.config("db.nums_per_page",20)
    let data = await this.model("order_tour").where(map).page(this.param('page')).order("create_time DESC").countSelect();
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
    this.assign('pagination', html);
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
    //console.log(data.data)
    this.assign("nopaid", nopaid);
    this.assign("receipt", receipt);
    ////console.log(data.data);
    this.assign("count",data.count);
    this.assign('list', data.data);
    this.assign("detail",detail);
    this.meta_title = "订单详情";
    this.assign('order_no',order_no)
    
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }
  }
  /***
  *mobile  查看行程详情
  **/
  async tripAction(){
    //await this.weblogin();
    let product_id = this.get("product_id");
    let order_no = this.get("order_no");
    console.log(product_id)
    if(think.isEmpty(product_id) || product_id == 0 ){
      return this.fail("产品ID为空");
    }
    think.log(product_id,'BOOKING_GETCOMMENT');

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
        order_no:order_no,
      }
    } else if (status == 1) {//代收货的订单
      map = {
        type: 0,
        status: ["NOTIN", [4, 6]],
        delivery_status: 1,
        is_del: 0,
        user_id: this.user.uid,
        order_no:order_no,
      }
    } else {
      map = {
        type: 0,
        is_del: 0,
        user_id: this.user.uid,
        order_no:order_no,
      }
    }


    let data = await this.model("order_tour").where(map).page(this.param('page')).order("create_time DESC").countSelect();
  

    console.log(data.data)
    this.assign('list', data.data);
   
    
    let cover_id = await this.model("document").where({id:product_id}).getField("cover_id",true);
    let document_tour = await this.model("document_tour").where({id:product_id}).getField("score,commentcount,product_route",true);
    document_tour.cover_id =  cover_id;
    document_tour.cover_url = await get_pic(cover_id,1,65,65); 
    if(document_tour.commentcount > 0){
      document_tour.score_avg =(document_tour.score / document_tour.commentcount).toFixed(1);
    }else{
      document_tour.score_avg = 0;
    }
    //console.log(cover_id);
    //console.log(document_tour)
    this.assign('info',document_tour);
    this.assign("order_no",order_no)
    this.meta_title = "查看行程";
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }
  }
  //手机评价页面
  async evaluateAction(){
    //判断是否登陆
    await this.weblogin();

    let product_id = this.get("product_id");
    let order_no = this.get("order_no");
    if(think.isEmpty(product_id) || product_id == 0 ){
      return this.fail("产品ID为空");
    }
    think.log(product_id,'BOOKING_GETCOMMENT');
   


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
        order_no:order_no,
      }
    } else if (status == 1) {//代收货的订单
      map = {
        type: 0,
        status: ["NOTIN", [4, 6]],
        delivery_status: 1,
        is_del: 0,
        user_id: this.user.uid,
        order_no:order_no,
      }
    } else {
      map = {
        type: 0,
        is_del: 0,
        user_id: this.user.uid,
        order_no:order_no,
      }
    }


    let data = await this.model("order_tour").where(map).page(this.param('page')).order("create_time DESC").countSelect();
  

    console.log(data.data)
    this.assign('list', data.data);
    
    let cover_id = await this.model("document").where({id:product_id}).getField("cover_id",true);
    let document_tour = await this.model("document_tour").where({id:product_id}).getField("score,commentcount,product_route",true);
    document_tour.cover_id =  cover_id;
    document_tour.cover_url = await get_pic(cover_id,1,65,65); 
    if(document_tour.commentcount > 0){
      document_tour.score_avg =(document_tour.score / document_tour.commentcount).toFixed(1);
    }else{
      document_tour.score_avg = 0;
    }
    // console.log(document_tour)
    // console.log(order_no)
    //console.log(cover_id);
    this.assign('info',document_tour)
    this.meta_title = "评价订单";
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }
  }



  //删除订单
  async delorderAction() {
    //判断是否登陆
    await this.weblogin();

    let res;
    let type = this.get("type") || null;
    if (think.isEmpty(type)) {
      let map = {
        id: this.get("id"),
        user_id: this.user.uid,
        status: ["IN", [4, 6]]
      }
      res = await this.model("order").where(map).update({is_del: 1});
    } else {
      res = await this.model("order").where({id: this.get("id"), user_id: this.user.uid}).delete()
    }

    if (res) {
      return this.success({name: "删除成功！"});
    } else {
      return this.fail("删除失败!");
    }
  }

  //确认收货
  async confirmreceiptAction() {
    //判断是否登陆
    await this.weblogin();
    let map = {
      id: this.get("id"),
      user_id: this.user.uid,
      delivery_status: 1,
      status: ["NOTIN", [4, 6]]
    }
    let res = await this.model("order").where(map).update({status: 4});
    if (res) {
      return this.success({name: "操作成功！"});
    } else {
      return this.fail("操作失败!");
    }
  }


}