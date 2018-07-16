let express = require("express");
let svgCaptcha = require("svg-captcha");
let bodyParser = require('body-parser')
let path = require("path");
var session = require('express-session')
const MongoClient = require('mongodb').MongoClient;

// mongodb需要的url和库名
const url = 'mongodb://localhost:27017';
const dbName = 'test';

let app = express();
// 设置静态资源托管
app.use(express.static("static"));
// 使用bodyParser中间件
app.use(bodyParser.urlencoded({ extended: false }))
// 使用session中间件
app.use(session({
    secret: 'keyboard cat',
    // resave: false,
    // saveUninitialized: true,
    // cookie: { secure: true }
}))

// 读取登录页面
app.get('/login',(req,res)=>{
    // console.log(req);
    res.sendFile(path.join(__dirname,"/static/views/login.html"))
})

// 读取注册页面
app.get("/register",(req,res)=>{
    res.sendFile(path.join(__dirname,"/static/views/register.html"))
})

// 读取新增页面
app.get("/update",(req,res)=>{
    res.sendFile(path.join(__dirname,"/static/views/update.html"))
})

// 读取登录页
app.get("/index",(req,res)=>{
    if (req.session.userInfo){
        res.sendFile(path.join(__dirname,"/static/views/index.html"))
    }else{
        res.setHeader('content-type','text/html');
        res.send("<script>alert('请先登录');window.location='/login'</script>")
    }
})

// 退出登录
app.get('/logout',(req,res)=>{
    delete req.session.userInfo;
    res.redirect("/login");
})

app.get("/login/captchaImg",(req,res)=>{
    var captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;  
    // console.log(captcha.text)
    res.type('svg');
    res.status(200).send(captcha.data);
})

// 登录逻辑
app.post("/login",(req,res)=>{
    // 接受数据
    let userName = req.body.userName;
    let password = req.body.password;
    let code = req.body.code;
    // console.log(userName+"--"+password+"--"+code)
    let captcha = req.session.captcha.toLocaleLowerCase()
    console.log(captcha)
    if (code == captcha){
        // 验证码正确
        // 连接数据库
        MongoClient.connect(url, function(err, client) {           
            const db = client.db(dbName);
           let collection = db.collection("userList")
           collection.find({userName}).toArray((err,doc)=>{
               if(err) console.log(err);
                //console.log(doc);
                if(doc.length == 0){
                    // 用户名不存在
                    res.setHeader('content-type','text/html');
                    res.send("<script>alert('用户名不存在，请重试');window.location='/login'</script>")
                    // 关闭数据库连接即可
                    // client.close();
                }else{
                    // 验证密码
                    // console.log(doc[0].password)
                    if (password == doc[0].password){
                        // 登录成功 跳转页面
                        // 记录用户信息
                        req.session.userInfo = "true";
                        res.setHeader('content-type','text/html');
                        res.send("<script>alert('登录成功');window.location='/index'</script>")
                    }else{
                        res.setHeader('content-type','text/html');
                        res.send("<script>alert('密码错误');window.location='/login'</script>")
                    }
                }
                // 关闭数据库
                client.close();
           })
        });
    }else{
        // 验证码错误
        res.setHeader('content-type','text/html');
        res.send("<script>alert('验证码错误，请重试');window.location='/login'</script>")
        // 关闭数据库连接即可
        client.close();
    }
})

// 注册逻辑
app.post('/register',(req,res)=>{
    let userName = req.body.userName;
    let password = req.body.password;


    MongoClient.connect(url, function(err, client) {           
       const db = client.db(dbName);
       let collection = db.collection("userList")
       collection.find({userName}).toArray((err,doc)=>{
           if(err) console.log(err);
            //console.log(doc);
            if(doc.length == 0){
                // 用户名不存在
                // 添加数据
                collection.insertOne({
                    userName,
                    password
                },(err,result)=>{
                    if (err) console.log(err);
                    // 注册成功
                    // 关闭数据库
                    client.close();
                    res.redirect("/login")
                })
            }else{
                // 用户名存在
                res.setHeader('content-type','text/html');
                res.send("<script>alert('用户名已存在');window.location='/register'</script>")
            }
       })
    });

})



app.listen(80,()=>{console.log("successs")})