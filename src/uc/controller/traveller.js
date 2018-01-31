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
    let data = await this.model("traveller").where({user_id: this.user.uid}).page(this.get('page')).order("id DESC").countSelect();
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
    think.log(data,'TRAVELLER_INDEX');
    this.assign('pagination', html);
    if (!think.isEmpty(data.data)) {
      for (let val of data.data) {
        let credentials_name = ['护照','港澳通行证','台湾通行证'];
        let traveller_type = ['成人','儿童','婴儿'];
        val.credentials_type_name = credentials_name[val.credentials_type];
        val.type_name = traveller_type[val.type];
        //val.province_num = val.province;
        //val.city_num = val.city;
        //val.county_num = val.county;
        //val.province = await this.model("area").where({id: val.province}).getField("name", true);
        //val.city = await this.model("area").where({id: val.city}).getField("name", true);
        //val.county = await this.model("area").where({id: val.county}).getField("name", true);
      }
    }
    console.log(data)
    this.assign("list", data);
    this.meta_title = "旅客信息";
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "user/index";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    } else {
      return this.display();
    }
  }
  /**
   * 查询旅客信息
   * q : 查询关键字
   * @returns {PreventPromise}
   */
  async queryAction() {
    //判断是否登陆
    let islogin = await this.jsonlogin();
    if(!islogin){
      return this.fail("未登录");
    }
    let map ={'user_id':this.user.uid};
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


    }

    let data;
    if(searchword.length > 0){
         map.name_zh = ["like",searchword];
    }
    //console.log(map);
    data = await this.model("traveller").where(map).page(this.param('page'),100).order("id DESC").countSelect();
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
    //think.log(data,'TRAVELLER_INDEX');
    this.assign('pagination', html);
    if (!think.isEmpty(data.data)) {
      for (let val of data.data) {
        let credentials_name = ['护照','港澳通行证','台湾通行证'];
        let traveller_type = ['成人','儿童','婴儿'];
        val.credentials_type_name = credentials_name[val.credentials_type];
        val.type_name = traveller_type[val.type];
        //val.province_num = val.province;
        //val.city_num = val.city;
        //val.county_num = val.county;
        //val.province = await this.model("area").where({id: val.province}).getField("name", true);
        //val.city = await this.model("area").where({id: val.city}).getField("name", true);
        //val.county = await this.model("area").where({id: val.county}).getField("name", true);
      }
    }
    data.html =html;
    this.assign("list", data.data);
    this.meta_title = "旅客信息";
    return this.json(data);
  }
  async mobilequeryAction(){
    //判断是否登陆
    await this.weblogin();
    let data = await this.model("traveller").where({user_id: this.user.uid}).page(this.get('page')).order("id DESC").countSelect();
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
    think.log(data,'TRAVELLER_INDEX');
    this.assign('pagination', html);
    if (!think.isEmpty(data.data)) {
      for (let val of data.data) {
        let credentials_name = ['护照','港澳通行证','台湾通行证'];
        let traveller_type = ['成人','儿童','婴儿'];
        val.credentials_type_name = credentials_name[val.credentials_type];
        val.type_name = traveller_type[val.type];
        //val.province_num = val.province;
        //val.city_num = val.city;
        //val.county_num = val.county;
        //val.province = await this.model("area").where({id: val.province}).getField("name", true);
        //val.city = await this.model("area").where({id: val.city}).getField("name", true);
        //val.county = await this.model("area").where({id: val.county}).getField("name", true);
      }
    }
    console.log(data)
    this.assign("list", data);
    this.meta_title = "旅客信息";
    return this.json(data)
  }
  //mobile查看
  async checkAction(){
    //判断是否登陆
    await this.weblogin();
    let id = this.get("id");
    console.log(id)
    let data = await this.model("traveller").where({user_id: this.user.uid,id:id}).page(this.param('page'),1000).order("id DESC").countSelect();
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
    think.log(data,'TRAVELLER_INDEX');
    this.assign('pagination', html);
    if (!think.isEmpty(data.data)) {
      for (let val of data.data) {
        let credentials_name = ['护照','港澳通行证','台湾通行证'];
        let traveller_type = ['成人','儿童','婴儿'];
        val.credentials_type_name = credentials_name[val.credentials_type];
        val.type_name = traveller_type[val.type];
        //val.province_num = val.province;
        //val.city_num = val.city;
        //val.county_num = val.county;
        //val.province = await this.model("area").where({id: val.province}).getField("name", true);
        //val.city = await this.model("area").where({id: val.city}).getField("name", true);
        //val.county = await this.model("area").where({id: val.county}).getField("name", true);
      }
    }
    console.log(data.data)
    this.assign("list", data.data);
    this.meta_title = "查看旅客信息";
     //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "user/index";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }
  }
  //mobile编辑旅客信息
  async editAction(){
    //判断是否登陆
    await this.weblogin();
    let id = this.get("id");
    let type = this.get("type")
    console.log(id)
    if(!think.isEmpty(id)){
      let data = await this.model("traveller").where({user_id: this.user.uid,id:id}).page(this.param('page'),1000).order("id DESC").countSelect();
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
      think.log(data,'TRAVELLER_INDEX');
      this.assign('pagination', html);
      if (!think.isEmpty(data.data)) {
        for (let val of data.data) {
          let credentials_name = ['护照','港澳通行证','台湾通行证'];
          let traveller_type = ['成人','儿童','婴儿'];
          val.credentials_type_name = credentials_name[val.credentials_type];
          val.type_name = traveller_type[val.type];
          //val.province_num = val.province;
          //val.city_num = val.city;
          //val.county_num = val.county;
          //val.province = await this.model("area").where({id: val.province}).getField("name", true);
          //val.city = await this.model("area").where({id: val.city}).getField("name", true);
          //val.county = await this.model("area").where({id: val.county}).getField("name", true);
        }
      }
      console.log(data.data)
      this.assign("type",type)
      this.assign("list", data.data);
      this.meta_title = "编辑旅客信息";
    }else{
      this.meta_title = "新增旅客信息";
    }
    
     //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "user/index";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }
  }

  //添加或者更新联系人地址
  async addaddrAction(){
    await this.weblogin();

    let data = this.post();
    data.user_id = this.user.uid;
    //console.log(data);
    /*
    if(data.is_default == 1){
      let find = await this.model("address").where({user_id:this.user.uid,is_default:1}).select();
      for(let val of find){
        val.is_default = 0;
        await this.model("address").update(val);
      }
    }
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      if (!think.isEmpty(data.city_picke)) {
        let city_picke = data.city_picke.split(" ");
        data.province = await this.model("area").where({
          name: ["like", `%${city_picke[0]}%`],
          parent_id: 0
        }).getField("id", true);
        data.city = await this.model("area").where({
          name: ["like", `%${city_picke[1]}%`],
          parent_id: data.province
        }).getField("id", true);
        data.county = await this.model("area").where({
          name: ["like", `%${city_picke[2]}%`],
          parent_id: data.city
        }).getField("id", true);
      }
    }*/
    let res
    if(think.isEmpty(data.id)){
      res = await this.model("traveller").add(data);
    }else{
      res = await this.model("traveller").update(data);
    }

    if(res){

      //判断浏览客户端
      if (checkMobile(this.userAgent())) {

        return this.success({name:'操作成功',url:data.resurl});
      } else {
        //刷新页面
        let addrlist = await this.model("address").where({user_id:this.user.uid}).order("id DESC").select();
        for(let val of addrlist){
          let credentials_name = ['护照','港澳通行证','台湾通行证'];
          let traveller_type = ['青少年','儿童','婴儿'];
          val.credentials_type_name = credentials_name[val.credentials_type];
          val.type_name = traveller_type[val.type];
          //val.province = await this.model("area").where({id:val.province}).getField("name",true);
          //val.city = await this.model("area").where({id:val.city}).getField("name",true);
          //val.county = await this.model("area").where({id:val.county}).getField("name",true);
        }
        return this.success(addrlist);
      }

    }else{
      return this.fail('操作失败！');

    }

  }


  //删除旅客信息
  async deladdrAction(){
    await this.weblogin();
    let id = this.param("id");
    let res = await this.model("traveller").where({user_id:this.user.uid,id:id}).delete();
    if(res){
      let addrlist = await this.model("traveller").where({user_id:this.user.uid}).order("id DESC").select();
      for(let val of addrlist){
        let credentials_name = ['护照','港澳通行证','台湾通行证'];
        let traveller_type = ['成人','儿童','婴儿'];
        val.credentials_type_name = credentials_name[val.credentials_type];
        val.type_name = traveller_type[val.type];
        //val.province = await this.model("area").where({id:val.province}).getField("name",true);
        //val.city = await this.model("area").where({id:val.city}).getField("name",true);
        //val.county = await this.model("area").where({id:val.county}).getField("name",true);
      }
      //判断浏览客户端
      if (checkMobile(this.userAgent())) {
        return this.success({name:'删除成功',url:this.post("resurl")});
      } else {
        return this.success('删除成功');
      }

    }else{
      return this.fail( '删除失败！');

    }
  }
