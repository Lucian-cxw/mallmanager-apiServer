const express=require("express")
const handleDB=require("./db/handleDB")
const cors= require("cors")
const jwt = require('jsonwebtoken');


const app=express()
app.use(cors())
app.use(express.json());

// app.get("/login",(req,res)=>{
//     // token的秘钥
//     const jwt_salt="$kajfgl3$@*ljhblefhbel*"
//     const token=jwt.sign({id:1,username:"admin"},jwt_salt,{expiresIn:60*60*1})
//     res.send({
//         errmsg:"success",
//         errno:"0",
//         reason:"登录请求",
//         result:{
//             token
//         }
//     });
// })

app.post("/login",(req,res)=>{
    (async function(){
        
        // {data,meta:{msg,status}}=res.data  
        let {password,username}=req.body
        // console.log(req.body)
        let users= await handleDB(res,"user","find","数据库查询出错",`username='${username}'&&password_hash='${password}'`) 
        console.log(users)
        // token的秘钥
        const jwt_salt="$kajfgl3$@*ljhblefhbel*"
        const token=jwt.sign({id:users[0].id,username:users[0].username},jwt_salt,{expiresIn:60*60*1})
        console.log(token)
        if(!username||!password){
            let result={
                data:{
                    username: "",
                    password: "",
                    mobile: "",
                    email: "",
                    rid:"",
                    token,
                },
                meta:{
                    msg:"参数错误，请正确填写账号密码",
                    status:301
                }
            }
            
            res.send(result)
        }

        if(username==users[0].username&&password==users[0].password_hash){
            let result={    
                data:{
                    username: "admin",
                    password: 123456,
                    mobile: "181xxxxx327",
                    email: "admin@xx.com",
                    id: 1,
                    rid:30,
                    token,token
                },
                meta:{
                    msg:"登录成功",
                    status:201
                }
                
            }
            // console.log(result)  
                res.send(result)
        }
    })()       
})

app.get("/users",(req,res)=>{
    (async function(){
        // 接受参数
        // pageNum 当前页码 不能为空
        // pageSize 每页显示条数 不能为空
       let {pageNum,pageSize}=req.query
    //    console.log(req.query)

       console.log(pageNum,pageSize)
       let start=(pageNum-1)*pageSize

       let users= await handleDB(res,"user","sql","数据库查询出错",`select username,password_hash,mobile,email,create_time from user limit ${start},${pageSize}`) 
       let total= await handleDB(res,"user","sql","数据库查询出错","select count(*) from user") 
       console.log(users)
    //    返回参数
        let result={
            data:{
                users,
                total:total[0]['count(*)']
            },
            meta:{
                status:200,
                msg:"获取数据库成功"
            }
        }
    //    console.log(result)
       res.send(result)
    })()
})
app.listen(3000,()=>{
    console.log("正在监听3000端口")
})