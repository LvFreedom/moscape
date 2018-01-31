'use strict';
import Base from '../index.js';
import moment from "moment"
moment.locale('zh-cn');
export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     * 封面入口
     */
     indexAction(){
        ////console.log(this);
        //auto render template file index_index.html

        return this.display();
    }

    /**
     * ajax获取栏目分组
     * @param cid 栏目id
     * @returns {*}
     */
     async getgroupsAction(){
        let cid = this.get("cid");
        let groups = await this.model('category').get_groups(cid);
        if(think.isEmpty(groups)){
            groups=false;
        }
        return this.json(groups);
    }
    //关注
    async ajaxquestionfocusAction(){
        //前端验证登录
        await this.weblogin();
        //获取关注的类型，1关注，2取消关注
        let type= this.get("type");
        //获取要关注的id;
        let id = this.get("id");
        let res;
        switch (Number(type)){
            case 1:
            //关注
            await this.model("question_focus").add({question_id:id,uid:this.user.uid,add_time:new Date().getTime()});
            await this.model("question").where({id:id}).increment("focus_count");
            this.success({name:"关注成功!"});
            break;
            case 2:
               //取消关注
               await this.model("question_focus").where({question_id:id,uid:this.user.uid}).delete();
               await this.model("question").where({id:id}).decrement("focus_count");
               this.success({name:"取消关注成功!"});
               break;
               default:
               return this.fail("缺少参数!")
           }
           //console.log('focus end');
       }

    //管理员推荐主题
    async ajaxrecommendAction(){
      //前台登录验证
      await this.weblogin();
      //console.log(this.get("id"));
      let question_id = this.get("id");
      //操作：0取消推荐；1推荐
      let cmd = this.get('cmd');
      if(this.user.is_admin == 1){
        let data={};
        data.id = question_id;
        data.is_recommend = cmd;
        let res = await this.model('question').where({id:question_id}).updates(data)
        if (res) {
            //行为记录
            //if (res.data.id) {
                //添加操作日志，可根据需求后台设置日志类型。
                await this.model("action").log("recommendquestion", "question", res.id, this.user.uid, this.ip(), this.http.url);
                //首页热门推荐，则添加到hot_recommend表

                let recommendres = await this.model("hot_recommend").where({topic_id:data.id,topic_type:2}).find();
                ////console.log(recommendres.id);
                if(think.isEmpty(recommendres.id) && cmd==1 ){
                    let questionInfo = await this.model('question').where({id:question_id}).find()
                    ////console.log(questionInfo);
                    if(!think.isEmpty(questionInfo)){
                        let hotrecommend ={};
                        hotrecommend.topic_id = questionInfo.id;
                        hotrecommend.title = questionInfo.title;
                        hotrecommend.cover_id = questionInfo.cover_id;
                        hotrecommend.topic_type = 2;
                        hotrecommend.category_id = questionInfo.category_id;
                        hotrecommend.level = questionInfo.level;
                        hotrecommend.add_time = new Date().getTime();
                        ////console.log(hotrecommend);
                        await this.model("hot_recommend").add(hotrecommend);
                    }
                    
                }else{
                    //如果已推荐，且取消推荐，则删除
                    if(!think.isEmpty(recommendres.id) && cmd ==0 ){
                        await this.model("hot_recommend").where({topic_id:data.id}).delete();
                    }
                }

                this.success({name: "操作成功"});
            //}
        } else{
            return this.fail("操作失败！");
        }

      }
    }

    //获取评论
    async ajaxanswercommentsAction(){
        let answer_id = this.get("answer_id");
        //let comments =
        let comments = await this.model("question_answer_comments").where({answer_id:answer_id}).select();
        for(let c of comments){
            c.username = await get_nickname(c.uid);
            c.time = moment(c.time).fromNow()
        }
        //判断是不是超级管理员
        let is_admin =false;
        if(this.is_login){
            is_admin=in_array(parseInt(this.user.uid), this.config('user_administrator'));
        }
        this.json({data:comments,is_login:this.is_login,is_admin:is_admin});
    }
    //发表评论
    async ajaxanswercommentspostAction(){
        //前端验证登录
        await this.weblogin();

        let data = this.post();
        data.uid = this.user.uid;
        data.time = new Date().getTime();
        let add = await this.model("question_answer_comments").add(data);
        if(add){
            return this.success({name:"评论成功!"});
        }else {
            return this.fail("评论失败！")
        }
    }
    //编辑回复
    async editanswerAction(){
        //前端登录验证
        await this.weblogin();
        let answer_id = this.get("id");
        let answer = await this.model("question_answer").where({answer_id:answer_id}).find();
        //后台管理员跳过验证
        if(!in_array(parseInt(this.user.uid), this.config('user_administrator')) && !in_array(parseInt(this.user.uid), this.config('user_editor'))){
            //await this.c_verify("edit");
            //安全判断
            if(answer.uid !=this.user.uid){
                this.http.error = new Error('你不能编辑，不属于自己的东西！');
                return think.statusAction(702, this.http);
            }
        }
        this.assign("answer",answer);
        //pc
        return this.modtemp();

    }
    async delanswerAction(){
        //前端登录验证
        await this.weblogin();
        let answer_id = this.get("id");
        let answer = await this.model("question_answer").where({answer_id:answer_id}).find();
        //后台管理员跳过验证
        if(!in_array(parseInt(this.user.uid), this.config('user_administrator')) && !in_array(parseInt(this.user.uid), this.config('user_editor'))){
            //await this.c_verify("edit");
            //安全判断
            if(answer.uid !=this.user.uid){
                this.http.error = new Error('你不能编辑，不属于自己的东西！');
                return think.statusAction(702, this.http);
            }
        }
        //删除相关回复
        await this.model("question_answer").where({answer_id:answer_id}).delete();
        //删除相关的回复评论
        await this.model("question_answer_comments").where({answer_id:answer_id}).delete();
        //删除统计
        await this.model("question").where({id:this.get("qid")}).decrement("answer_count",1);
        return this.success({name:"删除成功!"})
    }
    async delcommentsAction(){
        //前端登录验证
        await this.weblogin();
        let id = this.get("id");
        let comments = await this.model("question_answer_comments").where({id:id}).find();
        //后台管理员跳过验证
        if(!in_array(parseInt(this.user.uid), this.config('user_administrator')) && !in_array(parseInt(this.user.uid), this.config('user_editor'))){
            //await this.c_verify("edit");
            //安全判断
            if(comments.uid !=this.user.uid){
                this.http.error = new Error('你不能编辑，不属于自己的东西！');
                return think.statusAction(702, this.http);
            }
        }
        //删除相关的回复评论
        await this.model("question_answer_comments").where({id:id}).delete();
        return this.success({name:"删除成功!"})
    }
}