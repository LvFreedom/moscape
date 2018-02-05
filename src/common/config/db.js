'use strict';
/**
 * db config
 * @type {Object}
 */
export default {
  type: 'mysql',
  adapter: {
    mysql: {
      host: '101.132.164.111',
      port: '23306',
      database: 'moscape',
      user: 'root',
      password: 'moscapemedia',
      prefix: 'cmswing_',
      encoding: 'UTF8MB4_GENERAL_CI' //数据库的编码一般会设置为 utf8，但 utf8 并不支持 emoji 表情，如果需要数据库支持 emoji 表情，需要将数据库编码设置为 utf8mb4。
    },
    mongo: {

    }
  }
};
