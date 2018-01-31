'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    return this.display();
  }
  /**
   * 注册页面
   */
  async registerAction() {
    if(this.isPost()){
      let data = this.post();
      //console.log(data);
      //验证
      let res;
      if(think.isEmpty(data.username)){
        return this.fail("用户昵称不能为空！");
      }else{
        res = await this.model("member").where({username:ltrim(data.username)}).find();
        if(!think.isEmpty(res)){
          return this.fail("用户昵称已存在，请重新填写！")
        }
      }
      if(think.isEmpty(data.mobile)){
        return this.fail("手机号码不能为空！")
      }else{
        res = await this.model("member").where({mobile:data.mobile}).find();
        if(!think.isEmpty(res)){
          return this.fail("手机号码已存在，请重新填写！")
        }
      }
      if(think.isEmpty(data.email)){
        return this.fail("电子邮箱不能为空！")
      }else{
        res = await this.model("member").where({email:data.email}).find();
        if(!think.isEmpty(res)){
          return this.fail("电子邮箱已存在，请重新填写！")
        }
      }
      if(think.isEmpty(data.password) && think.isEmpty(data.password2)){
        return this.fail("密码不能为空！")
      }else{

        if(data.password != data.password2){
          return this.fail("两次输入的密码不一致，请重新填写！")
        }
      }
      if(data.clause != "on"){
        return this.fail("必须要同意,网站服务条款")
      }

      data.status = 1;
      data.reg_time = new Date().valueOf();
      data.reg_ip = _ip2int(this.ip());
      data.password = encryptPassword(data.password);
      let reg = await this.model("member").add(data);
      await this.model("member").autoLogin({id:reg}, this.ip());//更新用户登录信息，自动登陆
      let userInfo = {
        'uid':reg,
        'username': data.username,
        'last_login_time': data.reg_time,
      };
      await this.session('webuser', userInfo);
      return this.success({name:"注册成功,登录中!",url:"/uc/index"});
    }else {
      this.meta_title = "手机注册";
      return this.display();
    }

  }
    /**
   * 注册引导页面
   */
  async startregisterAction() {
 
    this.meta_title = "注册花生卷账号";
    //return this.display();
    //判断浏览客户端
  	if (checkMobile(this.userAgent())) {
  	  this.active = "user/index";
  	  return this.display(`mobile/${this.http.controller}/${this.http.action}`)
  	} else {
  	  return this.display();
  	}

  }
  //   登陆页面
  async loginAction() {
      console.log('loginAction');

    if (this.isAjax("post")) {
//验证码
    /*
      if(1==this.setup.GEETEST_IS_LOGIN){
        let Geetest = think.service("geetest"); //加载 commoon 模块下的 geetset service
        let geetest = new Geetest();
        let res = await geetest.validate(this.post(),this.get('type'));
        //console.log(res);
        if("success" != res.status){
          // this.http.error = new Error("验证码不正确");
          // return think.statusAction(702, this.http);
          return this.fail(-3,"验证码不正确!");
        }
      }
      */
//用户账号密码验证
      let username = this.post('username');
      let password = this.post('password');
      console.log('password:'+password);
      password = encryptPassword(password);
      let res = await this.model("member").signin(username, password, this.ip(), 5,0);
      console.log(res.uid);
      if (0 < res.uid) {
        //记录用户登录行为
        // await this.model("action").log("user_login", "member", res.uid, res.uid, this.ip(), this.http.url);
        // //console.log(111111111111121);
        // //console.log(res);
        await this.session('webuser', res);
        //TODO 用户密钥
        return this.success({name: '登录成功！'});
      } else { //登录失败
        let fail;
        switch (res) {
          case -1:
            fail = '用户不存在或被禁用';
            break; //系统级别禁用
          case -2:
            fail = '密码错误';
            break;
          default:
            fail = '未知错误';
            break; // 0-接口参数错误（调试阶段使用）
        }
        return this.fail(res, fail);
      }
    } else {
      //如果已经登陆直接跳转到用户中心
      if (this.is_login) {
        this.redirect("/index")

      }
      this.meta_title = "用户登录";
      //判断浏览客户端
      if (checkMobile(this.userAgent())) {
        this.active = "/index";
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
      } else {
        return this.display();
      }
    }

  }

  //登录模态框
  async loginmodalAction(){
    return this.display()
  }

