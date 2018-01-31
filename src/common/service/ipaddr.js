'use strict';
import superagent from 'superagent';
export default class extends think.service.base {
  /**
   * init
   * @return {}         []
   */
  init(){
      this.baseUrl="http://int.dpool.sina.com.cn/iplookup/iplookup.php";
  }

  async getipaddr(ip){

    let getaddrofip = ()=>{
      let deferred = think.defer();
      superagent
          .get(`${this.baseUrl}?format=json&ip=${ip}`)
          .end(function(err,res){
            //console.log(JSON.parse(res.text));
             deferred.resolve(JSON.parse(res.text))
          });
      return  deferred.promise;
    }

    let res =  await getaddrofip();
    console.log(res);
        if(res.ret && res.ret==1){
          return res.country+','+res.province+','+res.city;
        }else{
            return '';
        }
  }
}