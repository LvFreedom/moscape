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
    this.meta_title = "产品订购";//标题1
    this.keywords = this.setup.WEB_SITE_KEYWORD ? this.setup.WEB_SITE_KEYWORD : '';//seo关键词
    this.description = this.setup.WEB_SITE_DESCRIPTION ? this.setup.WEB_SITE_DESCRIPTION : "";//seo描述
    this.active = this.http.controller+"/"+this.http.action;

    //判断是否登陆
    await this.weblogin();
    let data = this.post();
    let orderinfo = {};
    let amountinfo = {}
    data = think.extend({},data);
    think.log(data,'BOOKING_INDEX');
    //已存订单，编辑订单
    if(this.get('orderid')){
      //获取订单信息 TODO
      orderinfo =  await this.model("order_tour").where({id:orderid}).select();
      this.assign("orderinfo",orderinfo);
    }
    if(!orderinfo.id){
      var numbercheck = /^[1-9]*[1-9][0-9]*$/;
      //输入保护检测
      if(!data.product_id ){
        this.http.error = new Error('未指定购买产品');
        return think.statusAction(702, this.http);
      }
      if(!data.start_date){
        this.http.error = new Error('未指定出发日期');
        return think.statusAction(702, this.http);
      }
      if(data.adult_quantity<=0 && data.kid_quantity<=0 ){
        this.http.error = new Error('未指定订单数量');
        return think.statusAction(702, this.http);
        //return this.fail('未指定订单数量');
      }

      //获取产品详细信息
      let goods = await this.model('document').find(data.product_id);
      let table = await this.model('model').get_table_name(goods.model_id);
      let info = await this.model(table).find(data.product_id);
      goods = think.extend(goods,info);
      //think.log(goods,'BOOKING_INDEX');

      //订单信息
      //let order_amount;//订单金额
      //let discount_amount = 0;//折扣金额，优惠券抵扣
      //let real_amount;//实际支付价格 = 订单金额-折扣金额
      amountinfo.title=goods.title;
      amountinfo.type = data.type;
      amountinfo.product_id = data.product_id;
      amountinfo.product_name = data.product_name;
      amountinfo.start_date = data.start_date;
      amountinfo.adult_quantity=Number(data.adult_quantity);
      amountinfo.kid_quantity=Number(data.kid_quantity);
      amountinfo.baby_quantity=Number(data.baby_quantity);
      amountinfo.differences_quantity=Number(data.differences_quantity);
      amountinfo.totol_quantity = Number(data.adult_quantity) + Number(data.kid_quantity) + Number(data.baby_quantity);
      //供应商信息
      amountinfo.vendor_name = data.vendor_name;
      amountinfo.vendor_phone = data.vendor_phone;
      amountinfo.vendor_linkman = data.vendor_linkman;
      amountinfo.vendor_addr = data.vendor_addr;
      //预定条款
      amountinfo.clause = data.caluse;
      //初始化
      amountinfo.adult_unit_pirce = 0;
      amountinfo.adult_amount = 0;
      amountinfo.kid_unit_pirce = 0;
      amountinfo.kid_amount = 0;
      amountinfo.baby_unit_pirce = 0;
      amountinfo.baby_amount = 0;
      amountinfo.differences_amount = 0;

      if(!think.isEmpty(goods.price_adult)){
        amountinfo.adult_unit_pirce = get_price(goods.price_adult,1);//获取实际价格 2为原价
        if(amountinfo.adult_unit_pirce  <= 0 && Number(data.adult_quantity)>0){
          this.http.error = new Error('价格异常');
          return think.statusAction(702, this.http);
          //return this.fail('价格异常');
        }
        amountinfo.adult_amount = (amountinfo.adult_unit_pirce * Number(data.adult_quantity)).toFixed(2);//Number(data.adult_quantity)
      }else{
        if(data.adult_quantity > 0){
          this.http.error = new Error('价格未设置，不应当设置购买人数');
          return think.statusAction(702, this.http);
          //return think.fail('价格未设置，不应当设置购买人数');
        }
        
      }
      if(!think.isEmpty(goods.price_kid)){
        amountinfo.kid_unit_pirce = get_price(goods.price_kid,1);//获取实际价格 2为原价
        if(amountinfo.kid_unit_pirce  <= 0 && Number(data.kid_quantity)>0){
          this.http.error = new Error('价格异常');
          return think.statusAction(702, this.http);
          //return this.fail('价格异常');
        }
        amountinfo.kid_amount = (amountinfo.kid_unit_pirce * Number(data.kid_quantity)).toFixed(2);//Number(data.adult_quantity)
      }else{
        if(data.kid_quantity > 0){
          this.http.error = new Error('价格未设置，不应当设置购买人数');
          return think.statusAction(702, this.http);
          //return think.fail('价格未设置，不应当设置购买人数');
        }
        
      }
      if(!think.isEmpty(goods.price_baby)){
        amountinfo.baby_unit_pirce = get_price(goods.price_baby,1);//获取实际价格 2为原价
        if(amountinfo.baby_unit_pirce  <= 0 && Number(data.baby_quantity)>0){
          this.http.error = new Error('价格异常');
          return think.statusAction(702, this.http);
          //return this.fail('价格异常');
        }
        amountinfo.baby_amount = (amountinfo.baby_unit_pirce * Number(data.baby_quantity)).toFixed(2);//Number(data.adult_quantity)
      }else{
        if(data.baby_quantity > 0){
          //return think.fail('价格未设置，不应当设置购买人数');
          this.http.error = new Error('价格未设置，不应当设置购买人数');
          return think.statusAction(702, this.http);
        }
        
      }
      //单人差价
      if(!think.isEmpty(goods.price_differences)){
        amountinfo.differences_unit_pirce = get_price(goods.price_differences,1);//获取实际价格 2为原价
        if(amountinfo.differences_unit_pirce  <= 0 && Number(data.differences_quantity)>0){
          this.http.error = new Error('价格异常');
          return think.statusAction(702, this.http);
          //return this.fail('价格异常');
        }
        amountinfo.differences_amount = (amountinfo.differences_unit_pirce * Number(data.differences_quantity)).toFixed(2);//Number(data.adult_quantity)
      }else{
        if(data.differences_quantity > 0){
          //return think.fail('价格未设置，不应当设置购买人数');
          this.http.error = new Error('价格未设置，不应当设置购买人数');
          return think.statusAction(702, this.http);
        }
        
      }


      amountinfo.order_amount = (Number(amountinfo.adult_amount) + Number(amountinfo.kid_amount) + Number(amountinfo.baby_amount) + Number(amountinfo.differences_amount)).toFixed(2);
      /*
      //获取折扣价格 
      if(data.discount_code){

      }

      real_amount = order_amount - discount_amount;
      */
      this.assign("amountinfo",amountinfo);
      think.log(amountinfo,'BOOKING_INDEX');
    }else{
      this.assign("amountinfo",orderinfo);
      think.log(orderinfo,'BOOKING_INDEX');
    }
    

    //用户保存的旅客信息
    //手机端接收
    let map;
    if ( checkMobile(this.userAgent())) {
      map={user_id:this.user.uid};
      //TODO 手机端COOKIE是否不同，业务逻辑是否不同
    }else {
      map={user_id:this.user.uid};
    }
    let travellerlist = await this.model("traveller").where(map).order("id DESC").select();
    this.assign("travellerlist",travellerlist);
    think.log(travellerlist,'BOOKING_INDEX');

    //获取联系人信息
    let connectinfo = await this.model("member").where({id:this.user.uid}).getField("connect_name,connect_phone,connect_email",true);
    this.assign("connectinfo",connectinfo);
    think.log(connectinfo,'BOOKING_INDEX');
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    } else {
      return this.display();
    }
  }

  /**
   * createorder action 创建订单
   * @return {Promise} []
   * orderid 已存订单ID
   * postdata: 
   *           amountinfo 产品费用信息 {"title":"成人游学-纽约时尚都市体验+英语学习+文化交流国际游学（两周起）","product_id":"563","start_date":"2017-10-10","adult_quantity":2,"kid_quantity":2,"baby_quantity":3,"differences_quantity":0,"totol_quantity":7,"adult_unit_pirce":"3.00","adult_amount":"6.00","kid_unit_pirce":"4.00","kid_amount":"8.00","baby_unit_pirce":"5.00","baby_amount":"15.00","differences_amount":"6.00","differences_unit_pirce":"6.00","order_amount":"35.00"}
   *           discount_code 优惠码
   *           connectinfo:联系人信息 {connect_name,connect_phone,connect_email}  
   *           travellersinfo:旅客信息 [{"issave":1,"name_zh":"大王","name_en":"dawang","country":"中国","credentials_type":1,"credentials_value":"123124","sexual":1,"birthday":"2017-03-21T16:00:00.000Z","phone":"123123","type":1},{},{}]
   *           user_remark:备注信息
   *           temp_order:1 暂存订单 0提交订单
   */
   //TODO  如何防止重复提交订单？？
  async createorderAction(){
    await this.weblogin();
    let data = this.post();
    think.log(data,'BOOKING_CREATEORDER');

    data.amountinfo = JSON.parse(data.amountinfo);
    data.connectinfo = JSON.parse(data.connectinfo);
    data.travellersinfo = JSON.parse(data.travellersinfo);
    //TODO 简单的防重复提交机制：同一个产品一定周期内只能提交一次订单

    // return false;
    let order_amount;//订单金额
    let payable_amount;//应付金额，商品的原价
    let real_amount;//商品参与获得的价格
    let payable_freight;//应付运费
    let real_freight//实际运费

    let orderinfo = {};
    orderinfo = think.extend({},data.amountinfo);
    orderinfo = think.extend(orderinfo,data.connectinfo);
    //console.log(orderinfo);
    let goods =data.amountinfo;

    //检查购物车内的宝贝是否有库存
    //console.log(goods.type) ; 
    let stock = await this.model("order_tour").getstock(goods.product_id,goods.type);
    //think.log(stock);
    //console.log(stock);
    if(goods.totol_quantity > stock){
      return this.fail("商品库存不足，创建订单失败！");
    }


    //用户
    orderinfo.user_id=this.user.uid;
    //生成订单编号
    // let nowtime = new Date().valueOf();
    // let oid =["d",this.user.uid,nowtime]
    // data.order_no = oid.join("");
    orderinfo.order_no = await this.model("order_tour").orderid();
    //console.log(orderinfo.order_no);
    //验证优惠码
    orderinfo.discount_amount = 0;
    if(!think.isEmpty(data.discount_code)){
      orderinfo.discount_code = data.discount_code;
      //再次验证优惠券
      let findData = await this.model("discount").where({code:data.discount_code,is_del:0}).find();
      if(think.isEmpty(findData.id)){
        return this.fail("优惠券不存在");
      }else{
        if(findData.validity_date < new Date().getTime()){
          return this.fail("优惠券已失效");
        }
        if(findData.status == 1){
          return this.fail("优惠券已使用");
        }
      }
      orderinfo.discount_amount = findData.price;

    }
    //应付金额，支付金额低于金额优惠为0
    if(Number(orderinfo.order_amount) <=  Number(orderinfo.discount_amount)){
      orderinfo.real_amount= 0.00;
    }else{
      orderinfo.real_amount =(Number(orderinfo.order_amount) - Number(orderinfo.discount_amount)).toFixed(2);
    }


    //客户订单备注
    if(!think.isEmpty(data.user_remark)){
      orderinfo.user_remark = data.user_remark;
    }

    //联系人信息      //todo  信息格式检查
    if( !data.temp_order && (think.isEmpty(data.connectinfo.connect_name) || think.isEmpty(data.connectinfo.connect_phone) || think.isEmpty(data.connectinfo.connect_email))){
      this.http.error = new Error('联系人信息不能为空');
      return think.statusAction(702, this.http);
    }else{
      //console.log(data.connectinfo.connect_name);
      let member = {
        connect_name:data.connectinfo.connect_name,
        connect_phone:data.connectinfo.connect_phone,
        connect_email:data.connectinfo.connect_email
      } 
      //console.log(member);
      let update = await this.model("member").where({id: this.user.uid}).update(member);
      think.log(update,'BOOKING_CREATEORDER');
      if (!update ) {
        think.log('更新联系人信息失败！','BOOKING_CREATEORDER');
      } 

    }
    //旅客信息
    if(data.travellersinfo.length != orderinfo.totol_quantity && !data.temp_order){
      this.http.error = new Error('旅客信息不完整');
      return think.statusAction(702, this.http);
    }else{
      let travellers = [];
      for (let traveller of data.travellersinfo){
        //TODO  输入检查
        let temp_traveller = {};
        temp_traveller.name_zh = traveller.name_zh;
        temp_traveller.name_en = traveller.name_en;
        temp_traveller.country = traveller.country;
        temp_traveller.credentials_type = traveller.credentials_type;
        temp_traveller.credentials_value = traveller.credentials_value;
        temp_traveller.sexual = traveller.sexual;
        temp_traveller.birthday = traveller.birthday;
        temp_traveller.phone = traveller.phone;
        temp_traveller.type = traveller.type;
        travellers.push(temp_traveller);
        //保存常用旅客信息，以中文名为关键字
        if(traveller.issave == 1){ 
          let  one_traveller = await this.model("traveller").where({name_zh:traveller.name_zh}).find();
          if(one_traveller.id){
            let res = await this.model("traveller").where({id: one_traveller.id}).update(temp_traveller); 
          }else{
            let res = await this.model("traveller").add(temp_traveller);
          }
        }
      }
      orderinfo.travellersinfo  = JSON.stringify(travellers);
    }
    //支付状态 pay_stayus 0:未付款 ,1:已付款, 2：退款中，3:已退款
    orderinfo.pay_status = 0;
    
    if(data.temp_order == 1){
      orderinfo.status = 1;
    }else{
      orderinfo.status = 2;
    }
    //发货状态 delivery_status 0:未成团，1:已成团，2，已出团
    orderinfo.delivery_status = 0;
    //订单创建时间 create_time
    orderinfo.create_time = new Date().valueOf();
    orderinfo.update_time = new Date().valueOf();


    //console.log(orderinfo.title);
    //生成订单
    let order_id = await this.model("order_tour").add(orderinfo);

    //减少订单中商品的库存 TODO：需要做事务处理，同时需要确认库存是在下单后减少 还是在支付成功后
    await this.model("order_tour").stock(order_id,true);

    //订单成功，设置优惠券状态为已使用（目前默认设置为提交订单即使用优惠券，订单取消返还优惠券）
    await this.model("discount").where({code:data.discount_code,is_del:0}).update({status: 1,used_orderid:order_id,used_uid:this.user.uid,used_date:orderinfo.create_time,product_id:goods.product_id});

    this.assign("orderinfo",orderinfo);
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    } else {
      return this.display();
    }
    //return this.success({name:'订单创建成功，正在跳转支付页面！',orderinfo,url:`/uc/pay/pay?order=${order_id}&setp=3`});

  }

  /**
   * createorder action 查询订单
   * @return {Promise} []
   * /uc/booking/query/status/4 
   * status
   */
  async queryAction() {
    //判断是否登陆
    let islogin = await this.jsonlogin();
    if(!islogin){
      return this.fail("未登录");
    }
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


    //console.log(map);
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
      //let status_desc=['','未提交','已提交','已取消','已付款','待卖家确认','卖家已确认','待成团','已成团','已作废','请求退款','确认退款','退款中','退款成功','待评价','已评价'];
      val.status_desc = this.status_desc[val.status];
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
    //console.log(data);
    return this.json(data);
  }
   async tourdaysAction(){
    let data = this.get();
    let tourdays = await this.model("type_optionvalue17").where({tid:data.tid}).select();
    return this.json(tourdays);
  }
    /**
   * cannelorderAction  取消订单
   * @return {Promise} []
   * /uc/booking/query/status/4 
   * status
   */
  async cannelorderAction() {
    //判断是否登陆
    let islogin = await this.jsonlogin();
    if(!islogin){
      return this.fail("未登录");
    }

    let orderid = this.get('orderid'); 
    ////console.log(status);
    let order_tour_info={};
    //订单状态 status 1,未提交(草稿)2:已提交(待付款)，3:已取消,4已付款，5,待卖家确认，6:卖家已确认，7:待成团，8:已成团， 10:请求退款,11:确认退款，12,:退款中，13退款成功 16:待评价，17:已评价
    order_tour_info.status = 3;

    let update = await this.model("order_tour").where({user_id: this.user.uid,order_no:orderid}).update(order_tour_info);
    if(update){
      //如果订单存在优惠券，则还原优惠券为未使用
      let findData = await this.model("order_tour").where({user_id: this.user.uid,order_no:orderid}).find();
      if(!think.isEmpty(findData.discount_code)){
        await this.model("discount").where({code:findData.discount_code,is_del:0}).update({status: 0,});
      }
      return this.success("取消订单成功");
    }
    else
      return this.fail("取消订单失败");
  }
    /**
   * delorderAction  删除订单
   * @return {Promise} []
   * /uc/booking/query/status/4 
   * status
   */
  async delorderAction() {
    //判断是否登陆
    let islogin = await this.jsonlogin();
    if(!islogin){
      return this.fail("未登录");
    }

    let orderid = this.get('orderid'); 
    //console.log(orderid);
    let order_tour_info={};
    //订单状态 status 1,未提交(草稿)2:已提交(待付款)，3:已取消,4已付款，5,待卖家确认，6:卖家已确认，7:待成团，8:已成团， 10:请求退款,11:确认退款，12,:退款中，13退款成功 16:待评价，17:已评价
    //只有未提交订单才可以删除
    //let update = await this.model("order_tour").where({user_id: this.user.uid,order_no:orderid,status:1}).delete();
    let update = await this.model("order_tour").where({user_id: this.user.uid,order_no:orderid}).update({is_del: 1});
    //console.log(update);
    if(update)
      return this.success("删除订单成功");
    else
      return this.fail("删除订单失败");
  }
  //
    /**
   * createorder action 查询验证优惠券
   * @return {Promise} []
   * code 优惠券代码
   *  
   */
  async discountcheckAction(){
    let discount_code = this.param("code");
    if(think.isEmpty(discount_code)){
        return this.fail("参数错误！");
    }
    //console.log(discount_code);
    let findData = await this.model("discount").where({code:discount_code,is_del:0}).find();
    if(think.isEmpty(findData.id)){
      return this.fail("优惠券不存在");
    }else{
      if(findData.validity_date < new Date().getTime()){
        return this.fail("优惠券已失效");
      }
      if(findData.status == 1){
        return this.fail("优惠券已使用");
      }
    }

    return this.success(findData);
    //return this.action("article","index");
  }

  /**
   * discountAddAction 添加优惠券
   * @return {Promise} []
   * code 优惠券代码
   *  
   */
  async discountaddAction(){
    await this.weblogin();
    //let data = this.post();
    let data = {};
    data.discount_code = this.get("code");
    //console.log(this.get("code"));
    if(think.isEmpty(data.discount_code)){
        return this.fail("您的输入不能为空！");
    }
    //console.log(data.discount_code);
    let findData = await this.model("discount").where({code:data.discount_code,is_del:0}).find();
    if(think.isEmpty(findData.id)){
      return this.fail("优惠券不存在");
    }else{
      let member={};
      let discountlist = await this.model("member").where({id: this.user.uid}).getField("discountlist", true);
      if(think.isEmpty(discountlist)){
        discountlist = [];
        //let discountOne = {};
        //discountOne.code = data.discount_code;
        discountlist.push(data.discount_code);
        discountlist = JSON.stringify(discountlist);
      }else{
        discountlist = JSON.parse(discountlist);
        discountlist.push(data.discount_code);
        discountlist = JSON.stringify(discountlist);
      }
      member.discountlist = discountlist;
      //console.log(discountlist);
      let update = await this.model("member").where({id: this.user.uid}).update(member);
      return this.success('添加优惠券成功');
    }
    //return this.action("article","index");
  }

  /**
   * discountAddAction 查询优惠券
   * @return {Promise} []
   * code 优惠券代码
   *  
   */
  async discountqueryAction(){
    await this.weblogin();
    let discountlist = await this.model("member").where({id: this.user.uid}).getField("discountlist", true);
    if(think.isEmpty(discountlist)){
        discountlist = [];
        
      }else{
        discountlist = JSON.parse(discountlist);
        //console.log(discountlist);
        discountlist = await this.model("discount").where({code:["IN", discountlist],is_del:0}).select();
      }
      return this.json(discountlist);
    //return this.action("article","index");
  }

  /**
  * getproductinfo 查询产品评论信息 GET
  * product_id:产品ID 必填
  */
  async getproductinfoAction(){
    //await this.weblogin();
    let product_id = this.get("product_id");
    if(think.isEmpty(product_id) || product_id == 0 ){
      return this.fail("产品ID为空");
    }
    think.log(product_id,'BOOKING_GETCOMMENT');
   
    
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
    return this.success(document_tour);
  }

  /**
  * addcomment 提交评论 POST
  * product_id:产品ID 必填
  * comment_content: 评论，纯文本 
  * comment_img: 评论图片，多图片ID用“，”分开       
  * anonymous:1 匿名 0：不匿名   暂不启用
  * score_total: 总评分
  * score_guide: 导游讲解得分
  * score_service: 领队服务得分
  * score_traffic: 交通线路得分
  * score_hotel: 住宿餐食得分
  * comment_guide: 导游讲解得评论
  * comment_service: 领队服务评论
  * comment_traffic: 交通线路评论
  * comment_hotel: 住宿餐食评论
  */
  async addcommentAction(){
    await this.weblogin();
    let data = this.post();
    /*
    let data = {};
    data.product_id = 560;
    data.comment_content = "hahaha哈哈哈";
    data.comment_img = "891";
    data.score_total = 5;
    data.score_guide =5;
    data.score_service = 4;
    data.score_traffic = 3;
    data.score_hotel =4;
    data.comment_hotel = "hahah";
    */
    if(think.isEmpty(data.product_id) || data.product_id == 0 ){
      return this.fail("产品ID为空");
    }
    think.log(data,'BOOKING_ADDCOMMENT');
    data.add_time = new Date().valueOf();
    data.uid = this.user.uid;
    data.ip = _ip2int(this.ip());
    //data.anonymous = data.anonymous||1;
    await this.model("tour_comment").add(data);
    //更新产品总评分
    let document_tour = await this.model("document_tour").where({id:data.product_id}).getField("score,totalsocre,commentcount,socre5,socre4,socre3,socre2,socre1,imgcommentcount",true);
    document_tour.commentcount += 1;

    switch ( Number(data.score_total)) {
        case 5:
          document_tour.socre5 += 1 ;
          break;
        case 4:
          document_tour.socre4 += 1 ;
          break;
        case 3:
          document_tour.socre3 += 1 ;
          break;
        case 2:
          document_tour.socre2 += 1 ;
          break;
        case 1:
          document_tour.socre1 += 1 ;
          break;
        default:    
    }
    document_tour.totalsocre += Number(data.score_total);
    document_tour.score = (document_tour.totalsocre/document_tour.commentcount).toFixed(1);
    if(!think.isEmpty(data.comment_img)){
      document_tour.imgcommentcount += 1;
    }
    await this.model("document_tour").where({id:data.product_id}).update(document_tour);
    //更新订单状态
    //订单状态 status 1,未提交(草稿)2:已提交待确认待付款，3:已取消,4：已付款待确认，5：，6:卖家已确认订单，7:已确认待成团，8:已成团完成订单待评价，9：商户已作废订单， 10:请求退款待确认,11:确认退款，12,:退款中，13退款成功 14:，15:已成团已评价
    //await this.model("order_tour").where({user_id: this.user.uid,order_no:orderid}).update({status: 15});
    return this.success("评论成功");
  }

  //实时查询商品库存
  async getstockAction(){
    let data = this.get();
    let stock = await this.model("order_tour").getstock(data.id,data.type);
    return this.json(stock);
  }






  //编辑购物车数量
  async stepperAction(){
    if(!this.is_login){
      return this.fail("请先登录");
    }
    let data = this.post();
    //console.log(data);
    let ids = data.ids.split("||");
    //检查库存
    let stock = await this.model("order").getstock(ids[0],ids[1]);
    //think.log(stock);
    if(data.qty > stock){
      return this.fail("无货");
    }else {
      let goods = await this.model("cart").where({product_id:ids[0],type:ids[1]||"",uid:this.user.uid}).find();
      let datas = {
        id:goods.id,
        qty:data.qty,
        price:Number(data.qty) * goods.unit_price
      }
      await this.model("cart").update(datas);
      let res = await this.model("cart").find(goods.id);
      return this.success({name:"有货",data:res});
    }
  }
  //删除购物车
  async delcartAction(){
    if(!this.is_login){
      return this.fail("请先登录");
    }
    if(this.isAjax("post")){
      let ids = this.post("ids");
      for(let val of ids.split("<>")){

        let id = await this.model("cart").where({product_id:val.split("||")[0],type:val.split("||")[1]||"",uid:this.user.uid}).delete();
      }
      if (checkMobile(this.userAgent())) {
        return this.success({name:"删除成功！",url:"/uc/cart/index"})
      } else {
        return this.success({name:"删除成功！"})
      }

    }else {
      let ids = this.get("ids");
      if(think.isEmpty(ids)){
        return this.fail("选择要删除的商品")
      }

      this.assign("ids",ids);
      this.meta_title="删除";
      this.active = "/uc/cart/index";
      //判断浏览客户端
      if (checkMobile(this.userAgent())) {
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
      } else {
        return this.display();
      }
    }

  }

  /*
  * 添加购物车
  * postdata: product_id 产品唯一标示ID
  *           type 产品类型
  *           qty:产品购买数量
  */
  async addcartAction(){
    let data = this.post();
    data = think.extend({},data);
    ////console.log(data);
    // 添加购物车前判断是否有库存
    let stock = await this.model("order").getstock(data.product_id,data.type);
    think.log('stock='+stock,'ADDCART');
    if(data.qty > stock){
      return this.json(false);
    }
    //console.log(data);
    //return false;
    let arr=[];
    let cart = this.cart.data;

    if(think.isEmpty(cart)){
      arr.push(data);
    }else{
      //cart = JSON.parse(cart);
      //console.log(cart);
      let typearr = []
      let idarr = []
      //已有购物车数量相加
      for(let item of cart){
        if((item.type == data.type)&&(item.product_id == data.product_id) ){
          item.qty = Number(item.qty) + Number(data.qty);
        }
        arr.push(item);
        idarr.push(item.product_id)
        typearr.push(item.type);
      }
      //没有直接添加商品
      if(!think.isEmpty(data.type)){
        if(!in_array(data.type,typearr)){
          arr.splice(0, 0,data);
        };
      }else {
        if(!in_array(data.product_id,idarr)){
          arr.splice(0, 0,data);
        };
      }

    }
    think.log(arr,'ADDCART');

    //获取商品详细信息
    //{total:222,data:[{title:"dfd",price:34,pic:2,}]}
    //arr.push(data);
    let dataarr = [];
    let total = [];
    let num = [];
    for(let val of arr){
      let dataobj = {}
      let goods = await this.model('document').find(val.product_id);
      let table = await this.model('model').get_table_name(goods.model_id);
      let info = await this.model(table).find(val.product_id);
      goods = think.extend(goods,info);
      dataobj.title=goods.title;
      ////console.log(goods);
      if(think.isEmpty(goods.suk)){
        dataobj.price=get_price(goods.price,1) * Number(val.qty);
        dataobj.unit_price =get_price(goods.price,1);
        dataobj.weight = goods.weight;
        dataobj.pic = await get_pic(goods.pics.split(",")[0],1,100,100);
      }else{
        let suk = JSON.parse(goods.suk);
        let arr_ = val.type.split(",");
        let getpr = getsuk(suk.data,arr_);
        ////console.log(getpr);
        if(suk.is_pic==1){
          dataobj.pic = await get_pic(getpr.pic,1,100,100);
        }else {
          dataobj.pic = await get_pic(goods.pics.split(",")[0],1,100,100);
        }
        dataobj.price = Number(getpr.sku_price) * Number(val.qty);
        dataobj.unit_price =Number(getpr.sku_price);
        dataobj.weight = getpr.sku_weight;
        ////console.log(dataobj.price);
      }

      dataobj.url = get_url(goods.name,goods.id);
      dataobj.product_id = val.product_id;
      dataobj.type = val.type;
      dataobj.qty = Number(val.qty);
      dataarr.push(dataobj);
      total.push(dataobj.price);
      num.push(dataobj.qty);
    }
    //缓存购物车
    if(this.is_login){
      await this.model('cart').where({uid:this.user.uid}).delete()
      for(let val of dataarr){
        val.uid = this.user.uid;
        this.model('cart').add(val);
      }
    }else{
      await this.session("cart_goods_item",dataarr); //将 cookie theme 值设置为 default
    }

    let cartinfo = {
      total:eval(total.join('+')),
      num:eval(num.join('+')),
      data:dataarr
    }

    return this.json(cartinfo);
  }

  //获取订单信息
  async getorderinfoAction(){
    //判断是否登陆
    //!this.is_login || this.fail('您木有登陆');
    await this.weblogin();
    let post = this.param("ids");
    let addrid = this.get("addrid");
    think.log(post,'CART_GETORDERINFO');
    think.log(addrid,'CART_GETORDERINFO');
    if(think.isEmpty(post)){
      this.http.error = new Error('木有选项要结算的宝贝');
      return think.statusAction(702, this.http);
    }
    if(think.isEmpty(this.cart.data)){
      this.http.error = new Error('木有宝贝提交啥订单呢？');
      return think.statusAction(702, this.http);
    }

    //手机端接收
    if (!think.isEmpty(addrid) && checkMobile(this.userAgent())) {
      post = JSON.parse(post);
    }
    this.assign("goodsget",post);
    //构造购物车要结算的宝贝
    let ids=[];
    if(think.isArray(post)){
      for(let v of post){
        ids.push( v.split("||"));
      }
    }else {
      ids.push(post.split("||"));
    }
    let order_amount;//订单金额
    let payable_amount;//应付金额，商品的原价
    let real_amount;//商品参与获得的价格
    let payable_freight;//应付运费
    let real_freight//实际运费

    //TODO购物清单 todo
    //购物车Post过来的商品id;暂时去购物车内所有的商品
    //购物车内的宝贝
    //let cart_goods = await this.model("cart").where({uid:this.user.uid}).select();
    let cart_goods = this.cart.data;
    //筛选要结算的商品
    let check_goods =[];
    for(let val of cart_goods){
      for (let v of ids){
        if(think.isEmpty(v[1]) && think.isEmpty(val.type)){
          if(v[0]==val.product_id){
            check_goods.push(val);
          }
        }else {
          if(v[0]==val.product_id && v[1]==val.type){
            check_goods.push(val);
          }
        }
      }
    }
    this.assign("check_goods",check_goods);
    //   //console.log(cart_goods);
    think.log(check_goods,'CART_GETORDERINFO');
    //应付金额
    let parr = [];
    let nums = [];
    for(let val of check_goods){
      parr.push(val.price);
      nums.push(val.qty)
    }
    ////console.log(parr);
    real_amount = eval(parr.join('+'));
    this.assign("real_amount",real_amount);
    //商品总数量
    this.assign("nums",eval(nums.join('+')));
    //手机端接收
    let map;
    if ( checkMobile(this.userAgent())) {
      if(think.isEmpty(addrid)){
        map={user_id:this.user.uid,is_default:1}
      }else {
        map={user_id:this.user.uid,id:addrid}
      }
    }else {
      map={user_id:this.user.uid};
    }
    //联系人
    let addrlist = await this.model("address").where(map).order("is_default DESC,id DESC").select();
    if(!think.isEmpty(addrlist)){
      for(let val of addrlist){
        val.province_num = val.province;
        val.city_num = val.city;
        val.county_num = val.county;
        val.province = await this.model("area").where({id:val.province}).getField("name",true);
        val.city = await this.model("area").where({id:val.city}).getField("name",true);
        val.county = await this.model("area").where({id:val.county}).getField("name",true);
      }
    }
    this.assign("addrlist",addrlist);

    /** 现在用ping++集成直接，但接入暂时屏蔽
     //支付方式
     let paylist = await this.model("payment").where({status:1}).order("sort ASC").select();
     for(let val of paylist){
           val.logo =  await this.model("pay_plugin").where({id:val.plugin_id}).getField("logo",true);
        }
     this.assign("paylist",paylist);
     **/
        //ping++ 支付渠道 pc网页
        //根据不同的客户端调用不同的支付方式
    let type;
    if (checkMobile(this.userAgent())) {
      type = 2;
    }else {
      type = 1;
    }
    let paylist = await this.model("pingxx").where({type:type,status:1}).order("sort ASC").select();
    this.assign("paylist",paylist);

    //运费计算
    //    1、如果店铺只使用统一运费，那么顾客下单计算时按最低运费收取。
    //    2、如果店铺只使用一种运费模板规则，那么顾客下单计算时均按此规则收取运费。
    //    3、如果店铺使用了不同的运费模板规则，那么顾客下单时各运费模板规则先单独计算运费再叠加。
    //    4、如果店铺同时使用统一运费和不同的运费模板规则，那么顾客下单时统一运费单独计算运费，不同的运费模板
    //TODO
    //计算商品的总重量
    real_freight = await this.model("fare").getfare(check_goods,null,this.user.uid);
    this.assign("real_freight",real_freight);
    //订单促销优惠信息
    //TODO


    //订单金融 实付金额+邮费-订单优惠金额
    //TODO
    // //console.log(real_amount);
    order_amount =Number(real_amount) + Number(real_freight)
    this.assign("order_amount",order_amount);

    //this.end(cart_goods);
    this.meta_title = "确认订单信息";//标题1
    this.keywords = this.setup.WEB_SITE_KEYWORD ? this.setup.WEB_SITE_KEYWORD : '';//seo关键词
    this.description = this.setup.WEB_SITE_DESCRIPTION ? this.setup.WEB_SITE_DESCRIPTION : "";//seo描述
    if (checkMobile(this.userAgent())) {
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    } else {
      return this.display();
    }
  }

  //计算运费
  async getfareAction(){
    if(!this.is_login){
      return this.fail("你木有登录！")
    }
    let cart_goods = this.cart.data;
    //应付金额
    let parr = [];
    for(let val of cart_goods){
      parr.push(val.price);
    }
    ////console.log(parr);
    let real_amount = eval(parr.join('+'));
    let real_freight =  await this.model("fare").getfare(cart_goods,this.get("id"),this.user.uid);
    let order_amount =Number(real_amount) + Number(real_freight);
    let res = {
      real_freight:real_freight,
      order_amount:order_amount
    }
    return this.json(res);
  }
  //订单总额


}