const rp = require('request-promise');

const prefix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    upload: prefix + '/media/upload'
};

function Wechat(opts) {
    this.appID = opts.AppID;
    this.appSecret = opts.AppSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.fetchAccessToken();
}

Wechat.prototype.fetchAccessToken = function() {
    let that = this;

    if (this.access_token && this.expires_in) {
        if (this.isValidAccessToken(this)) {
            return Promise.resolve(this);
        }
    }

    this
        .getAccessToken() // 获取票据
        .then((data) => {

            // 解析票据中的信息
            try {
                data = JSON.parse(data);
            } catch(e) {
                return that.updateAccessToken();
            }

            // 检测票据是否合法
            if (that.isValidAccessToken(data)) {
                return Promise.resolve(data);
            } else {
                return that.updateAccessToken();
            }
        })
        .then((data) => {
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;

            // 保存票据
            that.saveAccessToken(data);
        });
};

Wechat.prototype.isValidAccessToken = function(data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false;
    }

    let access_token = data.access_token;
    let expires_in = data.expires_in;

    // 当前时间应小于票据过期时间
    return Date.now() - expires_in;
};

Wechat.prototype.updateAccessToken = function() {
    let appID = this.appID;
    let appSecret = this.appSecret;
    let uri = api.accessToken + `&appid=${appID}&secret=${appSecret}`;

    return new Promise(function(resolve, reject) {
        let options = {
            uri: uri,
            json: true // 解析JSON字符串
        };

        // 参考文档：https://www.npmjs.com/package/request-promise
        rp(options)
            .then((response) => {
                // response 结构
                // {
                //    access_token: 'xxx',
                //    expires_in: 7200
                // }

                // 提前20秒更新
                response.expires_in = Date.now() + (response.expires_in - 20) * 1000;
                resolve(response);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

module.exports = Wechat;