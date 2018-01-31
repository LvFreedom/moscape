// +----------------------------------------------------------------------
// | PeanutRoll [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.peanutroll.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Arterli <zhengqsh@126.com>
// +----------------------------------------------------------------------
'use strict';
import moment from "moment"
moment.locale('zh-cn');
import Base from './base.js';
export default class extends Base {
  init(http){
    super.init(http);
  }
  /**
   * index action
   * @return {Promise} []
   */
   async indexAction(){
    //auto render template file index_index.html
    //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    this.meta_title = "首页";//标题1
    this.keywords = this.setup.WEB_SITE_KEYWORD ? this.setup.WEB_SITE_KEYWORD : '';//seo关键词
    this.description = this.setup.WEB_SITE_DESCRIPTION ? this.setup.WEB_SITE_DESCRIPTION : "";//seo描述


      //电影信息

      //获取用户信息

      let userInfo = await this.model("member").join({
          table: "member_group",
          join: "left",
          as: "c",
          on: ["groupid", "groupid"]
      }).find(this.user.uid);

      this.assign("userInfo", userInfo);

      this.assign("")
      // console.log(this.user)
      //科幻
      let classify1 = 1;//
      //战争
      let classify2 = 2;//
      let cate_id = 157;//电影分类
      let sortid = this.get('sortid')||0;
      let map1 = {};
      let map2 = {};
      let map = {};
      if(!think.isEmpty(this.user)){
        // if(!think.isEmpty(classify1) && classify1 !=="all"){
        //   map1.movietype =  ['like', '%'+'"'+classify1+'"'+'%'];
        // }
        // if(!think.isEmpty(classify2) && classify2 !=="all"){
        //   map2.movietype =  ['like', '%'+'"'+classify2+'"'+'%'];
        // }

        //获取电影分类信息
        let sort = await this.model("category").get_category(cate_id, 'documentsorts');
        //console.log('got category document sorts:'+sort);
        if (sort) {
          
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
                // for(let v of val.rules){
                //   v.id = "l>"+v.id
                // }
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
          //console.log(typevar[0].rules)
          let indextype = []
          if(!think.isEmpty(typevar[0].rules[0])&&!think.isEmpty(typevar[0].rules[1])){
            indextype[0] = typevar[0].rules[0].name;
            indextype[1] = typevar[0].rules[1].name;
            this.assign("indextype",indextype);
          }
          this.assign("typevar",typevar);
        }

        map.user_name = this.user.username;
        map.able_watch = ['!=', null];

        map1.user_name = this.user.username;
        map1.able_watch = ['!=', null];
        if(!think.isEmpty(classify1)){
          map1.movietype =  ['like', '%'+'"'+classify1+'"'+'%'];
        }

        map2.user_name = this.user.username;
        map2.able_watch = ['!=', null];
        if(!think.isEmpty(classify2)){
          map2.movietype =  ['like', '%'+'"'+classify2+'"'+'%'];
        }
        //查询电影数据
        //热门
        let hotmovie = await this.getmovie(map,cate_id,sortid,"all",6)
        //科幻
        let moviedata1 = await this.getmovie(map1,cate_id,sortid,classify1,4);  
        //战争
        let moviedata2 = await this.getmovie(map2,cate_id,sortid,classify2,4)
      }


    // this.redirect("/admin/index")

    // return;
    //debugger;
    //判断浏览客户端
    if(checkMobile(this.userAgent())){
      //跨域
      let method = this.http.method.toLowerCase();
      if(method === "options"){
        this.setCorsHeader();
        this.end();
        return;
      }
      this.setCorsHeader();
      let map = {
        'pid':0,
        'status': 1,
      };
      //排序
      let o = {};
      let order =this.get('order')||100;
      //console.log('get order:'+order);
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
        default:
        o.update_time = 'DESC';
      }

      this.assign('order',order);


      let data = await this.model('document').where(map).page(this.param('page'),10).order(o).countSelect();
      this.assign("list",data);
      ////console.log(data);
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
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }else{
      //debugger;
      //console.log(think.datetime(new Date(), "YYYY-MM-DD"));
      return this.display();
    }

  }
  /**
  *获取电影
  */
  async getmovie(map,cate_id,sortid,type,pnum){
    let tmp = [];
    let arr = [];
    let sort = await this.model("category").get_category(cate_id, 'documentsorts');
    console.log(sort)
    if (sort) {
      sort = JSON.parse(sort);
      if(sortid==0){
            sortid=sort.defaultshow;
        }
      let table = "type_optionvalue"+sortid;
      let moviedata = await this.model("document_video").alias('a').join({
                        table: "document",
                            join: "left", // 有 left,right,inner 3 个值
                            as: "document",
                            on: ["id", "id"]
                      }).join({
                            table: table,
                            join: "left", // 有 left,right,inner 3 个值
                            as: "t",
                            on: ["id", "tid"]
                        }).join({
                          table:"document_user_movie",
                          join:"left",
                          as:"c",
                          on:["id", "able_watch"]
                        }).where(map).page(1,pnum).order('document.id DESC').countSelect();
      if(!think.isEmpty(moviedata.data)){
        let movielist = moviedata.data
        for(var j=0;j<movielist.length;j++){
          //添加标识，判断用户是否已添加该影片：0--否，1--是
          movielist[j].can_view = 1;
          arr.push(movielist[j])
        }
        moviedata.data = arr;
        switch(type){
          case "all":
          	this.assign("hotmovie",moviedata);
            break;
          case 1:
            this.assign("moviedata1",moviedata);
            break;
          case 2:
            this.assign("moviedata2",moviedata);
            break;
          default:
            break;
        }
        //this.assign("moviedata",moviedata)
      }
    }
  }

  /**
   * 解析路由，判断是封面频道页面还是列表页面
   */
   async routeAction(){
    //console.log('enter routeAction');
    // this.end( this.get('category'));
    //console.log(this.get('category'));
    let cate = await this.category(this.get('category').split("-")[0]);
    console.log(cate);

    let type = cate.allow_publish;//allow_publish:栏目发布类型，是否允许发布内容  0封面，1列表
    if(cate.mold == 2){
      type = 'sp';
    }

    switch (type){
      case 0:
        if(cate.mold==1){//mold:栏目类型 0系统模型 1独立模型 2单页面
          await this.action("mod/index","index");
        }else {
          await this.action("cover","index");
        }
        break;
        case 1:
        case 2:
        if(cate.mold==1){
         // await this.action('question/list', 'index', 'mod')
         await this.action("mod/index","list");
       }else {
        await this.action("list","index");
      }
      break;
      case 'sp':
      await this.action("sp","index");
      break;
      default:
      this.end(111)
    }
    //this.end(cate.allow_publish)
    // 获取当前栏目的模型
    //let models = await this.model("category",{},'admin').get_category(cate.id, 'model');
  }
}
