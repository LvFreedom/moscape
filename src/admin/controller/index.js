// +----------------------------------------------------------------------
// | PeanutRoll [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.peanutroll.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: zhengqsh <zhengqsh@126.com>
// +----------------------------------------------------------------------
'use strict';

import Base from './base.js';
import {type} from 'os';
/**
 * 后台首页控制器
 * @author  <zhengqsh@126.com>
 * http://www.peanutroll.com
 */
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
    ////console.log(think.parseConfig(true,think.config("db")).prefix);
    //await this.model("action").log("chufa","member","sdffds",this.user.uid,this.ip(),this.http.url);//测试日志行为
      //服务器信息
    this.meta_title=this.locale('meta_title_admin');
    let mysqlv=await this.model('mysql').query("select version()");
    let node = process.versions;
      this.assign({
          'version':think.CMSWING_VERSION,
          'OS':type(),
          'nodejs_v':node.node,
          'thinkjs':think.version,
          'mysqlv':mysqlv[0]['version()']
      })
    //查询设备总数量
    let device_count = await this.model("document_nfc_device").count("id")
    //查询设备开机总数量
    let register_count = await this.model("document_nfc_register_event").count("id")
    //查询设备读写总数量
    let notify_count = await this.model("document_nfc_notify_event").count("id")

    //用户统计
      let user_count = await this.model("member").count('id');
      //行为
      let action_count = await this.model("action").count("id");
      //栏目
      let cate_count = await this.model("category").count("id");
      //模型
      let model_count = await this.model("model").count("id");
      //插件
      let ext_count = await this.model("ext").count();
      //分类信息
      let type_count = await this.model("type").count();
    this.assign({
      user_count:user_count,
        action_count:action_count,
        cate_count:cate_count,
        model_count:model_count,
        ext_count:ext_count,
        type_count:type_count,
        device_count:device_count,
        register_count:register_count,
        notify_count:notify_count
    })
    ////console.log(111)
    return this.display();
  }

  async countsearchAction(){
    let given_date,start_date,end_date;
    let data_type = this.post("data_type") || "";
    let time_type = this.post("time_type") || "";
    let device_id = this.post("device_id") || "";
    if(time_type == "by-hour"){
      given_date = this.post("given_date") || "";
    }else{
      start_date = this.post("start_date") || "";
      end_date = this.post("end_date") || "";
    }
    // console.log(data_type);
    // console.log(time_type);
    // console.log(device_id);
    
    // console.log(given_date);
    // console.log(start_date);
    // console.log(end_date);

    // let slot = this.post("time_slot") || "";
    // let time_slot = '%'+slot+'%';
    
    let map = [];
    let map_time = [];
      
    if(!think.isEmpty(data_type)&&data_type == 0){
      	//设备总数查询
      	let  device_count;
        if(time_type == "by-hour"){//按小时
          if(!think.isEmpty(given_date)){
            let time_slot = '%'+given_date+'%';
             device_count = await this.model("mysql").query("SELECT HOUR(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_device WHERE register_time LIKE '"+ time_slot +"' GROUP BY HOUR(register_time) ORDER BY Hour(register_time)")
            //register_count.unshift({data_type:"设备开机总数",time_type:'by-hour',given_date:given_date})
          }else{
             device_count = await this.model("mysql").query("SELECT HOUR(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_device where DATE_SUB(CURDATE(), INTERVAL 0 DAY) <= date(register_time) GROUP BY HOUR(register_time) ORDER BY HOUR(register_time)")
          }
          for(let i=0;i<24;i++){
            // map_time.push(i+1);
            // map_count.push(0);
            map.push({register_time:i,count:0});
          }
          for(let k=0;k<device_count.length;k++){
            let index = device_count[k].register_time;
            //map_count.splice(index,1,register_count[k].count);
            map.splice(index,1,{register_time:map[index].register_time,count:device_count[k].count})
          }
          //console.log(device_count)
          // console.log(map)
        }else if(time_type == "by-day"){//默认7天
          if(!think.isEmpty(start_date) && !think.isEmpty(end_date)){
            let start = start_date+" 00:00:00";
            let end = end_date+" 23:59:59";
            device_count = await this.model("mysql").query("SELECT DATE(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_device WHERE register_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY DAY(register_time) ORDER BY DAY(register_time)")
            map_time = await this.getAllDate(start_date, end_date)
          }else{
            device_count = await this.model("mysql").query("SELECT DATE(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_device where DATE_SUB(CURDATE(), INTERVAL 6 DAY) <= date(register_time) GROUP BY DAY(register_time) ORDER BY DAY(register_time)")            
            let myDate = new Date();
            let endDate = await this.dateFormat(myDate);
            let startDate = await this.getBeforDate(6);
            map_time = await this.getAllDate(startDate, endDate)
          }

          for(let i=0;i<device_count.length;i++){
            let m = await this.dateFormat(device_count[i].register_time)
            device_count.splice(i,1,{register_time:m,count:device_count[i].count})
          }

          for(let n=0;n<map_time.length;n++){
            map.push({register_time:map_time[n],count:0})
          }
          if(!think.isEmpty(device_count)){
            for(let k=0;k<map_time.length;k++){
              for(let r=0;r<device_count.length;r++){
                if(map_time[k] == device_count[r].register_time){
                  map.splice(k,1,{register_time:map_time[k],count:device_count[r].count})
                }
              }
            }
          }
        }else if(time_type == "by-week"){//按周 默认4周
          if(!think.isEmpty(start_date) && !think.isEmpty(end_date)){
            let start = start_date+" 00:00:00";
            let end = end_date+" 23:59:59";
            device_count = await this.model("mysql").query("SELECT YEARWEEK(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_device where register_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY WEEK(register_time) ORDER BY WEEK(register_time)")
            map_time = await this.weekOfYear(start_date,end_date);
          }else{
            device_count = await this.model("mysql").query("SELECT YEARWEEK(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_device where DATE_SUB(CURDATE(), INTERVAL 3 WEEK) <= date(register_time) GROUP BY WEEK(register_time) ORDER BY WEEK(register_time)")
            let b = await this.dateFormat(new Date());
            map_time = await this.weekOfYear(0,b);
          }
          //console.log(map_time)
          //console.log(device_count);
          for(let n=0;n<map_time.length;n++){
            map.push({register_time:map_time[n],count:0})
          }
          if(!think.isEmpty(device_count)){
            for(let i=0;i<map.length;i++){
              let date = map[i].register_time.replace("/","");
              //console.log(date)
              for(let k=0;k<device_count.length;k++){
                if(date == device_count[k].register_time){
                  map.splice(i,1,{register_time:map[i].register_time,count:device_count[k].count})
                }
              }
            }
          }
        }else if(time_type == "by-month"){
          let monthArray=[];
          if(!think.isEmpty(start_date) && !think.isEmpty(end_date)){
            let start = start_date+" 00:00:00";
            let end = end_date+" 23:59:59";
            device_count = await this.model("mysql").query("SELECT YEAR(register_time) as year, MONTH(register_time) as month,count(*) as count FROM cmswing_document_nfc_device where register_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY MONTH(register_time) ORDER BY MONTH(register_time)")
            monthArray = await this.getDateArry(start_date,end_date);
          }else{
            device_count = await this.model("mysql").query("SELECT YEAR(register_time) as year, MONTH(register_time) as month,count(*) as count FROM cmswing_document_nfc_device where DATE_SUB(CURDATE(), INTERVAL 5 MONTH) <= date(register_time) GROUP BY MONTH(register_time) ORDER BY MONTH(register_time)")
            let myDate = new Date();
            let end = await this.dateFormat(myDate);
            let start = await this.dateFormat(new Date(myDate.setMonth(myDate.getMonth()-5)));              
            monthArray = await this.getDateArry(start,end);
          }
          //console.log(device_count)
          //console.log(monthArray)
          for(let i=0;i<monthArray.length;i++){
            map.push({register_time:monthArray[i],count:0})
          }
          //console.log(map)
          if(!think.isEmpty(device_count)){
            for(let k=0;k<map.length;k++){
              let date = map[k].register_time.split("-")
              for(let i=0;i<device_count.length;i++){
                if(device_count[i].year==date[0] && device_count[i].month==date[1]){
                  map.splice(k,1,{register_time:map[k].register_time,count:device_count[i].count})
                }
              }
            }
          }
        } 
        //console.log(map)
        let statistics = {
          data_type:data_type,
          data:map
        }
        return this.json(statistics)
    }else if(!think.isEmpty(data_type)&&data_type == 1){
      	//设备开机总数查询
        let register_count;
      	if(time_type == "by-hour"){//按小时
          if(!think.isEmpty(given_date)){
            let time_slot = '%'+given_date+'%';
            if(!think.isEmpty(device_id)){
              register_count = await this.model("mysql").query("SELECT HOUR(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event WHERE device_id='"+ device_id +"' and register_time LIKE '"+ time_slot +"' GROUP BY HOUR(register_time) ORDER BY Hour(register_time)")
            }else{
              register_count = await this.model("mysql").query("SELECT HOUR(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event WHERE register_time LIKE '"+ time_slot +"' GROUP BY HOUR(register_time) ORDER BY Hour(register_time)")
            }
          }else{
            if(!think.isEmpty(device_id)){
              register_count = await this.model("mysql").query("SELECT HOUR(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event where device_id='"+ device_id +"' and DATE_SUB(CURDATE(), INTERVAL 0 DAY) <= date(register_time) GROUP BY HOUR(register_time) ORDER BY HOUR(register_time)")
            }else{
              register_count = await this.model("mysql").query("SELECT HOUR(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event where DATE_SUB(CURDATE(), INTERVAL 0 DAY) <= date(register_time) GROUP BY HOUR(register_time) ORDER BY HOUR(register_time)")
            }
          }
          for(let i=0;i<24;i++){
            // map_time.push(i+1);
            // map_count.push(0);
            map.push({register_time:i,count:0});
          }
          for(let k=0;k<register_count.length;k++){
            let index = register_count[k].register_time;
            //map_count.splice(index,1,register_count[k].count);
            map.splice(index,1,{register_time:map[index].register_time,count:register_count[k].count})
          }
           //console.log(register_count)
          // console.log(map)
      	}else if(time_type == "by-day"){//默认7天
          if(!think.isEmpty(start_date) && !think.isEmpty(end_date)){
            let start = start_date+" 00:00:00";
            let end = end_date+" 23:59:59";
            if(!think.isEmpty(device_id)){
              register_count = await this.model("mysql").query("SELECT DATE(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event WHERE device_id='"+ device_id +"' and register_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY DAY(register_time) ORDER BY DAY(register_time)")
              map_time = await this.getAllDate(start_date, end_date)
            }else{
              register_count = await this.model("mysql").query("SELECT DATE(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event WHERE register_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY DAY(register_time) ORDER BY DAY(register_time)")
              map_time = await this.getAllDate(start_date, end_date)
            }
            
          }else{
            if(!think.isEmpty(device_id)){
              register_count = await this.model("mysql").query("SELECT DATE(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event where device_id='"+ device_id +"' and DATE_SUB(CURDATE(), INTERVAL 6 DAY) <= date(register_time) GROUP BY DAY(register_time) ORDER BY DAY(register_time)")
            }else{
              register_count = await this.model("mysql").query("SELECT DATE(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event where DATE_SUB(CURDATE(), INTERVAL 6 DAY) <= date(register_time) GROUP BY DAY(register_time) ORDER BY DAY(register_time)")
            }            
            let myDate = new Date();
            let endDate = await this.dateFormat(myDate);
            let startDate = await this.getBeforDate(6);
            map_time = await this.getAllDate(startDate, endDate)
          }

          for(let i=0;i<register_count.length;i++){
            let m = await this.dateFormat(register_count[i].register_time)
            register_count.splice(i,1,{register_time:m,count:register_count[i].count})
          }

          for(let n=0;n<map_time.length;n++){
            map.push({register_time:map_time[n],count:0})
          }
          if(!think.isEmpty(register_count)){
          	for(let k=0;k<map_time.length;k++){
	            for(let r=0;r<register_count.length;r++){
	              if(map_time[k] == register_count[r].register_time){
	                map.splice(k,1,{register_time:map_time[k],count:register_count[r].count})
	              }
	            }
	          }
          }
          
          //console.log(map)
          //console.log(register_count);
        }else if(time_type == "by-week"){//按周 默认4周
          if(!think.isEmpty(start_date) && !think.isEmpty(end_date)){
            let start = start_date+" 00:00:00";
            let end = end_date+" 23:59:59";
            if(!think.isEmpty(device_id)){
              register_count = await this.model("mysql").query("SELECT YEARWEEK(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event where device_id='"+ device_id +"' and register_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY WEEK(register_time) ORDER BY WEEK(register_time)")
            }else{
              register_count = await this.model("mysql").query("SELECT YEARWEEK(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event where register_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY WEEK(register_time) ORDER BY WEEK(register_time)")
            }  
            map_time = await this.weekOfYear(start_date,end_date);
          }else{
            if(!think.isEmpty(device_id)){
              register_count = await this.model("mysql").query("SELECT YEARWEEK(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event where device_id='"+ device_id +"' and DATE_SUB(CURDATE(), INTERVAL 3 WEEK) <= date(register_time) GROUP BY WEEK(register_time) ORDER BY WEEK(register_time)")
            }else{
              register_count = await this.model("mysql").query("SELECT YEARWEEK(register_time) as register_time,count(*) as count FROM cmswing_document_nfc_register_event where DATE_SUB(CURDATE(), INTERVAL 3 WEEK) <= date(register_time) GROUP BY WEEK(register_time) ORDER BY WEEK(register_time)")
            } 
            let b = await this.dateFormat(new Date());
            map_time = await this.weekOfYear(0,b);
          }
          //console.log(map_time)
         // console.log(register_count);
          for(let n=0;n<map_time.length;n++){
            map.push({register_time:map_time[n],count:0})
          }
          if(!think.isEmpty(register_count)){
          	for(let i=0;i<map.length;i++){
          		let date = map[i].register_time.replace("/","");
          		//console.log(date)
          		for(let k=0;k<register_count.length;k++){
          			if(date == register_count[k].register_time){
          				map.splice(i,1,{register_time:map[i].register_time,count:register_count[k].count})
          			}
          		}
          	}
          }
        }else if(time_type == "by-month"){
        	let monthArray=[];
        	if(!think.isEmpty(start_date) && !think.isEmpty(end_date)){
        		let start = start_date+" 00:00:00";
            let end = end_date+" 23:59:59";
            if(!think.isEmpty(device_id)){
              register_count = await this.model("mysql").query("SELECT YEAR(register_time) as year, MONTH(register_time) as month,count(*) as count FROM cmswing_document_nfc_register_event where device_id='"+ device_id +"' and register_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY MONTH(register_time) ORDER BY MONTH(register_time)")
            }else{
              register_count = await this.model("mysql").query("SELECT YEAR(register_time) as year, MONTH(register_time) as month,count(*) as count FROM cmswing_document_nfc_register_event where register_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY MONTH(register_time) ORDER BY MONTH(register_time)")
            }
        		monthArray = await this.getDateArry(start_date,end_date);
        	}else{
            if(!think.isEmpty(device_id)){
              register_count = await this.model("mysql").query("SELECT YEAR(register_time) as year, MONTH(register_time) as month,count(*) as count FROM cmswing_document_nfc_register_event where device_id='"+ device_id +"' and DATE_SUB(CURDATE(), INTERVAL 5 MONTH) <= date(register_time) GROUP BY MONTH(register_time) ORDER BY MONTH(register_time)")
            }else{
              register_count = await this.model("mysql").query("SELECT YEAR(register_time) as year, MONTH(register_time) as month,count(*) as count FROM cmswing_document_nfc_register_event where DATE_SUB(CURDATE(), INTERVAL 5 MONTH) <= date(register_time) GROUP BY MONTH(register_time) ORDER BY MONTH(register_time)")
            }
        		
        		let myDate = new Date();
        		let end = await this.dateFormat(myDate);
        		let start = await this.dateFormat(new Date(myDate.setMonth(myDate.getMonth()-5)));      				
        		monthArray = await this.getDateArry(start,end);
        	}
        	//console.log(register_count)
        	//console.log(monthArray)
        	for(let i=0;i<monthArray.length;i++){
        		map.push({register_time:monthArray[i],count:0})
        	}
        	//console.log(map)
        	if(!think.isEmpty(register_count)){
        		for(let k=0;k<map.length;k++){
	        		let date = map[k].register_time.split("-")
	        		for(let i=0;i<register_count.length;i++){
	        			if(register_count[i].year==date[0] && register_count[i].month==date[1]){
	        				map.splice(k,1,{register_time:map[k].register_time,count:register_count[i].count})
	        			}
	        		}
	        	}
        	}
        	//console.log(map)
        }  
        //console.log(map)
        let statistics = {
          data_type:data_type,
          data:map
        }
        return this.json(statistics)
    }else if(!think.isEmpty(data_type)&&data_type == 2){
    	//设备读写总数查询
    	let notify_count;
      if(time_type == "by-hour"){//按小时
        if(!think.isEmpty(given_date)){
          let time_slot = '%'+given_date+'%';
          if(!think.isEmpty(device_id)){
          	notify_count = await this.model("mysql").query("SELECT HOUR(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event WHERE device_id='"+ device_id +"' and notify_time LIKE '"+ time_slot +"' GROUP BY HOUR(notify_time) ORDER BY Hour(notify_time)")
          }else{
			notify_count = await this.model("mysql").query("SELECT HOUR(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event WHERE notify_time LIKE '"+ time_slot +"' GROUP BY HOUR(notify_time) ORDER BY Hour(notify_time)")
          }
          
        }else{
        	if(!think.isEmpty(device_id)){
        		notify_count = await this.model("mysql").query("SELECT HOUR(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event where device_id='"+ device_id +"' and DATE_SUB(CURDATE(), INTERVAL 0 DAY) <= date(notify_time) GROUP BY HOUR(notify_time) ORDER BY HOUR(notify_time)");
        	}else{
        		notify_count = await this.model("mysql").query("SELECT HOUR(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event where DATE_SUB(CURDATE(), INTERVAL 0 DAY) <= date(notify_time) GROUP BY HOUR(notify_time) ORDER BY HOUR(notify_time)");
        	}
          
        }
        for(let i=0;i<24;i++){
          // map_time.push(i+1);
          // map_count.push(0);
          map.push({notify_time:i,count:0});
        }
        for(let k=0;k<notify_count.length;k++){
          let index = notify_count[k].notify_time;
          //map_count.splice(index,1,register_count[k].count);
          map.splice(index,1,{notify_time:map[index].notify_time,count:notify_count[k].count})
        }
      }else if(time_type == "by-day"){//默认7天
        if(!think.isEmpty(start_date) && !think.isEmpty(end_date)){
          let start = start_date+" 00:00:00";
          let end = end_date+" 23:59:59";
          if(!think.isEmpty(device_id)){
          	notify_count = await this.model("mysql").query("SELECT DATE(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event WHERE device_id='"+ device_id +"' and notify_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY DAY(notify_time) ORDER BY DAY(notify_time)")
          }else{
          	notify_count = await this.model("mysql").query("SELECT DATE(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event WHERE notify_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY DAY(notify_time) ORDER BY DAY(notify_time)")
          }
          map_time = await this.getAllDate(start_date, end_date)
        }else{
        	if(!think.isEmpty(device_id)){
        		notify_count = await this.model("mysql").query("SELECT DATE(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event where device_id='"+ device_id +"' and DATE_SUB(CURDATE(), INTERVAL 6 DAY) <= date(notify_time) GROUP BY DAY(notify_time) ORDER BY DAY(notify_time)")
        	}else{
        		notify_count = await this.model("mysql").query("SELECT DATE(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event where DATE_SUB(CURDATE(), INTERVAL 6 DAY) <= date(notify_time) GROUP BY DAY(notify_time) ORDER BY DAY(notify_time)")
        	}          
          let myDate = new Date();
          let endDate = await this.dateFormat(myDate);
          let startDate = await this.getBeforDate(6);
          map_time = await this.getAllDate(startDate, endDate)
        }

        for(let i=0;i<notify_count.length;i++){
          let m = await this.dateFormat(notify_count[i].notify_time)
          notify_count.splice(i,1,{notify_time:m,count:notify_count[i].count})
        }

        for(let n=0;n<map_time.length;n++){
          map.push({notify_time:map_time[n],count:0})
        }
        if(!think.isEmpty(notify_count)){
          for(let k=0;k<map_time.length;k++){
            for(let r=0;r<notify_count.length;r++){
              if(map_time[k] == notify_count[r].notify_time){
                map.splice(k,1,{notify_time:map_time[k],count:notify_count[r].count})
              }
            }
          }
        }
      }else if(time_type == "by-week"){//按周 默认4周
        if(!think.isEmpty(start_date) && !think.isEmpty(end_date)){
          let start = start_date+" 00:00:00";
          let end = end_date+" 23:59:59";
          if(!think.isEmpty(device_id)){
          	notify_count = await this.model("mysql").query("SELECT YEARWEEK(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event where device_id='"+ device_id +"' and notify_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY WEEK(notify_time) ORDER BY WEEK(notify_time)")
          }else{
          	notify_count = await this.model("mysql").query("SELECT YEARWEEK(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event where notify_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY WEEK(notify_time) ORDER BY WEEK(notify_time)")
          }
          map_time = await this.weekOfYear(start_date,end_date);
        }else{
        	if(!think.isEmpty(device_id)){
        		notify_count = await this.model("mysql").query("SELECT YEARWEEK(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event where device_id='"+ device_id +"' and DATE_SUB(CURDATE(), INTERVAL 3 WEEK) <= date(notify_time) GROUP BY WEEK(notify_time) ORDER BY WEEK(notify_time)")
        	}else{
        		notify_count = await this.model("mysql").query("SELECT YEARWEEK(notify_time) as notify_time,count(*) as count FROM cmswing_document_nfc_notify_event where DATE_SUB(CURDATE(), INTERVAL 3 WEEK) <= date(notify_time) GROUP BY WEEK(notify_time) ORDER BY WEEK(notify_time)")
        	}
          let b = await this.dateFormat(new Date());
          map_time = await this.weekOfYear(0,b);
        }
        //console.log(map_time)
        //console.log(notify_count);
        for(let n=0;n<map_time.length;n++){
          map.push({notify_time:map_time[n],count:0})
        }
        if(!think.isEmpty(notify_count)){
          for(let i=0;i<map.length;i++){
            let date = map[i].notify_time.replace("/","");
            //console.log(date)
            for(let k=0;k<notify_count.length;k++){
              if(date == notify_count[k].notify_time){
                map.splice(i,1,{notify_time:map[i].notify_time,count:notify_count[k].count})
              }
            }
          }
        }
      }else if(time_type == "by-month"){
        let monthArray=[];
        if(!think.isEmpty(start_date) && !think.isEmpty(end_date)){
          let start = start_date+" 00:00:00";
          let end = end_date+" 23:59:59";
          if(!think.isEmpty(device_id)){
          	notify_count = await this.model("mysql").query("SELECT YEAR(notify_time) as year, MONTH(notify_time) as month,count(*) as count FROM cmswing_document_nfc_notify_event where device_id='"+ device_id +"' and notify_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY MONTH(notify_time) ORDER BY MONTH(notify_time)")
          }else{
          	notify_count = await this.model("mysql").query("SELECT YEAR(notify_time) as year, MONTH(notify_time) as month,count(*) as count FROM cmswing_document_nfc_notify_event where notify_time BETWEEN '" + start +"' AND '" + end +"' GROUP BY MONTH(notify_time) ORDER BY MONTH(notify_time)")
          }
          
          monthArray = await this.getDateArry(start_date,end_date);
        }else{
        	if(!think.isEmpty(device_id)){
        		notify_count = await this.model("mysql").query("SELECT YEAR(notify_time) as year, MONTH(notify_time) as month,count(*) as count FROM cmswing_document_nfc_notify_event where device_id='"+ device_id +"' and DATE_SUB(CURDATE(), INTERVAL 5 MONTH) <= date(notify_time) GROUP BY MONTH(notify_time) ORDER BY MONTH(notify_time)")
        	}else{
        		notify_count = await this.model("mysql").query("SELECT YEAR(notify_time) as year, MONTH(notify_time) as month,count(*) as count FROM cmswing_document_nfc_notify_event where DATE_SUB(CURDATE(), INTERVAL 5 MONTH) <= date(notify_time) GROUP BY MONTH(notify_time) ORDER BY MONTH(notify_time)")
        	}
          let myDate = new Date();
          let end = await this.dateFormat(myDate);
          let start = await this.dateFormat(new Date(myDate.setMonth(myDate.getMonth()-5)));              
          monthArray = await this.getDateArry(start,end);
        }
        //console.log(notify_count)
        //console.log(monthArray)
        for(let i=0;i<monthArray.length;i++){
          map.push({notify_time:monthArray[i],count:0})
        }
        //console.log(map)
        if(!think.isEmpty(notify_count)){
          for(let k=0;k<map.length;k++){
            let date = map[k].notify_time.split("-")
            for(let i=0;i<notify_count.length;i++){
              if(notify_count[i].year==date[0] && notify_count[i].month==date[1]){
                map.splice(k,1,{notify_time:map[k].notify_time,count:notify_count[i].count})
              }
            }
          }
        }
      } 
      //console.log(map)
      let statistics = {
        data_type:data_type,
        data:map
      }
      return this.json(statistics)
    } 
  }
  //获取两个日期之间的所有日期
  async getAllDate(start, end){
    //console.log(start)
    //console.log(end)
    let dateArray = [];
    let date_a = start.split("-");
    let date_b = end.split("-");
    let new_a = new Date();
    new_a.setUTCFullYear(date_a[0],date_a[1]-1,date_a[2]);
    let new_b = new Date();
    new_b.setUTCFullYear(date_b[0],date_b[1]-1,date_b[2]);
    let unixDa = new_a.getTime();
    let unixDb = new_b.getTime();
    for(let k = unixDa; k <= unixDb;){
      dateArray.push(await this.dateFormat((new Date(parseInt(k)))));
      k = k + 24 * 60 * 60 * 1000; 
    }
    return dateArray;
    //console.log(dateArray)
  }
  //输出YYYY-MM-DD格式日期
  async dateFormat(date){
    let s = '';
    let month = (date.getMonth()+1) >= 10 ? (date.getMonth()+1) : ('0'+(date.getMonth()+1));
    let day = date.getDate()>=10 ? date.getDate() : ('0'+date.getDate());
    s += date.getFullYear() + '-'; // 获取年份。  
    s += month + "-"; // 获取月份。  
    s += day; // 获取日。  
    return (s); // 返回日期。
  }
  //输出当前时间指定时间前的日期
  async getBeforDate(n){
    let d = new Date();
    
    d.setDate(d.getDate() - n);
    let year = d.getFullYear();
    let mon = d.getMonth() + 1;
    let day = d.getDate();
    let s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
    return s;
  }

  //输出周数
  async weekOfYear(start,end){
    let week=[];
    let dayMS = 24*60*60*1000; 
    let weekMS = 7*dayMS;
    if(start == 0){
      let date = end.split("-");
      //let date=["1916","12","31"]
      let date1 = new Date(date[0], 0, 1);   
      let date2 = new Date(date[0], parseInt(date[1])-1, date[2], 1);

      let firstDay = (7-date1.getDay())*dayMS;     
      date1 = date1.getTime();
      date2 = date2.getTime();
      let week1 = Math.ceil((date2-date1-firstDay)/weekMS)+1;
      //console.log(week1)
      if(week1>=4){
        for(let i=0;i<4;i++){
          week.unshift(date[0]+"/"+(week1-i))
        }
      }else{
      	//获得上年的周数
      	let date3 = new Date(date[0], 0, 1);   
  	    let date4 = new Date(parseInt(date[0])-1, 11, date[2], 1);

  	    let firstDay = (7-date3.getDay())*dayMS;     
  	    date3 = date1.getTime();
  	    date4 = date2.getTime();
  	    let week2 = Math.ceil((date4-date3-firstDay)/weekMS)+1;
        for(let i=0;i<week1;i++){
          week.unshift(date[0]+"/"+(week1-i))
        }
        for(let k=0;k<4-week1;k++){
          week.unshift((parseInt(date[0])-1)+"/"+(week2-k))
        }
      } 
    }else{
      let date_a = start.split("-");
      let date_b = end.split("-");

      //console.log(date_a[0],date_a[1],date_a[2]);

      //console.log(date_b[0],date_b[1],date_b[2]);

      //   date_a[0]  年   
      //   date_a[1]  月   
      //   date_a[2]  日   
      //   每周从周日开始   
      let date1 = new Date(date_a[0], 0, 1);   
      let date2 = new Date(date_a[0], date_a[1]-1, date_a[2], 1);

      let date3 = new Date(date_b[0], 0, 1); 
      let date4 = new Date(date_b[0], date_b[1]-1, date_b[2], 1);

      let firstDay1 = (7-date1.getDay())*dayMS;     
      date1 = date1.getTime();   
      date2 = date2.getTime();

      let firstDay2 = (7-date3.getDay())*dayMS;     
      date3 = date3.getTime();   
      date4 = date4.getTime();

      let week1 = Math.ceil((date2-date1-firstDay1)/weekMS)+1;  
      let week2 = Math.ceil((date4-date3-firstDay2)/weekMS)+1;  

      //console.log(week1,week2)

      if(date_a[0] == date_b[0]){
        if(week2 >= week1){
          let length = week2-week1;
          for(let i=0;i<=length;i++){
            week.push(date_a[0]+"/"+((week1+i)<10?("0"+(week1+i)):(week1+i)))
          }
        }
      }else if(date_a[0] < date_b[0]){
        let n = date_b[0]-date_a[0]
        for(let i=0;i<=n;i++){
          let year = parseInt(date_a[0])+i;
          let date5 = new Date(year, 0, 1);   
	      let date6 = new Date(year, 11, 31, 1);

	      let firstDay = (7-date5.getDay())*dayMS;     
	      date5 = date5.getTime();
	      date6 = date6.getTime();
	      let week5 = Math.ceil((date6-date5-firstDay)/weekMS)+1;

          if(year == date_a[0]){
            for(let k=0;k<=week5-week1;k++){
              week.push(year+"/"+((week1+k)<10?("0"+(week1+k)):(week1+k)))
            }
          }
          if(year != date_a[0] && year != date_b[0]){
            for(let k=0;k<week5;k++){
              week.push(year+"/"+((k+1)<10?("0"+(k+1)):(k+1)))
            }
          }
          if(year == date_b[0]){
            for(let k=0;k<week2;k++){
              week.push(year+"/"+((k+1)<10?("0"+(k+1)):(k+1)))
            }
          }
        }
      }
    
    }

    //console.log(week)
    return week;
  }
  //获取两个日期间的所有月份
  async getDateArry(start,end) {
    let d1 = start;//'2015-02-24';
    let d2 = end;//'2016-11-30';
    let dateArry = new Array();
    let s1 = d1.split("-");
    let s2 = d2.split("-");
    let mCount = 0;
    if (parseInt(s1[0]) < parseInt(s2[0])) {
        mCount = (parseInt(s2[0]) - parseInt(s1[0])) * 12 + parseInt(s2[1]) - parseInt(s1[1])+1;
    } else {
        mCount = parseInt(s2[1]) - parseInt(s1[1])+1;
    }
    if (mCount > 0) {
        let startM = parseInt(s1[1]);
        let startY = parseInt(s1[0]);
        for (let i = 0; i < mCount; i++) {
            if (startM < 12) {
                dateArry[i] = startY + "-" + (startM>9 ? startM : "0" + startM);
                startM += 1;
            } else {
                dateArry[i] = startY + "-" + (startM > 9 ? startM : "0" + startM);
                startM = 1;
                startY += 1;
            }
        }
    }
    return dateArry;
  }
}
