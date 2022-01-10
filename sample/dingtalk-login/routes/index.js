var express = require('express');
var router = express.Router();
let request = require('request');

// 钉钉Open Api的访问工具
// github: https://github.com/zxlie/dingtalk-client
let DingtalkClient = {
    /**
     * 钉钉Open API的统一调用入口
     * @param {object} configs 请求配置
     * @p-config {boolean}  isOldApi 是否老版本接口，默认 false
     * @p-config {string}   method   请求方式，GET或者POST
     * @p-config {string}   path     接口地址，如：/v1.0/sso/getToken
     * @p-config {object}   params   需要在接口地址上进行URL拼接的参数
     * @p-config {object}   body     请求方式为POST时，指定提交的内容
     * @p-config {object}   headers  请求头
     * @p-config {function} callback 请求结果的处理回调：function(error,data)
     * @returns  {promise}  返回一个Promise对象
     **/
    request : function(configs) {
        var url = ((isOldApi, path, params) => {
            let _hostConfig = {
                topHost: 'https://oapi.dingtalk.com', // 老版API
                popHost: 'https://api.dingtalk.com'   // 新版API
            };
            let oUrl = new URL((isOldApi ? _hostConfig.topHost : _hostConfig.popHost) + path);

            if (Object.keys(params || {}).length > 0) {
                Object.keys(params, key => oUrl.searchParams.append(key,params[key]));
            }
            return oUrl.toString();
        })(configs.isOldApi, configs.path, configs.params);
        var obj = {
            method:  (configs.method || 'GET').toUpperCase(),
            url: url,
            json: true
        };
        if(obj.method === 'POST' && configs.body) {
            obj.body = configs.body;
        }
        if(configs.headers) {
            obj.headers = configs.headers;
        }
        return new Promise((resolve,reject) => {
            request(obj, (err, response, body) => {
                resolve(body);
            });
        });
    }
};

/* show index page. */
router.get('/', function(req, res, next) {
  res.send('<a href="/entry-for-dingtalk" target="_blank">点击这里测试钉钉免登</a>');
});

// 扫码免登Demo入口页，完整的访问路径：http://127.0.0.1:3000/entry-for-dingtalk
router.get('/entry-for-dingtalk', function(req, res, next) {
    let clientId = '<这里替换成你自己应用的App Key>';
    let site = 'http://127.0.0.1:3000';

    // 重定向到授权页
    let redirect_uri = encodeURIComponent(`${site}/callback-for-dingtalk`);
    let base_url = 'https://login.dingtalk.com/oauth2/auth';
    res.redirect(base_url + "?redirect_uri=" + redirect_uri + "&client_id=" + clientId
                + "&response_type=code&scope=openid&prompt=consent");
});

// 扫码免登Demo回调，完整的访问路径：http://127.0.0.1:3000/callback-for-dingtalk
router.get('/callback-for-dingtalk', function(req, res, next) {

    // Step 1：参考如下文档，获取当前登录用户的授权Token
    // 文档：https://open.dingtalk.com/document/orgapp-server/obtain-user-token
    DingtalkClient.request({
        path:'/v1.0/oauth2/userAccessToken',
        method:'POST',
        body:{
            clientId:'<这里替换成你自己应用的App Key>',
            clientSecret: '<这里替换成你自己应用的App Secret>',
            code:req.query.authCode,
            grantType:'authorization_code'
        }
    }).then(data => {
        // Step 2：参考如下文档，获取当前登录用户的个人信息
        // 文档：https://open.dingtalk.com/document/orgapp-server/dingtalk-retrieve-user-information
        return DingtalkClient.request({
            path:'/v1.0/contact/users/me',
            headers: {
                'x-acs-dingtalk-access-token': data.accessToken
            }
        });
    }).then(data => {
        // Step 3：根据获取到的用户授权信息，做相关业务操作
        res.setHeader("Content-Type", "application/json;charset=utf-8");
        res.end(JSON.stringify({
            message:'下面这些内容就是通过免登获取到的个人详细信息了，如果当前已经有账号登录了，可以直接获取到数据',
            data:data
        },null,4));
    });

});

module.exports = router;
