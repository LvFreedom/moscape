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
      return this.display();

    }

   async aliyunptsAction(){
      return this.display();

    }


}