/* 获取短信验证码
*  mobile:手机号 目前支持大陆地区 默认+86
*  type:短信类型 1：注册短信，2：忘记密码短信
*  check: 是否检查手机号已注册 1：检查手机号  目前强制检查
*  
*/
  async verifycodesendAction(){
    if(!this.isPost()){
      return this.fail("请求错误！")
    }
    let data = this.post();
    let code = MathRand();

    data.check = 1;// 强制检查手机号
    if(data.check ==1){
      let res = await this.model("member").where({mobile:data.mobile}).find();
      if(!think.isEmpty(res) && data.type==1){
        return this.fail("该手机号已注册！")
      }
      if(think.isEmpty(res) && data.type==2){
        return this.fail("该手机号未注册！")
      }
    }
    //检查执行周期
    let map = {
      mobile:data.mobile,
      type:data.type
    }
    map.create_time = [">",new Date().valueOf() - 24 * 3600 * 1000]
    //console.log(map);
    let exec_count = await this.model("sms_log").where(map).count();
    //console.log(exec_count);
    if(exec_count >= 30 ){
      return this.fail("发送过于频发请24小时后，再尝试。")
    }

    let dayu = think.adapter("alidayu", "client");
    let instance = new dayu();
    let qianming = this.setup.SMS_qianming;
    let temp_code;
    if(data.type ==1||data.type ==2){
      temp_code = this.setup.SMS_zhuce
    }
    let info = {
      'extend':data.mobile,
      'sms_type':'normal',
      'sms_free_sign_name':qianming,
      'sms_param':`{"code":"${code}","product":"${this.setup.SMS_product}"}`,
      'rec_num':data.mobile,
      'sms_template_code':temp_code
    }
    let result = await instance.send(info);
    console.log(result);
    // let result ={ err_code: '0',
    //     model: '102201717069^1102848633337',
    //     success: true }
    //console.log(result);
    //发送成功记录到数据库
    if( result.result && 0 == result.result.err_code){
      await this.model("sms_log").add({
        mobile:data.mobile,
        type:data.type,
        code:code,
        create_time:new Date().valueOf()
      });
    }
    return this.json(result.result)
  }


/* 短信注册
*  mobile:手机号 目前支持大陆地区 默认+86
*  sms_type:短信类型 1：注册短信，2：忘记密码短信
*  check: 是否检查手机号已注册 1：检查手机号  目前强制检查
*  password：密码，密码需包含字母+数字的8-16位字符
*  username：用户名，需唯一
*/
  async smsregAction(){
    let data = this.post();
    //对比验证码
    let map = {
      mobile:data.mobile,
      type:data.sms_type
    }
    map.create_time = [">",new Date().valueOf() - 1 * 3600 * 1000]
    ////console.log(map);
    let code = await this.model("sms_log").where(map).order("id DESC").getField("code",true);
    if(think.isEmpty(code)||code != data.verifycode){
      return this.fail("验证码不正确!")
    }
    //let patrn=/^(\w){8,16}$/;//只能输入6-20个字母、数字、下划线
    let patrn = /^(?=.*[0-9])(?=.*[a-zA-Z])^[A-Za-z0-9\x21-\x7e]{8,16}$/;//密码需包含字母+数字的8-16位字符
    if (!patrn.test(data.password)){
      return this.fail("密码：需包含字母和数字的8-16为字符")
    }
    //检查用户名唯一
    let res = await this.model("member").where({username:data.username}).find();
      if(!think.isEmpty(res)){
        return this.fail("该用户名已注册！")
    }
    // data.email = 0;
    // data.username = data.mobile;
    data.status = 1;//默认激活
    data.reg_time = new Date().valueOf();
    data.reg_ip = _ip2int(this.ip());
    data.password = encryptPassword(data.password);
    let reg = await this.model("member").add(data);
    if(reg){
      //用户副表
      await this.model("customer").add({user_id:reg});
    }
    await this.model("member").autoLogin({id:reg}, this.ip());//更新用户登录信息，自动登陆
    let userInfo = {
      'uid':reg,
      'username': data.username,
      'last_login_time': data.reg_time,
    };
    await this.session('webuser', userInfo);
    return this.success({name:"注册成功,登录中!",url:"/uc/index"});
  }

