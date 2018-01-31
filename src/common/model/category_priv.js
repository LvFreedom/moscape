'use strict';
/**
 * model
 */
export default class extends think.model.base {
//前台权限验证
    /**
     *缓存权限列表 all_priv
     * @param catid 要验证的栏目id
     * @param roleid 用户组
     * @param action 权限类型
     * @param is_admin 谁否前台
     * @returns {number} 返回0 或1 0:没权限，1有权限。
     */
   async priv(catid,roleid,action,is_admin=0,type=true){
       let list = await think.cache("all_priv", () => {
           return this.select();
       }, {timeout: 365 * 24 * 3600});
        ////console.log(list);
        let res=0;
        //console.log('catid='+catid+',is_admin='+is_admin+',roleid = '+roleid+',action='+action);
        //先查询该栏目在前台或者后台的权限组,如果查询为空，则标示没设置权限，默认开放
        let isadd = think._.filter(list, {catid:Number(catid),is_admin:Number(is_admin)});
        //console.log(isadd);
        if(think.isEmpty(isadd)&&type){//
            res =1;
        }else {  //如果查询到，则过滤改用户角色是否有该权限
            let priv =  think._.filter(isadd,{roleid:Number(roleid),action:action});
            res =priv.length;
       }
        return res;
    }

}