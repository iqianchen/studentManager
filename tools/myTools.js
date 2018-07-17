let express = require("express");
const MongoClient = require('mongodb').MongoClient;

// mongodb需要的url和库名
const url = 'mongodb://localhost:27017';
const dbName = 'test';

module.exports = {
    /**
     * 提示用户的信息并跳转页面
     * @param {response} res 
     * @param {string} message 
     * @param {string} url
     */
    mess(res,message,url){
        res.setHeader('content-type','text/html');
        res.send(`<script>alert('${message}');window.location.href='${url}'</script>`)
    },

    /**
     * 查询数据
     * @param {string} documents 
     * @param {object} query 
     * @param {function} callback 
     */
    find(documents,query,callback){
        // 连接数据库
        MongoClient.connect(url,{ useNewUrlParser: true },(err,client)=>{
            // 连接库名
            let db = client.db(dbName);
            // 在相应的集合里查找数据
            db.collection(documents).find(query).toArray((err,docs)=>{
                // 执行回调函数
                callback(err,docs);
                // 关闭数据库
                client.close();   
            })
        })
    },

    /**
     * 添加数据
     * @param {string} documents 
     * @param {object} doc 
     * @param {function} callback 
     */
    insert(documents,doc,callback){
        MongoClient.connect(url,{ useNewUrlParser: true },(err,client)=>{
            let db =  client.db(dbName);
            db.collection(documents).insertOne(doc,(err,result)=>{
                callback(err,result);
                client.close();
            })
        })
    },

    /**
     * 修改数据
     * @param {string} documents 
     * @param {object} query 
     * @param {object} doc 
     * @param {function} call 
     */
    update(documents,query,doc,callback){
        MongoClient.connect(url,{ useNewUrlParser: true },(err,client)=>{
            let db = client.db(dbName);
            db.collection(documents).updateOne(query,{$set:doc},(err,client)=>{
                callback(err,result);
                client.close();
            })
        })
    },

    /**
     * 删除数据
     * @param {string} documents 
     * @param {object} query 
     * @param {function} callback 
     */
    delete(documents,query,callback){
        Mongoclient.connect(url,{ useNewUrlParser: true },(err,client)=>{
            let db = client.db(dbName);
            db.collection(documents).delectOne(query,(err,resutl)=>{
                callback(err,result);
                client.close();
            })
        })
    }


}