/* 短信忘记密码注
*  mobile:手机号 目前支持大陆地区 默认+86
*  sms_type:短信类型 1：注册短信，2：忘记密码短信
*  check: 是否检查手机号已注册 1：检查手机号  目前强制检查
*  password：密码，密码需包含字母+数字的8-16位字符
*  username：用户名，需唯一
*/
  async smsforgotpwAction(){
    let data = this.post();
    let user = await this.model("member").where({mobile:data.mobile}).find();
      if(think.isEmpty(user) ){
        return this.fail("该手机号未注册！")
    }
    //对比验证码
    let map = {
      mobile:data.mobile,
      type:data.sms_type
    }
    map.create_time = [">",new Date().valueOf() - 1 * 3600 * 1000]
    // //console.log(map);
    let code = await this.model("sms_log").where(map).order("id DESC").getField("code",true);
    if(think.isEmpty(code)||code != data.verifycode){
      return this.fail("验证码不正确!")
    }


    //let patrn=/^(\w){8,16}$/;//只能输入6-20个字母、数字、下划线
    let patrn = /^(?=.*[0-9])(?=.*[a-zA-Z])^[A-Za-z0-9\x21-\x7e]{8,16}$/;//密码需包含字母+数字的8-16位字符
    if (!patrn.test(data.password)){
      return this.fail("密码：需包含字母和数字的8-16为字符")
    }
    data.email = 0;
    // data.username = data.mobile;
    data.status = 1;
    data.reg_time = new Date().valueOf();
    data.reg_ip = _ip2int(this.ip());
    data.password = encryptPassword(data.password);
    let reg = await this.model("member").add(data);
    if(reg){
      //用户副表
      await this.model("customer").add({user_id:reg});
    }


    //await this.model("member").autoLogin({id:reg}, this.ip());//更新用户登录信息，自动登陆

    let userInfo = {
      'uid':user.uid,
      'username': user.username,
      'last_login_time': new Date().valueOf(),
    };
    await this.session('webuser', userInfo);
    return this.success({name:"验证成功,修改密码!",url:"/uc/changepw"});
  }

  /***
  *密码找回页面
  **/
  async findpwAction(){
    this.meta_title = "找回密码";
     //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "user/index";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    } else {
      return this.display();
    }
  }
  /**
   * 短信找回密码：验证手机号
   */

    async forgotpwAction(){
      let data = this.post();
      console.log(data);
      let user = await this.model("member").where({mobile:data.mobile}).find();
        if(think.isEmpty(user) ){
          return this.fail("该手机号未注册！")
      }
      //对比验证码
      let map = {
        mobile:data.mobile,
        type:data.sms_type
      }
      map.create_time = [">",new Date().valueOf() - 1 * 3600 * 1000]
      // //console.log(map);
      let code = await this.model("sms_log").where(map).order("id DESC").getField("code",true);
      if(think.isEmpty(code)||code != data.verifycode){
        return this.fail("验证码不正确!")
      }else{
        return this.success({name:"验证成功,修改密码!",url:"/uc/public/changepw?mobile="+data.mobile+"&verifycode="+data.verifycode+"&sms_type="+data.sms_type});
      }
     
  }

    /**
   * 重置密码页面
   */
  async changepwAction(){
    if(!this.get("mobile") || !this.get("sms_type") || !this.get("verifycode")){
      return this.redirect(`/uc/public/findpw`)
    }
	let user = await this.model("member").where({mobile:this.get("mobile")}).find();
      if(think.isEmpty(user) ){
          return this.redirect(`/uc/public/findpw`)
    }
	//对比验证码
    let map = {
       mobile:this.get("mobile"),
       type:this.get("sms_type")
    }
    map.create_time = [">",new Date().valueOf() - 1 * 3600 * 1000]
    // //console.log(map);
    let code = await this.model("sms_log").where(map).order("id DESC").getField("code",true);
    if(think.isEmpty(code)||code != this.get("verifycode")){
        return this.redirect(`/uc/public/findpw`)
    }else{
      this.meta_title = "重置密码";
        //判断浏览客户端
      if (checkMobile(this.userAgent())) {
        this.active = "user/index";
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
      } else {
        return this.display();
      }

    }         
  }

  //重置密码
  async resetingAction(){
    // let mobnum = this.get("mobile");
    // mobnum = parseInt(mobnum);
    let data = this.post();
    let patrn = /^(?=.*[0-9])(?=.*[a-zA-Z])^[A-Za-z0-9\x21-\x7e]{8,16}$/;//密码需包含字母+数字的8-16位字符
    if(think.isEmpty(data.firstpw)){
      return this.fail("请填写新密码！")
    }else if(think.isEmpty(data.secondpw)){
      return this.fail("请再次输入密码！")
    }else if(data.firstpw != data.secondpw){
      return this.fail("您第二次输入的密码有误！")
    }else if(!patrn.test(data.secondpw)){
      return this.fail("密码：需包含字母和数字的8-16位字符")
    }else if(data.firstpw == data.secondpw){
      await this.model("member").where({mobile:data.mobile}).update({password:encryptPassword(data.secondpw)});
      return this.success({name:"修改密码成功，请用新密码重新登陆!",url:"/uc/public/login"});
    }

  }

  async verifymemberAction(){
    let v = this.get("v");
    let f = this.get("f");
    let map = {}
    map[f]=v;
    let res = await this.model("member").where(map).find();
    if(!think.isEmpty(res)){
      return this.fail("已存在");
    }else {
      return this.success("不存在");
    }
  }

  //退出登录
  async logoutAction() {
    //退出登录

    if (this.is_login) {

      await this.session('webuser', null);
      //清楚cy_id
      //await this.session("wx_openid",null);
      // cysoIp9AH
      return this.display()

    } else {
      this.redirect("/index");
    }
  }

}