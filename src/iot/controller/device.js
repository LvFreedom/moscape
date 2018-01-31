'use strict';

'use strict';
import moment from "moment"
import Segment from 'segment';
moment.locale('zh-cn');
import Base from './base.js';

/**
 * rest controller
 * @type {Class}
 */
export default class extends Base {
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init(http){
    super.init(http);
  }

  async registerAction(){
    let data = this.post();
    let device_id;
    console.log(data);
    

    let deviceData = {};
    if(data == null || data.mac == null ){
     return this.fail(501,"data or data.mac is null",data);
    }
    //let res = await this.model("device").where({mac:data.mac}).find();
    let res = await this.model("document_nfc_device").where({mac:data.mac}).find();
    if(res.uuid){
      device_id = res.uuid;
      console.log("device already register,device_id = "+device_id);
      deviceData.id = res.id;
      deviceData.last_active_time = think.datetime();
      if(data && data.version && data.version!= res.version){
        deviceData.version = data.version;
        //version2.0.1 add ntaginfo
        if(data && data.ntagInfo){
          let ntagInfo =  JSON.parse(data.ntagInfo);
          if(ntagInfo.uid){
            deviceData.ntag_id = ntagInfo.uid;
          }
        }
        if(data && data.type){
          deviceData.device_type = data.type;
        }
        deviceData.register_ip = this.ip();

        let IPADDR = think.service("ipaddr");
        let ipaddr = new IPADDR();
        deviceData.register_addr = await ipaddr.getipaddr(deviceData.register_ip);

      }
      //await this.model("device").update(deviceData);
      await this.model("document_nfc_device").update(deviceData);

      //update info ?
    }else{
      if(data && data.state){
        deviceData.state = data.state;
      }
      if(data && data.mac){
        deviceData.mac = data.mac;
      }
      if(data && data.version){
        deviceData.version = data.version;
      }
      if(data && data.name){
        deviceData.alias = data.name;
      }
      if(data && data.wifi_mac){
        deviceData.wifi_mac = data.wifi_mac;
      }
      if(data && data.desc){
        deviceData.desc = data.desc;
      }
      if(data && data.type){
        deviceData.device_type = data.type;
      }
      if(data && data.boardInfo){
        let boardInfo =  JSON.parse(data.boardInfo);
        if(boardInfo.build){
          deviceData.build = boardInfo.build;
        }
        if(boardInfo.kernel){
          deviceData.kernel = boardInfo.kernel;
        }
        if(boardInfo.firmware){
          deviceData.firmware = boardInfo.firmware;
        }
        if(boardInfo.model){
          deviceData.model = boardInfo.model;
        }
      }
      if(data && data.ntagInfo){
        let ntagInfo =  JSON.parse(data.ntagInfo);
        if(ntagInfo.uid){
          deviceData.ntag_id = ntagInfo.uid;
        }
      }
      deviceData.uuid = think.uuid();
      device_id = deviceData.uuid;
      deviceData.register_time = think.datetime();
      deviceData.last_active_time = think.datetime();
      deviceData.register_ip = this.ip();

      let IPADDR = think.service("ipaddr");
      let ipaddr = new IPADDR();
      deviceData.register_addr = await ipaddr.getipaddr(deviceData.register_ip);


      console.log(deviceData);
      /*
      let adddevice = await this.model("device").add(deviceData);
      if(adddevice){
        //
      }else {
        //
        console.log('add register device failed');
      }
      */
      //
      //1
      let device_base = {};
      device_base.category_id = 154;
      device_base.model_id = 25;
      let device_res = await this.model("document").add(device_base);
      if(device_res){
        deviceData.id = device_res;
        adddevice = await this.model("document_nfc_device").add(deviceData);
        if(adddevice){
        //
        }else {
          //
          console.log('add register device failed');
        }
      }
    }
    let device_register = {};
    device_register.device_id = device_id;
    device_register.register_time = think.datetime();
    device_register.register_info = JSON.stringify(data);
    device_register.register_ip = this.ip();
    let IPADDR = think.service("ipaddr");
    let ipaddr = new IPADDR();
    device_register.register_addr = await ipaddr.getipaddr(device_register.register_ip);

    //let addregister = await this.model("device_register").add(device_register);
        //
    //1
    let document_base = {};
    document_base.category_id = 151;
    document_base.model_id = 26;
    let document_res = await this.model("document").add(document_base);
    if(document_res){
      device_register.id = document_res;
      await this.model("document_nfc_register_event").add(device_register);
    }
    

    if(document_res){
        return this.success(data);
    }else {
        return this.fail(data)
    }
    
  }

  async notifyAction(){
    let data = this.post();
    console.log(data);
    let device_id;
    if(data == null || data.mac == null ){
     return this.fail(data)
    }

    let res = await this.model("device").where({mac:data.mac}).find();
    if(res.uuid){
      device_id = res.uuid;
    }

    let device_notify = {};
    device_notify.device_id = device_id;
    if(data && data.mac){
      device_notify.mac = data.mac;
    }
    if(data && data.version){
      device_notify.version = data.version;
    }
    device_notify.notify_time = think.datetime();
    device_notify.notify_info = JSON.stringify(data);
    device_notify.notify_ip = this.ip();
    let IPADDR = think.service("ipaddr");
    let ipaddr = new IPADDR();
    device_notify.notify_addr = await ipaddr.getipaddr(device_notify.notify_ip);

    if(data && data.notifyInfo){
      let notifyInfo =  JSON.parse(data.notifyInfo);
      device_notify.notify_model = notifyInfo.func;
      device_notify.notify_type = notifyInfo.type;
      device_notify.notify_apdu_aid = notifyInfo.aid;
      device_notify.notify_data = notifyInfo.data_utf8;
    }

    //let addnotify = await this.model("device_notify").add(device_notify);
        //
    //1
    let document_base = {};
    document_base.category_id = 153;
    document_base.model_id = 27;
    let document_res = await this.model("document").add(document_base);
    if(document_res){
      device_notify.id = document_res;
      let addnotify = await this.model("document_nfc_notify_event").add(device_notify);
      if(addnotify){
        return this.success(data);
      }else {
        return this.fail(data)
      }
    }else {
        return this.fail(data)
    }
  }
  
}