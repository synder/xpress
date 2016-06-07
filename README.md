# xpress 


## What is xpress?

- **Api Framework** A node.js api framework base on express which provide api route version and channel control 
- **Web Framework** A node.js web framework base on express and art-templete, and expand many usefull view helper

## Install

   $ npm install xpress
   
## Sample code
> there are two full sample projects in /sample/api and /sample/web

### Run sample project
```
#cd ./sample/api
cd ./sample/web 
npm install 
node app.js
```
    
> open http://127.0.0.1:8001/, there are many template engine(base on artTemplate) view helper sample code
    

## APi    
### create an api server with xpress
```js
//import module
var Xpress = require('Xpress');
var config = require('./config');
```

```js
//create server
var server = new Xpress({
    host: null,
    key: null,
    cert: null,
    port: {
        http: 8001,
        https: null
    }
});
```

```js
//configure
server.conf('x-powered-by', false);
server.conf('trust proxy', true);
server.conf('views', config.public.server.view.path);
server.conf('view engine',config.public.server.view.engine);
server.conf('view cache', false);
server.engine('html', Xpress.engine.__express);
```
```js
//use middleware
var body = require('body-parser');
var cookie = require('cookie-parser');
var timeout = require('connect-timeout');
var compression = require("compression");
var statics = require('express-static');
server.use(compression());
server.use(timeout('20s'));
server.use(cookie());
server.use(body.json());
server.use(body.urlencoded({extended: true}));
server.use(statics(config.public.server.statics.path));
```

```js
//register an api on a controller with version or channel control
//'v' represent version and 'c' represent channel
//if you register an api with version and channel control, 
//you must set 'X-Accept-Version' and 'X-Client-Channel' on request header, 
//xpress will get the two value from the header and compared with the register v and c
//if not equal, xpress will skip the controller and jump to the next controller which has registered the same route
//you can get and set the two headers on Xpress.defaults.versionHeader and Xpress.defaults.channelHeader
server.get('/user', {v:1.0, c: 'ios'}, function(req, res, next){
    res.json({
        users: []
    });
});
//register an api on a controller without version and channel control
server.get('/user/:id', function(req, res, next){
    res.json({
        name: 'synder',
        age : 29
    });
})
```
```js
//create a sub router and register on server
var Router = Xpress.Router;
var productRouter = new Router();
//register an api on subRouter without version or channel control  
productRouter.get('/', function(req, res, next){
    res.json({
        products: []
    });
})
//register an api on subRouter with version or channel control  
productRouter.get('/:id', {v:1, c:1}, function(req, res, next){
    res.json({
        products: []
    });
})
server.sub('/product', productRouter); 
```
```js
//listen on host and port
server.listen(function(message){
    console.log(message);
});
//listen on host and port with cluster
//server.cluster(0, function(msg){
//    console.log(msg);
//});
```
```js
//export
module.exports = server;
```

