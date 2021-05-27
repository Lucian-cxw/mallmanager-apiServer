const express=require("express")
const cors= require("cors")


const app=express()
app.use(cors())
app.use(express.json());


app.post("/login",(req,res)=>{
    // {data,meta:{msg,status}}=res.data  
    let {password,username}=req.body
    console.log(req.body)
  
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

app.listen(3000,()=>{
    console.log("正在监听3000端口")
})