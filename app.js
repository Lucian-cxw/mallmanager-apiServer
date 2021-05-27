const express=require("express")
const handleDB=require("./db/handleDB")
const cors= require("cors")


const app=express()
app.use(cors())
app.use(express.json());


app.post("/login",(req,res)=>{
    // {data,meta:{msg,status}}=res.data  
    let {password,username}=req.body
    // console.log(req.body)
  
    if(!username||!password){
        let result={
            data:{
                username: "",
                password: "",
                mobile: "",
                email: "",
                rid:"",
                token:""
            },
            meta:{
                msg:"参数错误，请正确填写账号密码",
                status:301
            }
        }
      
        res.send(result)
    }
    if(username=="admin"&&password=="123456"){
    console.log(password,username)

        let result={    
            data:{
                username: "admin",
                password: 123456,
                mobile: "181xxxxx327",
                email: "admin@xx.com",
                id: 1,
                rid:30,
                token:"00000"
            },
            meta:{
                msg:"登录成功",
                status:201
            }
            
        }
        console.log(result)
       
         res.send(result)
    }
       
    
})

app.get("/users",(req,res)=>{
    (async function(){
        // 接受参数
        // pageNum 当前页码 不能为空
        // pageSize 每页显示条数 不能为空
       let {pageNum,pageSize}=req.query
       console.log(req.query)

       console.log(pageNum,pageSize)

       let users= await handleDB(res,"user","sql","数据库查询出错","select username,password_hash,mobile,email,create_time from user") 
       let total= await handleDB(res,"user","sql","数据库查询出错","select count(*) from user") 
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
       console.log(result)
       res.send(result)
    })()
})
app.listen(3000,()=>{
    console.log("正在监听3000端口")
})