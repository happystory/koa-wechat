const Koa = require('koa');
const wechat = require('./wechat/async');
const path = require('path');
const wechat_file = path.join(__dirname, './config/wechat.txt');
const util = require('./libs/util');

const config = {
    wechat: {
        AppID: 'wxfbd5cd64b3fc8e4d',
        AppSecret: 'a88097544e4faa1c087fda2fefcec929',
        Token: 'full_stack_engineer',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file, 'utf8');
        },
        saveAccessToken: function(data) {
            return util.writeFileAsync(wechat_file, JSON.stringify(data));
        }
    }
};

const app = new Koa();
app.use(wechat(config.wechat));

app.listen(3000);
console.log('Listening: 3000');

