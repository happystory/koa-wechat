const sha1 = require('sha1');
const contentType = require('content-type');
const getRawBody = require('raw-body');

const Wechat = require('./wechat');
const util = require('./util');

module.exports = function(config) {
    let wechat = new Wechat(config);

    return async (ctx, next) => {

        // 1）将token、timestamp、nonce三个参数进行字典序排序
        // 2）将三个参数字符串拼接成一个字符串进行sha1加密
        // 3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
        let token = config.Token;

        let {signature, timestamp, nonce, echostr} = ctx.query;
        let str = [token, timestamp, nonce].sort().join('');
        let sha = sha1(str);

        // 验证身份
        if (sha !== signature) {
            return ctx.body = {
                errno: -1,
                msg: 'authorization failed'
            }
        }

        // https://www.npmjs.com/package/raw-body
        let data = await getRawBody(ctx.req, {
            length: ctx.req.headers['content-length'],
            limit: '1mb',
            encoding: contentType.parse(ctx.req).parameters.charset
        });

        let xml = data.toString();

        // 解析xml
        let content = await util.parseXMLAsync(xml);
        console.log(content);

        // 扁平化
        let message = util.formatMessage(content.xml);
        console.log(message);

        if (ctx.method === 'GET') {
            ctx.body = echostr;
        } else if (ctx.method === 'POST') {

            // 关注后自动回复
            if (message.MsgType === 'event') {
                if (message.Event === 'subscribe') {
                    let now = Date.now();
                    ctx.type = 'application/xml';
                    ctx.body = `<xml>
                        <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                        <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                        <CreateTime>${now}</CreateTime>
                        <MsgType><![CDATA[text]]></MsgType>
                        <Content><![CDATA[感谢您的关注！]]></Content>
                        </xml>`;
                }
            }
        }
    }
};
