'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  //在线投稿
  async indexAction(){
    await this.weblogin();
    let cate_id = this.get('cate_id') || null;
    //console.log(cate_id);
    //权限控制
    let priv = await this.priv(cate_id);
    if(priv){
      this.http.error = new Error('网站禁止投稿！');
      return think.statusAction(702, this.http);
    }

    //let [model_id=null,position=null,group_id=null,sortid=null,sortval=null]=[this.get('model_id'),this.get('position'),this.get('group_id'),this.get('sortid'),this.get('sortval')];

    let model_id = this.get('model_id') || null;
    let position = this.get('position') || null;
    let group_id = this.get('group_id') || 0;
    let sortid = this.get('sortid')||0;
    let sortval = this.get('sortval')||null;
    let models,groups,model,_model;
    // let groups;
    // let model;
    // let _model;
    if (!think.isEmpty(cate_id)) {
      // 获取分类信息
      let sort = await this.model("category").get_category(cate_id, 'documentsorts');
      if (sort) {
        sort = JSON.parse(sort);
        if(sortid==0){
          sortid=sort.defaultshow;
        }
        let typevar = await this.model("typevar").where({sortid:sortid}).select();
        for (let val of typevar){

          val.option= await this.model("typeoption").where({optionid:val.optionid}).find();
          if(val.option.type == 'select'||val.option.type == 'radio'){
            if(!think.isEmpty(val.option.rules)){
              val.option.rules = JSON.parse(val.option.rules);
              val.rules=parse_type_attr(val.option.rules.choices);
              val.option.rules.choices = parse_config_attr(val.option.rules.choices);
            }

          }else if(val.option.type == 'checkbox'){
            if(!think.isEmpty(val.option.rules)){
              val.option.rules = JSON.parse(val.option.rules);
              val.rules=parse_type_attr(val.option.rules.choices);
              //console.log(val.rules);
              for(let v of val.rules){
                v.id = "l>"+v.id
              }
              val.option.rules.choices = parse_config_attr(val.option.rules.choices);
              ////console.log(val.rules);
            }
          }else if(val.option.type == 'range'){
            if(!think.isEmpty(val.option.rules)){
              let searchtxt = JSON.parse(val.option.rules).searchtxt;
              let searcharr = []
              if(!think.isEmpty(searchtxt)){
                let arr = searchtxt.split(",");
                let len = arr.length;
                for (var i=0;i<len;i++)
                {
                  let obj = {}
                  if (!think.isEmpty(arr[i-1])){
                    if(i==1){
                      obj.id = 'd>'+arr[i];
                      obj.name = '低于'+arr[i]+val.option.unit;
                      obj.pid=0
                      searcharr.push(obj);
                    }else {
                      obj.id = arr[i-1]+'>'+arr[i];
                      obj.name = arr[i-1]+"-"+arr[i]+val.option.unit;
                      obj.pid=0
                      searcharr.push(obj)
                    }

                  }

                }
                searcharr.push({id:'u>'+arr[len-1],name:'高于'+arr[len-1]+val.option.unit,pid:0})
              }
              ////console.log(searcharr);
              val.option.rules = JSON.parse(val.option.rules);
              val.rules=searcharr;
              // val.option.rules.choices = parse_config_attr(val.option.rules.choices);

            }
          }
        }
        ////console.log(typevar);
        this.assign("typevar",typevar);
      }
      ////console.log(sort);
      this.assign("sort",sort);
      let pid = this.get("pid") || 0;
      // 获取列表绑定的模型
      if (pid == 0) {
        models = await this.model("category").get_category(cate_id, 'model');
        // 获取分组定义
        groups = await this.model("category").get_category(cate_id, 'groups');
        if (groups) {
          groups = parse_config_attr(groups);
        }
      } else { // 子文档列表
        models = await this.model("category").get_category(cate_id, 'model_sub');
      }
      //获取面包屑信息
      let nav = await this.model('category').get_parent_category(cate_id||0);
      this.assign('breadcrumb', nav);
      if (think.isEmpty(model_id) && !think.isNumberString(models)) {

        // 绑定多个模型 取基础模型的列表定义
        model = await this.model('model').where({name: 'document'}).find();
        ////console.log(model);
      } else {

        model_id = model_id ? model_id : models;
        //获取模型信息
        model = await this.model('model').where({id: ['IN', [model_id]]}).find();

        if (think.isEmpty(model['list_grid'])) {
          let data = await this.model('model').field('list_grid').where({name: 'document'}).find();
          model.list_grid = data.list_grid;
          ////console.log(33);
        }
      }
      this.assign('model', models.split(","))
      _model = models.split(",")
    } else { // 子文档列表
      //获取模型信息
      model = await this.model("model").where({name: "document"}).find();
      model_id = null;
      cate_id = 0;
      this.assign('model', null);
      _model = null;
    }
//解析列表规则
    let fields = [];
    let ngrids = [];
////console.log(model);
    let grids = model.list_grid.split("\r\n");
    for (let value of grids) {
      //字段:标题:链接
      let val = value.split(":");
      //支持多个字段显示
      let field = val[0].split(",");
      value = {field: field, title: val[1]}

      if (!think.isEmpty(val[2])) {
        value.href = val[2];
      }
      // //console.log(222);
      if (val[1]) {
        if (val[1].indexOf('|') > -1) {
          // 显示格式定义
          [values.title, values.format] = val[1].split('|');
        }
      }
      ////console.log(field);
      for (let val  of field) {
        let array = val.split('|');
        fields.push(array[0]);
      }
      ngrids.push(value);
    }
// 文档模型列表始终要获取的数据字段 用于其他用途
    fields.push('category_id');
    fields.push('model_id');
    fields.push('pid');
//过滤重复字段
    fields = unique(fields);
////console.log(fields);
// //console.log(model_id);
    let list = await this.getDocumentList(cate_id, model_id, position, fields, group_id,sortval,sortid);
    for(let val of list){
      if(val.pics){
        //val.pics = await get_pics_one(val.pics,"path");
        val.pics = await get_pic(val.pics.split(",")[0],1,100)
      }else {
        val.pics = '/static/noimg.jpg';
      }
    }
// //console.log(list);
    list = await this.parseDocumentList(list, model_id);
    //获取模型信息
    let modellist = [];
    ////console.log(111111111)
    if (think.isEmpty(_model)) {
      modellist = null;
    } else {
      for (let val of _model) {
        let modelobj = {}
        modelobj.id = val;
        modelobj.title = await this.model("model").get_document_model(val, "title");
        modellist.push(modelobj);
      }
    }
    this.meta_title="在线投稿";
    this.assign('modellist', modellist);
    this.assign('cate_id', cate_id);
    this.assign('model_id', model_id);
    this.assign('group_id', group_id);
    this.assign('sortid',sortid);
    this.assign('position', position);
    this.assign('groups', groups);
    this.assign('list', list);
    this.assign('list_grids', ngrids);
    this.assign('model_list', model);
    return this.display();

  }
  /**
   * 新增投稿
   */
  async addAction() {
    await this.weblogin();
    let cate_id = this.get("cate_id") || 0;
    //权限控制
    let priv = await this.priv(cate_id);
    if(priv){
      this.http.error = new Error('您所在的会员组,禁止在本栏目投稿！');
      return think.statusAction(702, this.http);
    }
    let model_id = this.get("model_id") || 0;
    let group_id = this.get("group_id") || '';
    let sortid = this.get('sortid')||0;
    think.isEmpty(cate_id) && this.fail("参数不能为空");
    think.isEmpty(model_id) && this.fail("该分类未绑定模型");
    // 获取分组定义
    let groups = await this.model("category").get_category(cate_id, 'groups');
    if (groups) {
      groups = parse_config_attr(groups);
    }
    // 获取分类信息
    let sort = await this.model("category").get_category(cate_id, 'documentsorts');
    if (sort) {
      sort = JSON.parse(sort);
      if(sortid==0){
        sortid=sort.defaultshow;
      }
      let typevar = await this.model("typevar").where({sortid:sortid}).select();
      for (let val of typevar){

        val.option= await this.model("typeoption").where({optionid:val.optionid}).find();
        if(val.option.type == 'select'){
          if(!think.isEmpty(val.option.rules)){
            val.option.rules = JSON.parse(val.option.rules);
            val.rules=parse_type_attr(val.option.rules.choices);
            val.option.rules.choices = parse_config_attr(val.option.rules.choices);
          }

        }else if (val.option.type =="radio" || val.option.type =="checkbox"){
          if(!think.isEmpty(val.option.rules)){
            val.option.rules = JSON.parse(val.option.rules);
            val.option.rules.choices = parse_config_attr(val.option.rules.choices);
          }
        }else {
          if(!think.isEmpty(val.option.rules)){
            val.option.rules = JSON.parse(val.option.rules);
          }
        }
      }
      ////console.log(typevar);
      this.assign("typevar",typevar);
    }
    ////console.log(sort);
    this.assign("sort",sort);
    //检查该分类是否允许发布
    let allow_publish = await this.model("category").check_category(cate_id);
    ////console.log(allow_publish);
    !allow_publish && this.fail("该分类不允许发布内容");

    //获取当先的模型信息
    let model = await this.model("model").get_document_model(model_id);

    //处理结果
    let info = {};
    info.pid = this.get("pid") ? this.get("pid") : 0;
    info.model_id = model_id;
    info.category_id = cate_id;
    info.group_id = group_id;

    if (info.pid) {
      let article = await this.model("document").field('id,title,type').find(info.pid);
      this.assign("article", article);
    }
    //获取表单字段排序
    let fields = await this.model("attribute").get_model_attribute(model.id,true);
    think.log(fields);
    //获取当前分类文档的类型
    let type_list = await this.model("category").get_type_bycate(cate_id);
    ////console.log(type_list);
    //获取面包屑信息
    let nav = await this.model('category').get_parent_category(cate_id);
    ////console.log(model);
    this.assign('groups',groups);
    this.assign('breadcrumb', nav);
    this.assign('info', info);
    this.assign('fields', fields);
    this.assign('type_list', type_list);
    this.assign('model', model);
    this.meta_title = '新增' + model.title;
    this.active = "admin/article/index";
    return this.display();
  }

  //编辑文档
  async editAction() {
    await this.weblogin();
    let id = this.get('id') || "";
    let sortid = this.get('sortid')||0;
    if (think.isEmpty(id)) {
      this.fail("参数不能为空");
    }
    //获取详细数据；
    let document = this.model("document")
    let data = await document.details(id);
    //安全验证
    if(data.uid != this.user.uid){
      this.http.error = new Error('只能编辑自己的稿件哦(*^_^*)!');
      return think.statusAction(702, this.http);
    }
    //let model =  this.model("model").getmodel(2);
    if (data.pid != 0) {
      //获取上级文档
      let article = document.field("id,title,type").find(data.pid);
      this.assign('article', article);
    }
    let model = await this.model("model").get_document_model(data.model_id);

    // 获取分组定义
    let groups = await this.model("category").get_category(data.category_id, 'groups');
    if (groups) {
      groups = parse_config_attr(groups);
    }
    this.assign('groups',groups);
    // 获取分类信息
    let sort = await this.model("category").get_category(data.category_id, 'documentsorts');
    if (sort) {
      sort = JSON.parse(sort);
      if(sortid !=0){
        data.sort_id=sortid;
      }else if(data.sort_id==0){
        data.sort_id=sort.defaultshow;
      }
      let typevar = await this.model("typevar").where({sortid:data.sort_id}).select();
      for (let val of typevar){

        val.option= await this.model("typeoption").where({optionid:val.optionid}).find();
        if(val.option.type == 'select'){
          if(!think.isEmpty(val.option.rules)){
            val.option.rules = JSON.parse(val.option.rules);
            val.option.rules.choices = parse_config_attr(val.option.rules.choices);
            val.option.value = await this.model("typeoptionvar").where({sortid:data.sort_id,tid:data.id,fid:data.category_id,optionid:val.option.optionid}).getField("value",true)||"";
          }

        }else if (val.option.type =="radio" || val.option.type =="checkbox"){
          if(!think.isEmpty(val.option.rules)){
            val.option.rules = JSON.parse(val.option.rules);
            val.option.rules.choices = parse_config_attr(val.option.rules.choices);
            val.option.value = await this.model("typeoptionvar").where({sortid:data.sort_id,tid:data.id,fid:data.category_id,optionid:val.option.optionid}).getField("value",true)||"";
          }
        }else {
          if(!think.isEmpty(val.option.rules)){
            val.option.rules = JSON.parse(val.option.rules);
            val.option.value = await this.model("typeoptionvar").where({sortid:data.sort_id,tid:data.id,fid:data.category_id,optionid:val.option.optionid}).getField("value",true)||"";
          }
        }
      }
      // //console.log(typevar);
      this.assign("typevar",typevar);
    }
    ////console.log(sort);
    this.assign("sort",sort);
    //获取表单字段排序
    let fields = await this.model("attribute").get_model_attribute(model.id,true);
    this.assign('fields', fields);
    //获取当前分类文档的类型
    let type_list = await this.model("category").get_type_bycate(data.category_id)
    //获取suk tags
    let tags = await this.model('tags').where({model_id:data.model_id}).select();
    this.assign('tags',tags);
    //获取面包屑信息
    let nav = await this.model('category').get_parent_category(data.category_id);
    ////console.log(model);
    this.assign('breadcrumb', nav);
    ////console.log(model);
    this.assign('type_list', type_list);
    this.meta_title = '编辑' + model.title;
    this.active = "admin/article/index";
    this.assign({
      "navxs": true,
    });
    ////console.log(data);
    this.assign('data', data);
    this.assign('model_id', data.model_id);
    this.assign('model', model);
    this.display();
  }
  /**
   * 更新或者添加数据
   */
  async updateAction() {
    await this.weblogin();
    let data = this.post();
    //绑定发布者id
    data.uid=this.user.uid;
    //安全验证
    if(data.is_ajax != 'true'){
      return this.fail("非法提交！");
    }
    //验证权限
      if(think.isEmpty(data.id)){//发布
          data.uid = this.user.uid;
          data.ip = this.ip();
          //检查本栏目发布是否需要审核
          let roleid = await this.model("member").where({id:this.is_login}).getField('groupid', true);
          let addexa = await this.model("category_priv").priv(data.category_id,roleid,'addexa');
          if(addexa){
              let addp = await this.model("approval").adds(data.model_id,this.user.uid,data.title,data);
              if(addp){
                  return this.success({name: "发布成功, 请等待管理员审核...", url: '/uc/publish/index/cate_id/'+data.category_id});
              }else {
                  return this.fail("操作失败！");
              }
          }
      }else {//修改
          data.uid = this.user.uid;
          data.ip = this.ip();
          //检查本栏目编辑是否需要审核
          let roleid = await this.model("member").where({id:this.is_login}).getField('groupid', true);
          let addexa = await this.model("category_priv").priv(data.category_id,roleid,'editexa');
          if(addexa){
              let addp = await this.model("approval").adds(data.model_id,this.user.uid,data.title,data);
              if(addp){
                  return this.success({name: "编辑成功, 请等待管理员审核...", url: '/uc/publish/index/cate_id/'+data.category_id});
              }else {
                  return this.fail("操作失败！");
              }
          }
      }
    ////console.log(data);
    //return false;
    let res = await this.model('document').updates(data);
    // let res ={ data:
    // { name: '',
    //     title: '1111',
    //     description: '',
    //     type: '2',
    //     cover_id: '',
    //     file: '',
    //     link_id: '0',
    //     display: '1',
    //     deadline: '',
    //     view: '0',
    //     comment: '0',
    //     level: '0',
    //     create_time: 1470888723186,
    //     template: '',
    //     bookmark: '0',
    //     id: null,
    //     pid: '0',
    //     model_id: '2',
    //     category_id: '39',
    //     uid: 2,
    //     is_ajax: 'true',
    //     update_time: 1470888723186,
    //     status: 1 },
    //     id: 248 }
    ////console.log(res);
    if (res) {
      //行为记录
      if (!res.data.id) {
        //await this.model("action").log("add_document", "document", res.id, this.user.uid, this.ip(), this.http.url);//添加行为日志
        return this.success({name: "添加成功", url: "/uc/publish/index/cate_id/" + res.data.category_id});
      } else {
        return this.success({name: "更新成功", url: "/uc/publish/index/cate_id/" + res.data.category_id});
      }

    } else {
      return this.fail("操作失败！");
    }


  }

  /**
   * 默认文档列表方法
   * @param integer $cate_id 分类id
   * @param integer $model_id 模型id
   * @param integer $position 推荐标志
   * @param mixed $field 字段列表
   * @param integer $group_id 分组id
   */
  async getDocumentList(cate_id, model_id, position, field, group_id,sortval,sortid) {
    ////console.log(2222222);
    /* 查询条件初始化 */
    cate_id = cate_id||0,field=field||true;
    let map = {};
    //获取当前用户的信息
    map.uid = this.user.uid;
    let status;
    if (!think.isEmpty(this.get('title'))) {
      map.title = ['like', '%' + this.param('title') + '%'];
    }
    if (!think.isEmpty(this.get('status'))) {
      map.status = this.param('status');
      status = map.status;
    } else {
      status = null;
      map.status = ['IN', '0,1,2'];
    }
    if (!think.isEmpty(this.get('time-start'))) {
      map.update_time = {'>=': new Date(this.param('time-start').valueOf())};
    }
    if (!think.isEmpty(this.get('time-end'))) {
      map.update_time = {'<=': 24 * 60 * 60 + new Date(this.param('time-end').valueOf())};
    }
    if (!think.isEmpty(this.get('nickname'))) {
      map.uid = await this.model('member').where({'nickname': this.param('nickname')}).getField('uid');
    }

    // 构建列表数据
    let Document = this.model('document');

    if (cate_id) {
      //获取当前分类的所有子栏目
      let subcate = await this.model('category').get_sub_category(cate_id);
      // //console.log(subcate);
      subcate.push(cate_id);
      map.category_id = ['IN', subcate];
    }
    // //console.log(map);
    map.pid = this.param('pid') || 0;
    ////console.log(map.pid);
    if (map.pid != 0) { // 子文档列表忽略分类
      delete map.category_id;
    }

    ////console.log(array_diff(tablefields,field));
    if (!think.isEmpty(model_id)) {
      map.model_id = model_id;
      await Document.select();
      let tablefields = Object.keys(await Document.getSchema());
      ////console.log(array_diff(tablefields,field));
      // //console.log(field);
      //return
      if (think.isArray(field) && array_diff(tablefields, field)) {
        let modelName = await this.model('model').where({id: model_id}).getField('name');
        ////console.log('__DOCUMENT_'+modelName[0].toUpperCase()+'__ '+modelName[0]+' ON DOCUMENT.id='+modelName[0]+'.id');
        // let sql = Document.parseSql(sql)
        ////console.log(`${this.config('db.prefix')}document_${modelName[0]} ${modelName[0]} ON DOCUMENT.id=${modelName[0]}.id`);
        // return
        //Document.join('__DOCUMENT_'+modelName[0].toUpperCase()+'__ '+modelName[0]+' ON DOCUMENT.id='+modelName[0]+'.id');
        //Document.alias('DOCUMENT').join(`${this.config('db.prefix')}document_${modelName[0]} ${modelName[0]} ON DOCUMENT.id=${modelName[0]}.id`);
        ////console.log(3333333333);
        Document.alias('DOCUMENT').join({
          table: `document_${modelName[0]}`,
          join: "inner",
          as: modelName[0],
          on: ["id", "id"]
        })
        let key = array_search(field, 'id');
        ////console.log(key)
        if (false !== key) {
          delete field[key];
          field[key] = 'DOCUMENT.id';
        }
      }
    }
    ////console.log(field);
    ////console.log(1111111);
    if (!think.isEmpty(position)) {
      map[1] = "position & {$position} = {$position}";
    }
    if (!think.isEmpty(group_id)) {
      map['group_id'] = group_id;
    }
    if(!think.isEmpty(sortid)){
      map.sort_id = ["IN",[sortid,0]];
    }
    let nsobj = {};
    if(!think.isEmpty(sortval)) {
      sortval = sortval.split("|");
      nsobj = {}
      let optionidarr = [];
      let valuearr = [];
      for (let v of sortval) {
        let qarr = v.split("_");
        nsobj[qarr[0]] = qarr[1];
        if(qarr[1] !=0){
          let vv = qarr[1].split(">");
          ////console.log(vv);
          if(vv[0]=="d" && !think.isEmpty(vv[1])){
            map["t."+qarr[0]] = ["<",vv[1]];
          }else if(vv[0]=="u" && !think.isEmpty(vv[1])){
            map["t."+qarr[0]] = [">",vv[1]];
          }else if(vv[0]=="l" && !think.isEmpty(vv[1])){
            map["t."+qarr[0]] = ["like",`%"${vv[1]}"%`];
          }else if(!think.isEmpty(vv[0])&&!think.isEmpty(vv[1])){
            map["t."+qarr[0]] = ["BETWEEN", Number(vv[0]), Number(vv[1])];
          }else {
            map["t."+qarr[0]] = qarr[1];
          }

        }
      }
      map.fid = cate_id;
      // where.optionid = ["IN",optionidarr];
      // where['value'] = ["IN",valuearr];
      // let type= await this.model("typeoptionvar").where(where).select();
      //  //console.log(type);
      // //console.log(map);
    }
    ////console.log(map);
    let list;
    if(!think.isEmpty(sortval)){
      list = await Document.alias('DOCUMENT').join({
        table: "type_optionvalue"+sortid,
        join: "left", // 有 left,right,inner 3 个值
        as: "t",
        on: ["id", "tid"]

      }).where(map).order('level DESC,DOCUMENT.id DESC').field(field.join(",")).page(this.get("page"),20).countSelect();
    }else {
      list = await Document.alias('DOCUMENT').where(map).order('level DESC,DOCUMENT.id DESC').field(field.join(",")).page(this.get("page"),20).countSelect();
    }
    //let list=await this.model('document').where(map).order('level DESC').field(field.join(",")).page(this.get("page")).countSelect();
    let Pages = think.adapter("pages", "page"); //加载名为 dot 的 Template Adapter
    let pages = new Pages(this.http); //实例化 Adapter
    let page = pages.pages(list);


    if (map['pid'] != 0) {
      // 获取上级文档
      let article = await Document.field('id,title,type').find(map['pid']);
      this.assign('article', article);
      // //console.log(article);
    }

    //检查该分类是否允许发布内容
    let allow_publish = await this.model("category").get_category(cate_id, 'allow_publish');
    this.assign("nsobj",nsobj);
    this.assign('_total', list.count);//该分类下的文档总数
    this.assign('pagerData', page); //分页展示使用
    this.assign('status', status);
    this.assign('allow', allow_publish);
    this.assign('pid', map.pid);
    ////console.log(list.data);
    this.meta_title = '文档列表';
    return list.data;
  }
