Dingtalk Client（钉钉Open Api Node.js SDK轻量版）
---
* 项目示例
具体的代码示例，可以参考【sample/dingtalk-login】：为Web站点接入钉钉账号授权体系

* 使用方法
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

---

# 为你的Web站点接入钉钉账号免登体系

[TOC]

原文链接：https://www.baidufe.com/item/cef37b31533d28a2478f.html


## 一、预期效果
进入站点/打开页面，直接进入钉钉账号授权登录流程，用户`【同意】`后直接获取到登录者身份信息
![1.png](http://www.baidufe.com/upload/images/2022-01-12_14-23-46_7.png)


## 二、适用对象

* `PC站点` ：通过桌面端浏览器访问的网站
* `H5站点` ：通过手机端扫码、或点击链接访问的网站

## 三、适用场景

* `场景一`：<u>**社区型产品、论坛、博客、或其他开放性Web站点，需要在登录用户之间形成互动性**</u>
	* **Before**：传统的做法是做一套账号系统，提供注册流程，然后再登录使用
	* **After**：接入钉钉账号授权体系，可不用繁琐注册、直接免登（可账密、可扫码）
* `场景二`：<u>**政府机构、酒店大堂、药房门店等，需要访客先登记后进入**</u>
	* **Before**：纸笔登记，然后酌情录入访客系统
	* **After**：钉钉扫码，手机上一键快速登记（接入钉钉账号授权体系即可）
* `场景三`：<u>**企业内部系统，不想对接繁琐的iDaaS，但又需要记录和识别访问者的身份**</u>
    * **Before**：建设简单的账号管理体系，提供内部账号注册流程，登录可用
    * **After**：对接钉钉账号授权体系，一键免登快速进入（可账密、可扫码）

## 四、所需接口

* 获得钉钉授权免登的`跳转链接`：https://open.dingtalk.com/document/orgapp-server/use-dingtalk-account-to-log-on-to-third-party-websites-1
* 根据临时授权码，获取用户授权的`AccessToken`：https://open.dingtalk.com/document/orgapp-server/obtain-user-token
* 根据用户AccessToken，获取`用户信息`：https://open.dingtalk.com/document/orgapp-server/dingtalk-retrieve-user-information

## 五、接入流程
> 本文尝试从`初级/小白开发者`的角度来写，尽可能细、尽可能直白

### 5.1 准备工作

* `成为钉钉开发者`，具体可参考这里的文档 https://open.dingtalk.com/document/org/become-a-dingtalk-developer <u>_（有了开发者权限，就可以到钉钉开发者后台创建应用了）_</u>
* `准备好本地开发环境`，Java、PHP、Node.js、Python、C#均可；只要是标准的Web应用开发环境即可，没什么特殊的 <u>_（这里都不需要管SDK的事儿，开发过程中遇到了再引入，一点都不晚）_</u>

### 5.2 创建应用

* `1、`登录钉钉开发者后台 <u>_（请确保前面5.1中的准备工作已经完成）_</u>
* `2、`顶部导航栏选择**【应用开发->企业内部开发】**，页面右上角按钮选择`【创建应用】`

![2.png](http://www.baidufe.com/upload/images/2022-01-12_14-24-42_5.png)

* `3、`在应用创建的弹层中，填写关键信息，最后`【确定创建】`
    * **应用类型**：选择H5微应用
	* **开发方式**：选择企业自主开发
	* **应用名称**：酌情自定义即可，假定这里起名为「扫码免登」
* `4、`创建好应用以后，就可以获取到应用的`AppKey`和`AppSecret` 了，可以说，**这俩东西组合起来就是钉钉开放接口的访问凭证了**


![3.png](http://www.baidufe.com/upload/images/2022-01-12_14-26-20_2.png)



### 5.3 申请接口

* `1、`进入应用的开发配置界面，左侧菜单中找到`【权限管理】`
* `2、`右侧权限配置界面中，`【权限范围】`默认选择**全部员工**，下方接口列表内切换到`【个人权限】`，右侧勾选如下两个权限点：
	* 通讯录个人信息读权限
    * 个人手机号信息
    * _备注：如果还想通过授权获得更多个人信息，酌情申请其他权限点即可_

![4.png](http://www.baidufe.com/upload/images/2022-01-12_14-26-57_6.png)


### 5.4 配置回调

> 在钉钉授权登录页面，用户点击`【同意】`后，页面会跳转回到用户自己的系统，并且此时会携带一个`authCode`即**临时授权码**，此处需要配置的，就是这个回调的地址

* `1、`进入应用的开发配置界面，左侧菜单中找到`【登录与分享】`
* `2、`在右侧回调域名处填写你未来需要接收临时授权码的`Web URL`，此处假定为本地服务：http://127.0.0.1:3000/callback-for-dingtalk

![5.png](http://www.baidufe.com/upload/images/2022-01-12_14-28-06_2.png)


备注： 这里的回调域名可以添加多个，可以分别用于本地开发、预发环境、线上生成环境，甚至供多个Web站点使用（酌情设定）

### 5.5 开始开发

开发语言不限，目前钉钉的SDK也支持多种语言覆盖，包括Java、PHP、C#、Python、Node.js、Go，酌情选择自己最熟悉的即可。
<u>不过个人感觉，开放平台的本质都是OpenAPI的访问，就是往一个开放接口传参提交数据并获得结果，没啥特别的，所以用不用SDK问题都不是太大</u>

* `1、创建项目`：以下以Node.js项目 为例，用Express框架快速初始化一个Web项目

```bash
# 在命令行通过下面几行代码初始化你的Web项目

# 创建项目
mkdir dingtalk-login && cd dingtalk-login
# 初始化，持续回车键即可
npm init
# 安装express：快捷创建web项目很酸爽
npm install --save express express-generator

# 通过express命令行在当前目录下初始化项目
./node_modules/express-generator/bin/express-cli.js -ef .

# ps：在启动服务之前，可能有些nodejs依赖包还需要安装一下，不妨再install一次
npm install

# 启动服务，然后就可以去浏览器输入地址访问了：http://127.0.0.1:3000
./bin/www
```

* `2、在文件routes/index.js中开始写主程序代码`（意思就是未来通过 https://127.0.0.1:3000/* 进行访问）；核心代码就两部分，一个入口，一个回调：
* `a、入口部分`，假定命名为**/entry-for-dingtalk** ，即未来通过 http://127.0.0.1:3000/entry-for-dingtalk 访问

```js    
// 改写这个首页的内容，加一个测试的链接
router.get('/', function(req, res, next) {
  // 页面默认显示一个钉钉免登的链接，点击以后会跳转到下面的router中
  res.send('<a href="/entry-for-dingtalk" target="_blank">点击这里测试钉钉免登</a>');
});

// 扫码免登Demo入口页，完整的访问路径：http://127.0.0.1:3000/entry-for-dingtalk
router.get('/entry-for-dingtalk', function(req, res, next) {
    let clientId = '<这里替换成你自己应用的App Key>';
    let site = 'http://127.0.0.1:3000';

    // 重定向到授权页
    let redirect_uri = encodeURIComponent(`${site}/demo/scan-login-demo`);
    let base_url = 'https://login.dingtalk.com/oauth2/auth';

      // 直接跳转到钉钉授权界面
    res.redirect(base_url + "?redirect_uri=" + redirect_uri + "&client_id=" + clientId
                + "&response_type=code&scope=openid&prompt=consent");
});
```

备注：`App Key` 从什么地方获取，在前面5.2章节中已经有介绍，自行查看，点击复制即可

* `b、回调部分`，必须与5.4中配置的回调地址保持一致，**/callback-for-dingtalk**，即未来通过http://127.0.0.1:3000/callback-for-dingtalk 访问

```js
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

备注：你可能注意到了上门示例代码中的`DingtalkClient.request` ，不知道这是什么，这实际上是钉钉OpenApi的简单访问工具，工具定义如下：

```js
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
```

routes/demo.js的完整代码就不重复贴了，点击这里`直接下载`：https://github.com/zxlie/dingtalk-client/blob/master/sample/dingtalk-login/routes/index.js

* `3、安装依赖`：上面示例代码中用到了request 包，所以记得在命令行安装一下依赖：

```bash
# 安装依赖包：request
npm install --save request
至此，所有的开发工作都结束了，可以去测试了
```

### 5.6 开始体验
通过命令行工具，重新进入到项目**dingtalk-login**的目录下，操作如下命令重新启动服务：

```bash
# 启动服务，然后就可以去浏览器输入地址访问了：http://127.0.0.1:3000
./bin/www
```

备注：如果之前你的服务已经启动，记得退出（`Win`：Ctrl+C，`Mac`：control+C）
浏览器访问 http://127.0.0.1:3000 试一下，是不是跑起来了，按步操作扫码，也拿到了当前用户在钉钉上的个人信息。

![6.png](http://www.baidufe.com/upload/images/2022-01-12_14-29-39_0.png)


![7.png](http://www.baidufe.com/upload/images/2022-01-12_14-29-47_7.png)

`BTW`：如果当前电脑上已经登录过钉钉账号，钉钉也是可以帮你自动识别出来的，一键登录即可：

![8.png](http://www.baidufe.com/upload/images/2022-01-12_14-30-32_8.png)


## 六、体验升级

上面的链接 http://127.0.0.1:3000 在PC端浏览器上访问，是没有问题的，`但是如果要在手机端测试这个流程，就不能直接用了`（大家应该都懂的，因为127.0.0.1表示的本机）；解决方案有两种：

* <u>**手机和PC保持在同一局域网内（原理：局域网内可互联）**</u>
    * 获取PC端在局域网下被分配的IP，如 192.168.3.4，Web站点在PC上的服务即可通过链接 http://192.168.3.4:3000 进行访问
    * 在开发者后台，新增【登录与分享】的回调地址，设置为：http://192.168.3.4:3000/callback-for-dingtalk
    * routes/index.js中的/ 路由里，也对应将127.0.0.1替换成新IP
    * 重启Web服务，在PC或者手机上直接访问 http://192.168.3.4:3000 即可体验最新效果
    * BTW：也可以在PC上将连接生成个二维码，用钉钉扫码直接打开，体验更顺滑
* <u>**通过钉钉提供的内网穿透工具来实现（原理：将本地Web服务映射到公网）**</u>
    * 打开命令行工具，执行以下命令，下载并启动内网穿透工具（附工具文档：https://open.dingtalk.com/document/resourcedownload/http-intranet-penetration）

```bash  
# 从Git上下载内网穿透工具
git clone https://github.com/open-dingtalk/pierced.git

# 如果是Windows平台，执行下面的命令
cd cd windows_64 && ding -config=ding.cfg -subdomain=abc 3000

# 如果是Mac平台，执行下面的命令
cd mac_64 && chmod 777 ./ding && ./ding -config=./ding.cfg -subdomain=abc 3000
```

注意：上面`-subdomain=abc` 里的`abc`是需要替换成你自己的域名标识的，你希望它叫啥就叫啥**（请酌情起名字）**

* 在开发者后台，新增【登录与分享】的回调地址，设置为：http://abc.vaiwan.com/callback-for-dingtalk
* routes/index.js中的/ 路由里，也对应将127.0.0.1替换成新的公网域名abc.vaiwan.com
* 重启Web服务，在PC或者手机上直接访问 http://abc.vaiwan.com 即可体验最新效果
* BTW-1：也可以在PC上将连接生成个二维码，用钉钉扫码直接打开，体验更顺滑
* BTW-2：现在把 http://abc.vaiwan.com 发给你的其他同事或朋友，他们也可以访问了（内网穿透的surprise~）

## 七、下载Sample
* 从Github下载示例代码

```bash
# 下载代码
git clone https://github.com/zxlie/dingtalk-client.git

# 进入Sample目录
cd dingtalk-client/sample/dingtalk-login

# 安装npm包依赖
npm install
```

* 替换入口文件**routes/index.js**里的`App Key` 和`App Secret` （注意，这里不要忘记了前面5.1中提到的准备工作）
	* 创建应用，获得AppKey和AppSecret（参考5.2章节）
    * 申请接口权限（参考5.3章节）
    * 配置回调地址（参考5.4章节）
* 启动服务，开始体验

```bash
# 启动服务，然后就可以到浏览器里去访问了，http://127.0.0.1:3000
./bin/www
```
---

And, Enjoy~~~
