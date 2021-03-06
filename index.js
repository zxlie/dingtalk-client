/**
 * Dingtalk Open API Nodejs ：钉钉OpenApi的Nodejs版sdk
 * @autho 烈神
 * @date 2022.01.07
 * @github https://github.com/zxlie/dingtalk-client
 */

let request = require('request');

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

        // http request具体参数
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


module.exports = DingtalkClient;
