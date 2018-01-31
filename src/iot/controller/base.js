// +----------------------------------------------------------------------
// | PeanutRoll [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.peanutroll.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: zhengqsh <zhengqsh@126.com>
// +----------------------------------------------------------------------
'use strict';

export default class extends think.controller.base {
  init(http) {
    super.init(http);
  }

  async __before() {
    //console.log('end __before');
    //暂时关闭微信登录
    //await this.action("uc/weixin", "oauth");
    //网站配置
    this.setup = await this.model("setup").getset();
    // //console.log(this.setup);
    //当前登录状态
    this.is_login = await this.islogin();
    //用户信息
      this.user = {};
      this.user.roleid=8;//游客
      //访问控制
      if(this.is_login){
          this.user.roleid = await this.model("member").where({id:this.is_login}).getField('groupid', true);
      }
      this.user = think.extend(this.user,await this.session('webuser'));
    //获取当前分类信息
    ////console.log(action);
    // this.meta_title = cate.meta_title?cate.meta_title:cate.title;
    //设置主题
    //this.http.theme("default);
    //购物车
    /*
    let cartList = await this.shopCart();
    let cartInfo;
    if(think.isEmpty(cartList)){
      cartInfo = {
        total:0,
        num:0,
        data:null
      }

    }else{

      let total = [];
      let num = [];
      for(let val of cartList){
        total.push(val.price);
        num.push(val.qty);
        //判断是否有库存
        let stock = await this.model("order").getstock(val.product_id,val.type);

        if(val.qty > stock){
          val.stock = 0;
        }else {
          val.stock =stock;
        }
      }
      cartInfo = {
        total:eval(total.join('+')),
        num:eval(num.join('+')),
        data:cartList
      }
    }
    this.cart = cartInfo;
    */
  }
  /**
   * 判断是否登录
   * @returns {boolean}
   */
  async islogin() {
    //前台判断是否登录
    let user = await this.session('webuser');
    let res = think.isEmpty(user) ? false : user.uid;
    return res;

  }
  async weblogin(){
    let islogin =await this.islogin();
    if(!islogin){
      //判断浏览客户端
      if (checkMobile(this.userAgent())) {
        //手机端直接跳转到登录页面
        return this.redirect('/uc/public/login')
      } else {
        //pc端跳转到错误页面
        return think.statusAction(700,this.http);
      }

    }
  }



  /**
   * 处理文档列表显示
   * @param {array} list 列表数据
   * @param {integer} model_id 模型id
   */
  async parseDocumentList(list, model_id) {
    model_id = model_id || 1;
    let attrList = await this.model('attribute').get_model_attribute(model_id, false, 'id,name,type,extra');
    //attrList=attrList[model_id];
    //this.end(attrList);
    // //console.log(attrList);
    if (think.isArray(list)) {
      list.forEach((data, k) => {
        ////console.log(data);
        for (let key in data) {
          ////console.log(key)
          if (!think.isEmpty(attrList[key])) {
            let extra = attrList[key]['extra'];
            let type = attrList[key]['type'];
            ////console.log(extra);
            if ('select' == type || 'checkbox' == type || 'radio' == type || 'bool' == type) {
              // 枚举/多选/单选/布尔型
              let options = parse_config_attr(extra);
              let oparr = Object.keys(options);
              if (options && in_array(data[key], oparr)) {
                data[key] = options[data[key]];
              }
            } else if ('date' == type) { // 日期型
              data[key] = dateformat('Y-m-d', data[key]);
            } else if ('datetime' == type) { // 时间型
              data[key] = dateformat('Y-m-d H:i', data[key]);
            } else if ('pics' === type) {
              data[key] = `<span class="thumb-sm"><img alt="..." src="${data[key]}" class="img-responsive img-thumbnail"></span>`;
            }
          }
        }
        data.model_id = model_id;
        list[k] = data;
      })
      ////console.log(222)
      return list;
    }
  }
  //跨域设置
  setCorsHeader(){
    this.header("Access-Control-Allow-Origin", this.header("origin") || "*");
    this.header("Access-Control-Allow-Headers", "x-requested-with");
    this.header("Access-Control-Request-Method", "GET,POST,PUT,DELETE");
    this.header("Access-Control-Allow-Credentials", "true");
  }

}
