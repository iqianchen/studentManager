let express = require("express");
let svgCaptcha = require("svg-captcha");
let bodyParser = require('body-parser')
let path = require("path");
var session = require('express-session')

let tools = require("./tools/myTools.js");
let indexRoute = require(path.join(__dirname,"/route/indexRoute.js"))


let app = express();
// 设置静态资源托管
app.use(express.static("static"));
// app.use('/index',indexRoute);
// 使用bodyParser中间件
app.use(bodyParser.urlencoded({ extended: false }))
// 使用session中间件
app.use(session({
    secret: 'keyboard cat',
    // resave: false,
    // saveUninitialized: true,
    // cookie: { secure: true }
}))
// 挂载首页路由
app.use('/index',indexRoute);

app.engine('html', require('express-art-template'));
app.set('views', '../static/views/')

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

// 退出登录
app.get('/logout',(req,res)=>{
    delete req.session.userInfo;
    res.redirect("/login");
})

// 获取验证码
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
        // 使用工具函数查询数据
        tools.find("userList",{userName},(err,doc)=>{
            if(err) console.log(err);
            // console.log(doc);
            if(doc.length == 0){
                // 用户名不存在
                tools.mess(res,"用户名不存在，请重试","/login");
            }else{
                // 验证密码
                if (password == doc[0].password){
                    // 登录成功 跳转页面
                    // 记录用户信息
                    req.session.userInfo = {userName};
                    tools.mess(res,"登录成功","/index")
                }else{
                    tools.mess(res,"密码错误","/login")
                }
            } 
        })
    }else{
        // 验证码错误
        tools.mess(res,"验证码错误，请重试","/login")
    }
})

// 注册逻辑
app.post('/register',(req,res)=>{
    let userName = req.body.userName;
    let password = req.body.password;

    tools.find("userList",{userName},(err,doc)=>{
        if(err) console.log(err);
        //console.log(doc);
        if(doc.length == 0){
            // 用户名不存在
            // 添加数据
            tools.insert('userList',{userName,password},(err,result)=>{
                if (err) console.log(err);
                tools.mess(res,"注册成功","/register")
            })
        }else{
            // 用户名存在
            tools.mess(res,"用户名已存在","/register")
        }
    })

})



app.listen(80,()=>{console.log("successs")})