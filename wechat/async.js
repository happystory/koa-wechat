const sha1 = require('sha1');

module.exports = function(config) {
    return async (ctx, next) => {

        // 1）将token、timestamp、nonce三个参数进行字典序排序
        // 2）将三个参数字符串拼接成一个字符串进行sha1加密
        // 3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
        const token = config.Token;

        const {signature, timestamp, nonce, echostr} = ctx.query;
        const str = [token, timestamp, nonce].sort().join('');
        const sha = sha1(str);

        if (sha === signature) {
            ctx.body = echostr;
        } else {
            ctx.body = '认证失败';
        }
    }
};
