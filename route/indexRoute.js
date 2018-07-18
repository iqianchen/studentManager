let express = require("express");
let path = require("path");
let indexRoute = express.Router()

// id要使用mongodb.ObjectId这个方法进行包装，才能使用
let objectID = require('mongodb').ObjectId;
let tools = require(path.join(__dirname,"../tools/myTools.js"))



// 读取登录页
indexRoute.get("/",(req,res)=>{
    if (req.session.userInfo){
        let userName = req.session.userInfo.userName;
        // res.sendFile(path.join(__dirname,"../static/views/index.html"))
        res.render(path.join(__dirname,'../static/views/index.html'), {
            userName
        });
    }else{
        tools.mess(res,"请先登录","/login");
    }
})


// ------------------ 接口 -----------------------
// 增
indexRoute.get("/insert",(req,res)=>{
    tools.insert('students',req.query,(err,result)=>{
        if (!err) res.json({
            mess: "新增成功",
            code: 200
        })

    })
})

// 查所有
indexRoute.get("/search",(req,res)=>{
    tools.find('students',{},(err,docs)=>{
        if (!err) res.json({
            data: docs
        })
    })
})

// 查单个
indexRoute.get('/searchOne',(req,res)=>{
    let query = {};
    // 有用户名过来
    if (req.query.userName){
        query.userName = new RegExp(req.query.userName);
    }
    // 有id过来
    if (req.query.id){
        query._id = objectID(req.query.id);
    }
    tools.find('students',query,(err,docs)=>{
        if (!err) res.json({
            data: docs
        })
    })
})

// 删
indexRoute.get("/delete",(req,res)=>{
    let id = req.query.id;
    tools.delete('students',{_id:objectID(id)},(err,result)=>{
        if (!err) res.json({
            mess: "删除成功",
            code: 200
        })
    })
})

// 改
indexRoute.get("/update",(req,res)=>{
    let userName = req.query.userName;
    let age = req.query.age;
    let gender = req.query.gender;
    let phone = req.query.phone;
    let address = req.query.address;
    let intro = req.query.intro;
    tools.update('students',{_id:objectID(req.query.id)},{
        userName,
        age,
        gender,
        phone,
        address,
        intro
    },(err,result)=>{
        if (!err) res.json({
            mess: "修改成功",
            code: 200
        })
    })
})


module.exports = indexRoute;