//权限验证
  async priv(cate_id) {
    let cate = cate_id || await this.model("category").get_all_category();
    let roleid = await this.model("member").where({id:this.user.uid}).getField('groupid', true);
    let cates= [];
    if(cate_id){
      let priv = await this.model("category_priv").priv(cate_id,roleid,'add');
      if(priv==1){
        cates.push(priv)
      }
    }else {
      // let priv = await this.model("category_priv").where({catid:39,is_admin:0,roleid:2,action:'add'}).select();
      // //console.log(priv);
      //前台投稿分类
      //TODO 权限控制(管理员)
      let parr =[];
      for (let val of cate) {
        let priv = await this.model("category_priv").priv(val.id,roleid,'add');
        val.priv=priv
        if(priv==1 && val.pid !=0){
          parr.push(val.pid)
        }
      }

      if(think.isEmpty(parr)){
        cates=cate;
      }else {

        for(let val of cate){
          if(in_array(val.id,parr)){
            val.priv=1
          }
        }

        for(let val of cate){
          if(val.priv==1){
            cates.push(val);
          }
        }
      }
    }



    return think.isEmpty(cates)
  }

    /**
     * 待审稿件
     * @returns {Promise.<void>}
     */
 async approvalAction(){
        let map = {};
        map.uid = this.user.uid;
        if(!think.isEmpty(this.get("model"))){
            map.model = this.get("model");
        }
        let list = await this.model("approval").where(map).page(this.get('page'),20).order('time DESC').countSelect();
        let Pages = think.adapter("pages", "page"); //加载名为 dot 的 Template Adapter
        let pages = new Pages(this.http); //实例化 Adapter
        let page = pages.pages(list);
        this.assign('pagerData', page); //分页展示使用
        this.assign('list', list);
        let modlist = await this.model("model").get_model(null,null,{is_approval:1});
        for(let val of modlist){
            val.count = await this.model("approval").where({model:val.id}).count();
        }
        ////console.log(modlist);
        this.assign("model",modlist);
        this.assign("count",await this.model("approval").where({uid:this.user.uid}).count())
   this.meta_title="待审稿件";
   return this.display();
 }
    /**
     * 查看待审稿件详情
     */
    async approvaldetailsAction(){
        let id = this.get("id");
        let details = await this.model("approval").where({uid:this.user.uid}).find(id);
        let info = JSON.parse(details.data);
        this.assign("info",info)
        this.meta_title = "查看详情";
        return this.display();
    }

    /**
     * 删除撤销审核
     *
     */
    async approvaldelAction(){
      let id = this.get("id");
      let res = await this.model("approval").where({uid:this.user.uid,id:id}).delete();
      if(res){
        return this.success({name:"删除成功!"});
      }else {
        return this.fail("操作失败!");
      }
    }
  /**
   * 显示左边菜单，进行权限控制
   * @author
   */

  async getmenuAction() {
    let cate = await this.model("category").get_all_category({mold:0});
    let roleid = await this.model("member").where({id:this.user.uid}).getField('groupid', true);
    // let priv = await this.model("category_priv").where({catid:39,is_admin:0,roleid:2,action:'add'}).select();
    // //console.log(priv);
    //前台投稿分类
    //TODO 权限控制(管理员)
    let parr =[];
    for (let val of cate) {
      val.url = `/uc/publish/index/cate_id/${val.id}`;
      val.target = '_self';
      let priv = await this.model("category_priv").priv(val.id,roleid,'add');
      val.priv=priv
      if(priv==1 && val.pid !=0 ){
        parr.push(val.pid)
      }
    }
    let cates= [];
    if(think.isEmpty(parr)){
      cates=cate;
    }else {

      for(let val of cate){
        if(in_array(val.id,parr)){
          val.priv=1
        }
      }

      for(let val of cate){
        if(val.priv==1){
          cates.push(val);
        }
      }
    }

    ////console.log(cates);
    //think.log(cate);
    return this.json(arr_to_tree(cates, 0))
  }
  //ajax添加tags
  async ajaxaddtagsAction(){
    let data = this.post();
    data.model_id = Number(data.model_id);
    let model= this.model("tags");
    let res = await model.where({name:data.name}).thenAdd(data);
    if(res.type == "exist"){
      await model.where({id:res.id}).increment('num');
      return this.fail("已经存在，不要重复添加，请直接选择！")
    }
    let rdata = {
      errno:0,
      id:res.id,
      name:data.name
    }
    return this.json(rdata);
  }
  async ajaxgettagsAction(){
    let map = this.get();
    let model= this.model("tags");
    let res = await model.where(map).select();
    return this.json(res);
  }

}

