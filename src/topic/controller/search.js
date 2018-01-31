'use strict';

import Base from './base.js';
import Segment from 'segment';
import pagination from 'think-pagination';
import moment from "moment"
moment.locale('zh-cn');
export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  //列表页[核心]
  async indexAction() {

    //跨域
    let method = this.http.method.toLowerCase();
    if(method === "options"){
      this.setCorsHeader();
      this.end();
      return;
    }
    this.setCorsHeader();
    //0.获取查询关键字
    let searchword = [];
    let q = this.get("q");
    if(!think.isEmpty(q)){
      this.assign("queryword",q);
      //console.log('11111111111111111'+q);
      let segment = new Segment();
      // 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
      await segment.useDefault();
      // 开始分词
      let segment_q= await segment.doSegment(q, {
          simple: true,
          stripPunctuation: true
      });
      //console.log(segment_q);
      for (let k=0; k<segment_q.length ;k++){
          searchword.push("%"+segment_q[k]+"%");
      }
    }

    //1.获取分类栏目
    let get = this.get('value') || 'youxue'; //默认显示游学搜索
    //console.log('args:'+get);
    let id=0;
    let query = get.split("-");
    if(get != 0){
      id = query[0];
    }
    let cate = await this.category(id);
    cate = think.extend({}, cate);
    
    //2.访问控制
    let roleid=8;//游客
    if(this.is_login){
      roleid = await this.model("member").where({id:this.is_login}).getField('groupid', true);
    }
    let priv = await this.model("category_priv").priv(cate.id,roleid,'visit');
    if(!priv){
      this.http.error = new Error('您所在的用户组,禁止访问本栏目！');
      return think.statusAction(702, this.http);
    }

    //3.获取当前栏目的模型
    let models = await this.model("category").get_category(cate.id, 'model');
    //获取模型信息
    let modellist = [];
    if (think.isEmpty(models)) {
      modellist = null;
    } else {
      for (let val of models.split(",")) {
        let modelobj = {}
        modelobj.id = val;
        modelobj.title = await this.model("model").get_model(val, "title");
        modellist.push(modelobj);
      }
    }
    this.assign('modellist', modellist);
    this.assign('model', models.split(","));
    ////console.log(cate);
    //4.获取当前分类的所有子栏目
    let subcate = await this.model('category').get_sub_category(cate.id);
    ////console.log(subcate);
    subcate.push(cate.id);
    //获取模型列表数据个数
    // //console.log(cate);
    let num;
    if(cate.list_row>0){
      num = cate.list_row;
    } else if(cate.model.split(",").length == 1){
      let pagenum=await this.model('model').get_model(cate.model,"list_row");
      if(pagenum !=0){
        num = pagenum;
      }
    }else {
      num =this.config("db.nums_per_page");
    }
    if(checkMobile(this.userAgent())){
      num=10;
    }
    ////console.log(subcate);

    //5.设置查询条件
    let map = {
      'pid':0,
      'status': 1,
      'category_id': ['IN', subcate]
    };
    //5.1排序
    let o = {};
    o.level = 'DESC';
    let order = query[1]||0;
    //console.log('order:'+order);
    order = Number(order);
    switch (order){
      case 1:
      o.update_time = 'ASC';
      break;
      case 2:
      o.view = 'DESC';
      break;
      case 3:
      o.view = 'ASC';
      break;
      case 4:
      map.create_time = {">": new Date(GetDateStr(0)+" "+"00:00:00").getTime(), "<": new Date(GetDateStr(0)+" "+"23:59:59").getTime()}
      o.update_time = 'DESC';
      break;
      case 5:
      map.create_time = {">": new Date(GetDateStr(1)+" "+"00:00:00").getTime(), "<": new Date(GetDateStr(5)+" "+"23:59:59").getTime()}
      o.update_time = 'DESC';
      break;
      case 6:
      map.create_time = {"<": new Date().getTime()}
      map.deadline = {">": new Date().getTime()}
      o.update_time = 'DESC';
      break;
      case 7:
      map.deadline = {"<": new Date().getTime()}
      o.update_time = 'DESC';
      break;
      default:
      o.update_time = 'DESC';
    }
    this.assign('order',order);
    //5.2获取模型对应的排序分类信息132-0-0-17
    let sortid = query[3]||0;
    //console.log('sortid:'+sortid);
    if(!think.isEmpty(sortid)){
      map.sort_id = sortid;
    }
    let sortarr = query[4]||null;
    let nsobj = {};
    let sort = await this.model("category").get_category(cate.id, 'documentsorts');
    //console.log('got category document sorts:'+sort);
    if (sort) {
      this.assign("sorturl",get.split("-")[4])
      sort = JSON.parse(sort);
      if(sortid==0){
        sortid=sort.defaultshow;
      }
      let typevar = await this.model("typevar").where({sortid:sortid}).order('displayorder ASC').select();
      for (let val of typevar){

        val.option= await this.model("typeoption").where({optionid:val.optionid}).find();
        if(val.option.type == 'select' ||val.option.type == 'radio'){
          if(!think.isEmpty(val.option.rules)){
            val.option.rules = JSON.parse(val.option.rules);
            val.rules=parse_type_attr(val.option.rules.choices);
            val.option.rules.choices = parse_config_attr(val.option.rules.choices);
            ////console.log(val.rules);
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
                    obj.name = '小于'+arr[i];
                    obj.pid=0
                    searcharr.push(obj);
                  }else {
                    obj.id = arr[i-1]+'>'+arr[i];
                    obj.name = arr[i-1]+"-"+arr[i];
                    obj.pid=0
                    searcharr.push(obj)
                  }

                }

              }
              searcharr.push({id:'u>'+arr[len-1],name:arr[len-1]+'以上',pid:0})
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
    //5.3解析URL中的分类排序参数信息tourdest_100.102|tourtype_0|tourfeature_0|tourdays_0|tourmonth_0
    if(!think.isEmpty(sortarr)) {
      sortarr = sortarr.split("|");
      let optionidarr = [];
      let valuearr = [];
      for (let v of sortarr) {
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
      map.fid = cate.id;
      // where.optionid = ["IN",optionidarr];
      // where['value'] = ["IN",valuearr];
      // let type= await this.model("typeoptionvar").where(where).select();
      //  //console.log(type);
      // //console.log(map);

    }
    ////console.log(map);
    ////console.log(nsobj);
    ////console.log(sort);
    this.assign("sort",sort);
    this.assign("nsobj",nsobj);
    this.assign("sortid",sortid);
    //5.4获取分组信息132-0-0-17
    let group_id = 0;
    if(!think.isEmpty(query[2]) && query[2] !=0){
      map.group_id=query[2];
      group_id = map.group_id;
    }
    this.assign("group_id",group_id)
    //5.5获取查询关键字
    if(searchword.length > 0){
      map.title = ["like",searchword];
    }
    ////console.log(map);
    //6.查询
    let data;
    if(!think.isEmpty(sortarr)){
      data = await this.model('document').join({
        table: "type_optionvalue"+sortid,
        join: "left", // 有 left,right,inner 3 个值
        as: "t",
        on: ["id", "tid"]

      }).where(map).page(this.param('page'),num).order(o).countSelect();
    }else {
      data = await this.model('document').where(map).page(this.param('page'),num).order(o).countSelect();
    }
    ////console.log(data);
    // let data = await this.model('document').join({
    //     typeoptionvar: {
    //         join: "left", // 有 left,right,inner 3 个值
    //         as: "c",
    //         on: ["sort_id", "sortid"]
    //     }
    // }).where(map).page(this.param('page'),num).order('update_time DESC').countSelect();
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
    this.assign('totalPages', data.totalPages);
    this.assign('currentPage', data.currentPage);
    //seo
    this.meta_title = cate.meta_title ? cate.meta_title : cate.title; //标题
    this.keywords = cate.keywords ? cate.keywords : ''; //seo关键词
    this.description = cate.description ? cate.description : ""; //seo描述

    //获取面包屑信息
    //console.log('got breadcrumb!! cate.id : '+cate.id)
    let breadcrumb = await this.model('category').get_parent_category(cate.id,true);
    this.assign('breadcrumb', breadcrumb);
    ////console.log(breadcrumb)


    /* 模板赋值并渲染模板 */
    this.assign('category', cate);
    this.assign('list', data.data);
    this.assign('count',data.count);
    ////console.log(data.data)
    let temp = cate.template_lists ? `${cate.template_lists}` : "";
    ////console.log(cate);
    ////console.log(temp)
    if(checkMobile(this.userAgent())){
      if(this.isAjax("get")){
        for(let v of data.data){
          if(!think.isEmpty(v.pics)){
            let arr = []
            for (let i of v.pics.split(",")){
              arr.push(await get_pic(i,1,300,169))
            }
            v.pics = arr;
          }
          if(!think.isEmpty(v.cover_id)){
            v.cover_id = await get_pic(v.cover_id,1,300,169);
          }
          if(!think.isEmpty(v.price)){
            if(!think.isEmpty(get_price_format(v.price,2))){
              v.price2 = get_price_format(v.price,2);
            }
            v.price = get_price_format(v.price,1);

          }
          v.uid = await get_nickname(v.uid);
          v.url = get_url(v.name,v.id);
          v.update_time = moment(v.update_time).fromNow()
        }
        return this.json(data);
      }
      //手机端模版
      temp = cate.template_m_lists ? `${cate.template_m_lists}` : `${this.http.action}`;
      //think.log(temp);
      return this.display(`mobile/${this.http.controller}/${temp}`)
    }else{
      ////console.log(temp);
      return this.display();
    }



  }


  async indexbalAction(){
    //auto render template file index_index.html
      let q = this.get("q");
      this.meta_title="搜索";
      if(think.isEmpty(q)){
          if(checkMobile(this.userAgent())){
              return this.display(`mobile/${this.http.controller}/${this.http.action}`);
          }else {
              return this.display('result');//return this.display();
          }

      }else {
          let time = this.get("d");
          let search_time,sql_time,sql;
          let q = this.get('q');
          let m_id = this.get('m')||0;
          //按时间搜索
          if(time=='day'){
              search_time = new Date().getTime() - 86400000;
              sql_time = ` AND add_time > ${search_time}`;
          }else if(time=='week'){
              search_time = new Date().getTime() - 604800000;
              sql_time = ` AND add_time > ${search_time}`;
          }else if(time=='month'){
              search_time = new Date().getTime() - 2592000000;
              sql_time = ` AND add_time > ${search_time}`;
          }else if(time=='year'){
              search_time = new Date().getTime() - 31536000000;
              sql_time = ` AND add_time > ${search_time}`;
          }else {
              search_time=0;
              sql_time='';
          }
          let segment = new Segment();
          // 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
          segment.useDefault();
          // 开始分词
          let segment_q= segment.doSegment(q, {
              simple: true,
              stripPunctuation: true
          });
          //检查全文搜索配置
          let variables = await this.model("mysql").query(`show variables`);
          let ft_min_word_len =think._.find(variables, ['Variable_name', 'ft_min_word_len']).Value;
          if(ft_min_word_len ==1){
              //console.log(segment_q.join(" "));
              sql = "";
              sql = `MATCH (data) AGAINST ('${segment_q.join(" ")}' IN BOOLEAN MODE)`;
              if(m_id){
                  sql += ` AND m_id=${m_id}`
              }
              if(search_time !=0){
                  sql += sql_time
              }
          }else {
              sql = "";
              sql +='('
              for (let k=0; k<segment_q.length ;k++){
                  sql +="`data` like '%"+segment_q[k]+"%'";
                  if(segment_q[k+1]){
                      sql +=' OR '
                  }
              }
              sql +=')'
              if(m_id){
                  sql += ` AND m_id=${m_id}`
              }
              if(search_time !=0){
                  sql += sql_time
              }
              //console.log(q+"dddddddddd");
          }
          //console.log(sql);
          let numsPerPage =10;
          let currentPage = Number(this.get("page"))||1;
          let count = await this.model("mysql").query(`SELECT count(search_id) FROM __SEARCH__ WHERE ${sql}`)
          let res = await this.model("mysql").query(`SELECT * FROM __SEARCH__ WHERE ${sql} order by search_id DESC LIMIT ${(currentPage-1)*numsPerPage},${numsPerPage}`);
          let hs = this.cookie("cmswing_historical_search");
          this.assign("hs",hs.split("|").reverse());
          //搜索记录
          if(count[0]['count(search_id)']>0){


              let hsq;
              if(think.isEmpty(hs)){
                  this.cookie("cmswing_historical_search", q);
              }else {
                  if(!in_array(q,hs.split("|"))){
                      hsq = hs+'|'+q;
                      this.cookie("cmswing_historical_search", hsq);
                  }

              }

          }

          let modlist = await this.model("search_model").order('sort ASC').select();
          ////console.log(modlist);
          let data = [];
          for(let v of res){
              let extend = await this.model("model").get_model(v.m_id,"extend");
              v.m_type =extend;
              let table;
              if(extend==0){
                  table= await this.model("model").get_model(v.m_id,"name");
              }else {
                  table="document";
              }
              let pk = await this.model("search_model").where({mod:v.m_id}).getField('pk', true)
              let map = {}
               map[pk] = v.d_id;
              data.push(think.extend(await this.model(table).where(map).find(),v))
          }
          ////console.log(data);
          let list = {
              numsPerPage: numsPerPage, //每页显示的条数
                  currentPage: currentPage, //当前页
              count: count[0]['count(search_id)'], //总条数
              totalPages: Math.ceil(count[0]['count(search_id)']/numsPerPage), //总页数
              data:data
          }
          //查询数据

          let html = pagination(list, this.http, {
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
          this.assign("modlist",modlist);
          this.assign("list",list);
          if(checkMobile(this.userAgent())){
              if(this.isAjax('get')){
                  for(let v of list.data){
                      v.model = await this.model("model").get_model(v.m_id,"title") ;
                      if (v.m_type ==1){
                          v.url = get_url(v.name,v.id);
                      }else {
                          v.url =`/mod/${await this.model("model").get_model(v.m_id,"name")}/index/detail/id/${v.d_id}`
                      }
                      v.categoryname = await this.model("category").get_category(v.category_id,"title");
                      v.add_time = moment(v.add_time).format('YYYY-MM-DD HH:mm')
                  }
                  return this.json(list);
              }
              return this.display(`mobile/${this.http.controller}/${this.http.action}`);
          }else {
              return this.display("result");
          }

      }

  }
}