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
    init(http) {
        super.init(http);
        this.tactive = "article";
    }

    /**
     * index action
     * @return {Promise} []
     */
    async indexAction() {
        let cate_id = this.get('cate_id') || null;
        let model_id = this.get('model_id') || null;
        let position = this.get('position') || null;
        let group_id = this.get('group_id') || 0;
        let sortid = this.get('sortid')||0;
        let sortval = this.get('sortval')||null;
        let models;
        let groups;
        let model;
        let _model;
        ////console.log(2222);
        //console.log('cate_id:'+cate_id);
        if (!think.isEmpty(cate_id)) {
            //权限验证
            await this.admin_priv("init",cate_id,"您没有权限查看本栏目！")
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
            //console.log('article,sort:')
            //console.log(sort);
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
            ////console.log(models);
            ////console.log(!think.isNumberString(models));
            ////console.log(think.isEmpty(model_id));
            if (think.isEmpty(model_id) && !think.isNumberString(models)) {

                // 绑定多个模型 取基础模型的列表定义
                model = await this.model('model').where({name: 'document'}).find();
                ////console.log(model);
            } else {

                model_id = model_id ? model_id : models;
                //获取模型信息
                model = await this.model('model').where({id: ['IN', [model_id]]}).find();
                ;

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
        //console.log(model);
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
            //console.log(field);
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
        ////console.log(list);
        //获取面包屑信息
        let nav = await this.model('category').get_parent_category(cate_id);
        this.assign('breadcrumb', nav);
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
        ////console.log(this.setup.DOCUMENT_POSITION)
        ////console.log(groups);
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
        this.meta_title = '内容管理';
        this.assign({
            "navxs": true,
        });
        //console.log('display article page');
        return this.display();
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
        }else{
            // 未指定分类信息是，只显示允许显示的分类信息
            let acategoryids = await this.model('category').where({status:1,pid:0}).getField('id');
            let categoryids = [];
            for (let acategory of acategoryids) {
                //获取当前分类的所有子栏目
                let subcate = await this.model('category').get_sub_category(acategory);
                categoryids = categoryids.concat(subcate);
            }
            map.category_id = ['IN', categoryids];
        }
        //console.log(map);
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
        //console.log(field);
        ////console.log(1111111);
        if (!think.isEmpty(position)) {
            map["position"] = ["like",'%"'+position+'"%'];
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
                        if(qarr[0] == "tourdest"){  //  游学地址采用100.101的方式，所以要做特殊处理
                          map["t."+qarr[0]] = ["like",`%${qarr[1]}%`]; 
                        }else{
                          map["t."+qarr[0]] = qarr[1];
                        }
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
        console.log(map);
        let list;
        if(!think.isEmpty(sortval)){
            list = await Document.alias('DOCUMENT').join({
                table: "type_optionvalue"+sortid,
                join: "left", // 有 left,right,inner 3 个值
                as: "t",
                on: ["id", "tid"]

            }).where(map).order('DOCUMENT.id DESC').field(field.join(",")).page(this.get("page"),20).countSelect();
        }else {
            //list = await Document.alias('DOCUMENT').where(map).order('level DESC,DOCUMENT.id DESC').field(field.join(",")).page(this.get("page"),20).countSelect();
            list = await Document.alias('DOCUMENT').where(map).order('DOCUMENT.id DESC').field(field.join(",")).page(this.get("page"),20).countSelect();
        }
        //console.log(list);
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
        let allow_publish = 0;
        if( cate_id == 0){//根目录下不允许添加内容
             allow_publish = 0;
        }else{
             allow_publish = await this.model("category").get_category(cate_id, 'allow_publish');
        }
        //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"+allow_publish);
        this.assign("nsobj",nsobj);
        this.assign('_total', list.count);//该分类下的文档总数
        this.assign('pagerData', page); //分页展示使用
        this.assign('status', status);
        this.assign('allow', allow_publish);
        this.assign('pid', map.pid);
        //console.log(list.data);
        this.meta_title = '文档列表';
        return list.data;
    }

    /**
     * 显示左边菜单，进行权限控制
     * @author
     */

    async getmenuAction() {
        let cate = await this.model("category").get_all_category();
        if(!this.is_admin){
        let parr =[];
            //后台分类
            for (let val of cate) {
               switch (val.mold){
                   case 1:
                       val.url =`/mod/admin/index/cate_id/${val.id}`;
                       break
                   case 2:
                       val.url = `/admin/sp/index/cate_id/${val.id}`;
                       break;
                   default:
                       val.url = `/admin/article/index/cate_id/${val.id}`;
               }

                val.target = '_self';
                delete val.icon;
                let priv = await this.model("category_priv").priv(val.id,this.roleid,'init',1);
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

        //think.log(cate);
        return this.json(arr_to_tree(cates, 0))
        }else {
            for (let val of cate) {
                switch (val.mold){
                    case 1:
                        val.url =`/mod/admin/index/cate_id/${val.id}`;
                        break
                    case 2:
                        val.url = `/admin/sp/index/cate_id/${val.id}`;
                        break;
                    default:
                        val.url = `/admin/article/index/cate_id/${val.id}`;
                }

                val.target = '_self';
                delete val.icon;
            }
            return this.json(arr_to_tree(cate, 0))
        }
    }

    /**
     * 新增文档
     */
    async addAction() {

        let cate_id = this.get("cate_id") || 0;
        let model_id = this.get("model_id") || 0;
        let group_id = this.get("group_id") || '';
        let sortid = this.get('sortid')||0;
        think.isEmpty(cate_id) && this.fail("参数不能为空");
        think.isEmpty(model_id) && this.fail("该分类未绑定模型");
        //权限验证
        await this.admin_priv("add",cate_id);
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
        //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"+allow_publish);
        !allow_publish && this.fail("该分类不允许发布内容");

        //获取当先的模型信息
        let model = await this.model("model").get_document_model(model_id);

        //处理结果
        let info = {};
        info.pid = this.get("pid") ? this.get("pid") : 0;
        info.model_id = model_id;
        info.category_id = cate_id;
        info.group_id = group_id;
        let topid=0;
        if (info.pid != 0) {
            let i = info.pid;
            //
            while (i!=0)
            {
                let nav = await this.model("document").where({id:i}).find();
                if(nav.pid==0) {
                    topid= nav.id;
                }
                i = nav.pid;

            }
            let article = await this.model("document").field('id,title,type').find(info.pid);
            this.assign("article", article);
        }
        ////console.log(topid);
        // this.assign("topid",topid);
        info.topid = topid;
        //获取表单字段排序
        let fields = await this.model("attribute").get_model_attribute(model.id,true);
        //think.log(fields);
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
        this.assign({
            "navxs": true,
        });
        return this.display();
    }

    //编辑文档
    async editAction() {
        let id = this.get('id') || "";
        let sortid = this.get('sortid')||0;
        if (think.isEmpty(id)) {
            return this.fail("参数不能为空");
        }

        //获取详细数据；
        let document = this.model("document")
        let data = await document.details(id);
        //权限验证
        await this.admin_priv("edit",data.category_id);
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
            //console.log(typevar);
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
            //console.log(typevar);
            this.assign("typevar",typevar);
        }
        ////console.log(sort);
        this.assign("sort",sort);
        //获取表单字段排序
        let fields = await this.model("attribute").get_model_attribute(model.id,true);
        ////console.log(fields);
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
        //console.log(data);
        this.assign('data', data);
        this.assign('model_id', data.model_id);
        this.assign('model', model);
        this.display();
    }

    /**
     * 更新或者添加数据
     */
    async updateAction() {
        let data = this.post();
        console.log(data);
        let res = await this.model('document').updates(data);

        if (res) {
            //行为记录
            if (!res.data.id) {
                await this.model("action").log("add_document", "document", res.id, this.user.uid, this.ip(), this.http.url);
                this.success({name: "添加成功", url: "/admin/article/index/cate_id/" + res.data.category_id,id:res.data.id,model_id:res.data.model_id,category_id:res.data.category_id});
            } else {
                this.success({name: "更新成功", url: "/admin/article/index/cate_id/" + res.data.category_id,id:res.data.id,model_id:res.data.model_id,category_id:res.data.category_id});
                
            }

        } else {
            this.fail("操作失败！");
        }
    }
    /**
     * 更新或者添加数据 ,成功后跳转至编辑
     */
    async saveAction() {
        let data = this.post();
        console.log(data);
        let res = await this.model('document').updates(data);

        if (res) {
            //行为记录
            if (!res.data.id) {
                await this.model("action").log("add_document", "document", res.id, this.user.uid, this.ip(), this.http.url);
                this.success({name: "添加成功", url: "/admin/article/edit/id/" + res.data.id + "/model/" + res.data.model_id +"/cate_id/"+res.data.category_id,id:res.data.id});
            } else {
                //this.success({name: "保存成功", url: "/admin/article/edit/id/" + res.data.id + "/model/" + res.data.model_id +"/cate_id/"+res.data.category_id,id:res.data.id});
            }

        } else {
            this.fail("操作失败！");
        }


    }
    /**
     * 设置一条或者多条数据的状态
     */
    async setstatusAction() {
        let data = await this.model("document").where({id:["IN",this.param('ids')]}).select();
        switch (Number(this.param('status'))){
            case -1:
                for (let v of data){
                    //权限验证
                    await this.admin_priv("delete",v.category_id);
                }
                break;
            case 1:
                for (let v of data){
                    //权限验证
                    await this.admin_priv("examine",v.category_id);
                }
                break;
            case 0:
                for (let v of data){
                    //权限验证
                    await this.admin_priv("disable",v.category_id);
                }
                break;
        }

        await super.setstatusAction(this,'document');
        if(this.param('status')==-1||this.param('status')==0){
            for (let v of data){
                //删除
                await this.model('search').delsearch(v.model_id,v.id);
                if(!think.isEmpty(v.keyname)){
                    await this.model("keyword").delkey(v.id,v.model_id);
                }

            }


        }else if(this.param('status')==1){

            for (let v of data){
                //添加到搜索
                await this.model("search").addsearch(v.model_id,v.id,v);
                //console.log(v.keyname);
                if(!think.isEmpty(v.keyname)){
                    await this.model("keyword").addkey(v.keyname,v.id,v.uid,v.model_id,0);
                }
            }
        }
    }

    /**
     * 回收站列表
     */
    async recycleAction(){
        let map={status:-1};
        if(this.is_admin){
 //TODO
        }

        let list = await this.model('document').where(map).order('update_time desc').field("id,title,uid,type,category_id,update_time").page(this.get('page')).countSelect();
        let Pages = think.adapter("pages", "page"); //加载名为 dot 的 Template Adapter
        let pages = new Pages(this.http); //实例化 Adapter
        let page = pages.pages(list);
        for(let val of list.data){
            val.category=await this.model('category').get_category(val.category_id,"title");
            val.username = await this.model('member').get_nickname(val.uid);
        }

        this.assign("_total",list.count)
        this.assign('pagerData', page); //分页展示使用
        this.assign('list', list.data);
        this.meta_title = "回收站";
        return this.display()

    }
    async clearAction(){
        // 获取回收站的所有信息
        let clist =await this.model("document").where({status:-1}).select();
        if(think.isEmpty(clist)){
            return this.success({name: "回收站没有内容！"});
        }
        ////console.log(clist);
        //查出模型内容并删除
        for(let v of clist){
            //模型表
            let table = await this.model("model").get_table_name(v.model_id);
            //console.log(table);
            await this.model(table).where({id:v.id}).delete();
        }
        //删除主表内容
        let res = await this.model("document").delete({where:{status:-1}});

        if(res){
            return this.success({name: "清空回收站成功"});
        }

    }
}