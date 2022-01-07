Dingtalk Client（钉钉Open Api Node.js SDK轻量版）
---

## 使用方法
> 下面以钉钉扫码免登第三方网站为例


```javascript
// 钉钉免登Demo：首页
router.get('/scan-login-demo-tmp', function(req, res, next) {
    let appId = '<替换成你的钉钉微应用App Key>';
    let callback_site_url = '<替换成你的回调地址，授权完成后会携带authCode跳转过去>';

    // 重定向到授权页
    let redirect_uri = encodeURIComponent(`${callback_site_url}`);
    let base_url = 'https://login.dingtalk.com/oauth2/auth';
    res.redirect(`${base_url}?redirect_uri=${redirect_uri}&response_type=code&client_id=${appId}&scope=openid&prompt=consent`);
});

// 钉钉免登Demo：回调
router.get('/scan-login-demo', function(req, res, next) {

    // Step 1：参考如下文档，获取当前登录用户的授权Token
    // 文档：https://open.dingtalk.com/document/orgapp-server/obtain-user-token
    DingtalkClient.request({
        path:'/v1.0/oauth2/userAccessToken',
        method:'POST',
        body:{
            clientId:'<替换成你的钉钉微应用App Key>',
            clientSecret: '<替换成你的钉钉微应用App Secret>',
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
```
