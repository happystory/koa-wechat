const Koa = require('koa');
const wechat = require('./wechat/async');
const config = {
    wechat: {
        AppID: 'wxfbd5cd64b3fc8e4d',
        AppSecret: 'a88097544e4faa1c087fda2fefcec929',
        Token: 'full_stack_engineer'
    }
};

const app = new Koa();

app.use(wechat(config.wechat));

app.listen(3000);
console.log('Listening: 3000');