//编辑地址
  async editaddrmodalAction(){
    await this.weblogin();
    let id = this.get("id");
    if(!think.isEmpty(id)){

      //获取地址信息
      let travellers = await this.model("traveller").where({user_id:this.user.uid}).find(id);
      /*
      let province, city, county;
      //获取省份
      if (checkMobile(this.userAgent())) {
        province = await this.model('area').where({id: address.province}).getField("name", true);
        city = await this.model('area').where({id: address.city}).getField("name", true);
        county = await this.model('area').where({id: address.county}).getField("name", true);
      } else {
        province = await this.model('area').where({parent_id: 0}).select();
        city = await this.model('area').where({parent_id: address.province}).select();
        county = await this.model('area').where({parent_id: address.city}).select();
      }
      this.assign("province",province);
      this.assign("city",city);
      this.assign("county",county);
      */
      this.assign("info",travellers);
      this.assign("type",this.get("type"));
      this.meta_title="编辑旅客"
    }else {
      this.meta_title="添加旅客"
    }

    if (checkMobile(this.userAgent())) {
      this.active = "user/index";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    } else {
      return this.display();
    }
  }





  //获取省市三级联动
  async getareaAction(){

    let pid = this.get("pid");
    let area = await this.model('area').where({parent_id:pid}).select()
    return this.json(area);
  }
  //选择收货地址（仅手机端用）
  async selectaddrAction(){
    await this.weblogin();
    let get = this.get();
    let data = await this.model("address").where({user_id: this.user.uid}).order("is_default DESC,id DESC").select();
    if (!think.isEmpty(data)) {
      for (let val of data) {
        val.province_num = val.province;
        val.city_num = val.city;
        val.county_num = val.county;
        val.province = await this.model("area").where({id: val.province}).getField("name", true);
        val.city = await this.model("area").where({id: val.city}).getField("name", true);
        val.county = await this.model("area").where({id: val.county}).getField("name", true);
      }
    }
    this.assign("list", data);
    this.assign("goodsget",get.goodslist);
    this.assign("id",get.id);
    this.meta_title = "选择收货地址";
    if (checkMobile(this.userAgent())) {
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    } else {
      return this.display();
    }
  }
  //联系人设置为默认
  async addrisdefaultAction(){
    await this.weblogin();
    let id = this.get("id");
    let find = await this.model("address").where({user_id:this.user.uid}).order("is_default ASC").select();
    for(let val of find){
      if(val.id == id){
        val.is_default = 1;
      }else{
        val.is_default = 0;
      }
      await this.model("address").update(val);
      val.province = await this.model("area").where({id:val.province}).getField("name",true);
      val.city = await this.model("area").where({id:val.city}).getField("name",true);
      val.county = await this.model("area").where({id:val.county}).getField("name",true);
    }
    return this.success({name:'设置成功！',data:find});

  }
  //获取当前选择的地址
  async getaddrAction(){
    await this.weblogin();
    let id = this.get("id");
    let addr = await this.model("address").where({user_id:this.user.uid}).find(id);
    addr.province = await this.model("area").where({id:addr.province}).getField("name",true);
    addr.city = await this.model("area").where({id:addr.city}).getField("name",true);
    addr.county = await this.model("area").where({id:addr.county}).getField("name",true);
    return this.success({name:"选择地址！",data:addr});
  }
}

