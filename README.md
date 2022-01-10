Dingtalk Client（钉钉Open Api Node.js SDK轻量版）
---
## 项目示例
具体的代码示例，可以参考【sample/dingtalk-login】：为Web站点接入钉钉账号授权体系

## 使用方法
> 下面以钉钉扫码免登第三方网站为例（示例代码选择 Express 作为web框架）


```javascript
// 扫码免登Demo入口页，完整的访问路径：http://127.0.0.1:3000/entry-for-dingtalk
router.get('/entry-for-dingtalk', function(req, res, next) {
    let clientId = '<这里替换成你自己应用的App Key>';
    let site = site = 'http://127.0.0.1:3000';

    // 重定向到授权页
    let redirect_uri = encodeURIComponent(`${site}/demo/scan-login-demo`);
    let base_url = 'https://login.dingtalk.com/oauth2/auth';

  	// 直接跳转到钉钉授权界面
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
            data:data   // 这里就是拿到的结果了！！
        },null,4));
    });
});
```
