'use strict';
import Jimp from "jimp";
import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  //   用户设置
  async indexAction() {
    //判断是否登陆
    await this.weblogin();
    //获取用户信息
    let userInfo = await this.model("member").find(this.user.uid);
      //console.log(userInfo);
      ////console.log(userInfo);
    this.assign("userInfo", userInfo);
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

    this.assign("province", province);
    this.assign("city", city);
    this.assign("county", county);
    this.assign("start_province", province);
    this.assign("start_city", start_city);
    this.meta_title = "用户设置";
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "user/index";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    } else {
      return this.display();
    }
  }

  /**
   * index action
   * @return {Promise} []
   */
  //   用户设置
  async queryAction() {
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

    //this.assign("province", province);
    //this.assign("city", city);
    //this.assign("county", county);
    //this.assign("start_province", province);
    //this.assign("start_city", start_city);
    //this.meta_title = "用户设置";

    
    return this.json(userInfo);
  }
  //更新用户信息
  async updateinfoAction() {
    //判断是否登陆
    await this.weblogin();
    let data = this.post();
    think.log(data);
    let member = {
      email: data.email,
      mobile: data.mobile,
      real_name: data.real_name,
      sex: data.sex,
      //birthday: new Date(data.birthday).getTime(),
      province: data.province,
      city: data.city,
      county: data.county,
      addr: data.addr,
      phone_zone:data.phone_zone,
      phone_number:data.phone_number,
      phone_ext:data.phone_ext,
      start_province:data.start_province,
      start_city:data.start_city,
      connect_name:data.connect_name,
      connect_phone:data.connect_phone,
      connect_email:data.connect_email
    } 

    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      if (!think.isEmpty(data.city_picke)) {
        let city_picke = data.city_picke.split(" ");
          member.province = await this.model("area").where({
          name: ["like", `%${city_picke[0]}%`],
          parent_id: 0
        }).getField("id", true);
          member.city = await this.model("area").where({
          name: ["like", `%${city_picke[1]}%`],
          parent_id: member.province
        }).getField("id", true);
          member.county = await this.model("area").where({
          name: ["like", `%${city_picke[2]}%`],
          parent_id: member.city
        }).getField("id", true);
      }
    }

    let update = await this.model("member").where({id: this.user.uid}).update(member);
    // think.log(customer);
    if (update ) {
      return this.success({name: "更新用户资料成功！"})
    } else {
      return this.fail("更新失败！")
    }

  }

  //修改密码
  async updatepasswordAction() {
    //判断是否登陆
    await this.weblogin();
    let data = this.post();
    if(think.isEmpty(data.password)){
      return this.fail("请填写新密码！")
    }
    let password = await this.model("member").where({id: this.user.uid}).getField("password", true);
    if (password === encryptPassword(data.oldpassword)) {
      await this.model("member").where({id: this.user.uid}).update({password: encryptPassword(data.password)})
      return this.success({name: "密码修改成功，请用新密码重新登陆！"});
    } else {
      return this.fail("旧密码不正确，请重新输入。")
    }

  }

  //上传头像
  async updateavatarAction() {
    //console.log("-------------");
    //判断是否登陆
    await this.weblogin();
    let file = think.extend({}, this.file('file'));
    //console.log(file);
    //think.log(avatar_data);
    var filepath = file.path;
    //文件上传后，需要将文件移动到项目其他地方，否则会在请求结束时删除掉该文件
    var uploadPath = think.RESOURCE_PATH + '/upload/avatar/' + this.user.uid;
    think.mkdir(uploadPath);
    let res;
    if (checkMobile(this.userAgent())) {
      let jimp2 = ()=> {
        //console.log(111)
        let deferred = think.defer();
        let self = this;
        Jimp.read(filepath, function (err, lenna) {
          if (err) throw err;
          lenna.resize(200, 200)            // resize
              .quality(60)                 // set JPEG quality
              .write(uploadPath + "/avatar.png", function (e, r) {
                deferred.resolve('/upload/avatar/' + self.user.uid + "/avatar.png");
              }); // save
        });
        return deferred.promise;
      }
      res = await jimp2();
    } else {
      let post = this.post();
      let avatar_data = JSON.parse(post.avatar_data);
      let jimp = () => {
        let deferred = think.defer();
        let self = this;
        Jimp.read(filepath, function (err, lenna) {
          ////console.log(lenna)

          if (err) throw err;
          lenna.crop(avatar_data.x, avatar_data.y, avatar_data.width, avatar_data.height)            // resize
              .quality(60)
              .write(uploadPath + "/avatar.png", function (e, r) {
                deferred.resolve('/upload/avatar/' + self.user.uid + "/avatar.png");
              }); // save

        });
        return deferred.promise;
      }
      res = await jimp();
    }


    //think.log(res);
    let data = {
      "result": res,
      "errno": 0,
      "message": "头像上传成功！"
    }
    //console.log(data);
    return this.end(data);
  }
}