## view helper
<table cellspacing="0" cellpadding="0">

        <tbody><tr>
            <td>$dateTime(new Date())</td>
            <td>2016年06月07日 11时56分38秒</td>
        </tr>

        <tr>
            <td>$dateTime(Date.now())</td>
            <td>2016年06月07日 11时56分38秒</td>
        </tr>

        <tr>
            <td>Math.random()</td>
            <td>0.035149546630335315</td>
        </tr>

        <tr>
            <td>$toString([1,2,3])</td>
            <td>[1,2,3]</td>
        </tr>

        <tr>
            <td>$parseInt('10', 0)</td>
            <td>10</td>
        </tr>

        <tr>
            <td>$parseInt('NA0122', 0)</td>
            <td>0</td>
        </tr>

        <tr>
            <td>$parseInt('NA0122')</td>
            <td>null</td>
        </tr>

        <tr>
            <td>$parseFloat('12.3')</td>
            <td>12.3</td>
        </tr>

        <tr>
            <td>$parseFloat('a12.3', 0)</td>
            <td>0</td>
        </tr>

        <tr>
            <td>$format('%s %X', 'sam', 1000)</td>
            <td>sam 0x3E8</td>
        </tr>

        <tr>
            <td>$format('%s %o', 'sam', 1000)</td>
            <td>sam 01750</td>
        </tr>

        <tr>
            <td>$format('%s %d', 'sam', 1000)</td>
            <td>sam 1000</td>
        </tr>

        <tr>
            <td>$format('%s %b', 'sam', 1000)</td>
            <td>sam 1111101000</td>
        </tr>

        <tr>
            <td>$format('%c %c', 'sam', 98)</td>
            <td>sam b</td>
        </tr>

        <tr>
            <td>$format('%s %2f', 'sam', 98)</td>
            <td>sam 98.00</td>
        </tr>

        <tr>
            <td>$format('%s %j', 'sam', {name:1})</td>
            <td>sam {"name":1}</td>
        </tr>

        <tr>
            <td>$toString(null)</td>
            <td></td>
        </tr>

        <tr>
            <td>$toString({name: 1})</td>
            <td>{"name":1}</td>
        </tr>

        <tr>
            <td>$toString([12,3])</td>
            <td>[12,3]</td>
        </tr>

        <tr>
            <td>$join('10', '2', '6', '+')</td>
            <td>10+2+6</td>
        </tr>

        <tr>
            <td>$join('10', null, '6', '9', '+')</td>
            <td>10+6+9</td>
        </tr>

        <tr>
            <td>$join(null, null, '6', '+')</td>
            <td>6</td>
        </tr>

        <tr>
            <td>$join(null, '6', '', '+')</td>
            <td>6</td>
        </tr>

        <tr>
            <td>$trim('  name  ')</td>
            <td>name</td>
        </tr>

        <tr>
            <td>$mask('18083489462', '*', 4, 5)</td>
            <td>180*****462</td>
        </tr>

        <tr>
            <td>$mask('18083489462', '*', -1, 5)</td>
            <td>18083******</td>
        </tr>

        <tr>
            <td>$pad('12222', 10, '0', 'left')</td>
            <td>0000012222</td>
        </tr>

        <tr>
            <td>$pad('12222', 10, '0', 'right')</td>
            <td>1222200000</td>
        </tr>

        <tr>
            <td>$clean(' 122 22 ')</td>
            <td>122 22</td>
        </tr>
        <tr>
            <td>$toString($lines('122\r\n22132'))</td>
            <td>[122,22132]</td>
        </tr>
        <tr>
            <td>$toString($lines('122\r22132'))</td>
            <td>[122,22132]</td>
        </tr>
        <tr>
            <td>$truncate('122212313213132132', 13, '...')</td>
            <td>1222123132...</td>
        </tr>
        <tr>
            <td>$chineseCurrency('92102600401.001')</td>
            <td>玖佰贰拾壹亿零贰佰陆拾萬零肆佰零壹</td>
        </tr>
        <tr>
            <td>$currency(242605401.001, '$', 2)</td>
            <td>$242,605,401.00</td>
        </tr>
        <tr>
            <td>$upperCase('AbddessSww')</td>
            <td>ABDDESSSWW</td>
        </tr>
        <tr>
            <td>$lowerCase('AbddessSww')</td>
            <td>abddesssww</td>
        </tr>
        <tr>
            <td>$capitalize('AbddessSww')</td>
            <td>AbddessSww</td>
        </tr>
        <tr>
            <td>$capitalize('AbddessSww', true)</td>
            <td>Abddesssww</td>
        </tr>
        <tr>
            <td>$bankCard('233546454633344332')</td>
            <td>2335 4645 4633 3443 32</td>
        </tr>
        <tr>
            <td>$number(0.5, 3)</td>
            <td>0.500</td>
        </tr>

        <tr>
            <td>$thousands(2783619263)</td>
            <td>2,783,619,263</td>
        </tr>
        <tr>
            <td>$percentage(0.5)</td>
            <td>50%</td>
        </tr>

        <tr>
            <td>$percentage(0.523366, 2)</td>
            <td>52.34%</td>
        </tr>

        <tr>
            <td>$versionPath('/name', 10)</td>
            <td>/name?version=10</td>
        </tr>

        <tr>
            <td>$joinPath('/name', '//age')</td>
            <td>/name/age</td>
        </tr>

        <tr>
            <td>$normalizePath('///name/age')</td>
            <td>/name/age</td>
        </tr>

        <tr>
            <td>$date('2016-06-01T07:05:36.838Z', '-')</td>
            <td>2016-06-01</td>
        </tr>
        <tr>
            <td>$time('2016-06-01T07:05:36.838Z', ':')</td>
            <td>15:05:37</td>
        </tr>
        <tr>
            <td>$dateTime('2016-06-01T07:05:36.838Z', '-', ':')</td>
            <td>2016-06-01 15:05:37</td>
        </tr>
        <tr>
            <td>$dateTime('2016-06-01T07:05:36.838Z')</td>
            <td>2016年06月01日 15时05分37秒</td>
        </tr>
        <tr>
            <td>$urlFormat('/home', {name:1}, 'http', '127.0.0.1')</td>
            <td>http://127.0.0.1/home?name=1</td>
        </tr>
        <tr>
            <td>$urlFormat('/home', {name:1})</td>
            <td>/home?name=1</td>
        </tr>

        <tr>
            <td>$encodeURIComponent('/测试 账号')</td>
            <td>%2F%E6%B5%8B%E8%AF%95%20%E8%B4%A6%E5%8F%B7</td>
        </tr>

        <tr>
            <td>$decodeURIComponent($encodeURIComponent('/测试 账号'))</td>
            <td>/测试 账号</td>
        </tr>

        <tr>
            <td>$encodeURI('/测试 账号')</td>
            <td>/%E6%B5%8B%E8%AF%95%20%E8%B4%A6%E5%8F%B7</td>
        </tr>

        <tr>
            <td>$decodeURI($encodeURI('/测试 账号'))</td>
            <td>/测试 账号</td>
        </tr>

        <tr>
            <td>$isNull(null)</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isNull(undefined)</td>
            <td>false</td>
        </tr>

        <tr>
            <td>$isUndefined(undefined)</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isUndefined(null)</td>
            <td>false</td>
        </tr>

        <tr>
            <td>$isNullOrUndefined(null)</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isNullOrUndefined(undefined)</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isArray([])</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isDate(new Date())</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isDate('2012-03-01')</td>
            <td>false</td>
        </tr>

        <tr>
            <td>$isString('name')</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isString({})</td>
            <td>false</td>
        </tr>

        <tr>
            <td>$isString(null)</td>
            <td>false</td>
        </tr>

        <tr>
            <td>$isNumber(1)</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isBool(true)</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isInt(1.1)</td>
            <td>false</td>
        </tr>

        <tr>
            <td>$isInt(1)</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isFloat(1.1)</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isFloat(1)</td>
            <td>false</td>
        </tr>

        <tr>
            <td>$isObject(null)</td>
            <td>false</td>
        </tr>

        <tr>
            <td>$isObject({})</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isObject([])</td>
            <td>true</td>
        </tr>

        <tr>
            <td>$isDictionary([])</td>
            <td>false</td>
        </tr>

        <tr>
            <td>$isDictionary({})</td>
            <td>true</td>
        </tr>
    </tbody></table>