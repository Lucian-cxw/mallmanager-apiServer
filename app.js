const express = require("express")
const handleDB = require("./db/handleDB")
const cors = require("cors")
const jwt = require('jsonwebtoken');


const app = express()
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

app.post("/login", (req, res) => {
    (async function () {

        // {data,meta:{msg,status}}=res.data  
        let { password, username } = req.body
        // console.log(req.body)
        let users = await handleDB(res, "user", "find", "数据库查询出错", `username='${username}'&&password_hash='${password}'`)
        // console.log(users)
        // token的秘钥
        const jwt_salt = "$kajfgl3$@*ljhblefhbel*"
        const token = jwt.sign({ id: users[0].id, username: users[0].username }, jwt_salt, { expiresIn: 60 * 60 * 1 })
        // console.log(token)
        if (!username || !password) {
            let result = {
                data: {
                    username: "",
                    password: "",
                    mobile: "",
                    email: "",
                    token,
                },
                meta: {
                    msg: "参数错误，请正确填写账号密码",
                    status: 301
                }
            }

            res.send(result)
        }
        if (username == users[0].username && password == users[0].password_hash) {
            let result = {
                data: {
                    username: "admin",
                    password: 123456,
                    mobile: "181xxxxx327",
                    email: "admin@xx.com",
                    id: 1,
                    token, token
                },
                meta: {
                    msg: "登录成功",
                    status: 201
                }

            }
            // console.log(result)  
            res.send(result)
        }
    })()
})

app.get("/users", (req, res) => {
    (async function () {
        // 接受参数
        // pageNum 当前页码 不能为空
        // pageSize 每页显示条数 不能为空
        let { pageNum, pageSize, query } = req.query
        let queryRes = []
        // 用户状态

        // console.log(pageNum, pageSize)
        let start = (pageNum - 1) * pageSize

        let total = []
        // console.log(users)
        //    返回参数
        let result = {}
        // console.log(query) 
        if (query !== "") {
            queryRes = await handleDB(res, "user", "sql", "数据库查询出错", `select * from user where username like '%${query}%' limit ${start},${pageSize}`)
            total = await handleDB(res, "user", "sql", "数据库查询出错", `select count(*) from user where username like '%${query}%'`)
            // console.log( total[0]['count(*)'])
            // console.log(queryRes)
            // queryRes = await handleDB(res, "user", "find", "查询数据库出错", `username like '%${query}%'`)
            result = queryRes
        } else {
            total = await handleDB(res, "user", "sql", "数据库查询出错", "select count(*) from user")
            // console.log( total[0]['count(*)'])
            result = await handleDB(res, "user", "sql", "数据库查询出错", `select * from user limit ${start},${pageSize}`)
            console.log(result)

        }
        res.send({
            data: {
                users: result,
                total: total[0]['count(*)']
            },
            meta: {
                status: 200,
                msg: "获取数据库成功"
            }
        })
    })()
})

// 处理添加用户post请求，后期可以优化，将users 的post和get写在一个接口中
app.post("/users", (req, res) => {
    (async function () {
        // 1获取参数，判空
        // username:"", 
        // password:"",
        // email:"",
        // mobile:""
        let { username, password, email, mobile } = req.body
        // console.log(username,password,email,mobile)
        if (!username || !password || !email || !mobile) {
            console.log("创建失败，请按要求填写信息")
            res.send({
                meta: {
                    msg: "创建失败，请按要求填写信息",
                    status: 000
                }
            })
            return
        }

        // 2查询数据库，是否存在该用户，存在则返回已注册，
        let result = await handleDB(res, "user", "find", "查询数据库出错", `username='${username}'`)
        //    console.log(result[0])
        if (result[0]) {
            console.log("该用户存在，请重新填写信息")
            res.send({
                meta: {
                    msg: "创建失败，该用户存在，请重新填写信息",
                    status: 000
                }
            })
            return
        }

        // 3将用户注册到数据库中
        // 设置创建时间
        let create_time = getcurrentDate()
        let resultInsert = await handleDB(res, "user", "insert", "插入数据失败", { username, password_hash: password, email, mobile, create_time })
        // 4 返回数据
        // console.log(resultInsert.insertId)
        console.log("创建成功")
        res.send({
            meta: {
                msg: "创建成功",
                status: 201
            }
        })
    })()

})

// 该接口可以处理 1删除用户操作，2编辑用户信息
app.all("/users/:id", (req, res) => {
    (async function () {
        if (req.method == "DELETE") {
            console.log(req.params)
            console.log(req.params.id + "参数1")
            // 1获取参数，判空
            let user_id = req.params.id
            if (!user_id) {
                return
            }
            //2 删除数据库记录
            console.log(user_id + "参数2")
            result = await handleDB(res, "user", "delete", "删除用户出错", `id=${user_id}`)
            // console.log(result)

            // 返回数据
            res.send({
                meta: {
                    status: 200,
                    msg: "删除成功llll"
                }
            })
        } else if (req.method == "PUT") {
            // 1获取参数判空，
            let { email, mobile, id } = req.body
            if (!email || !mobile) {
                res.send({
                    meta: {
                        status: 000,
                        msg: "请填写完整信息"
                    }
                })
                return
            }
            // 2更新数据库信息(邮箱和电话)
            let result = await handleDB(res, "user", "update", "更新数据库出错", `id=${id}`, { email, mobile })
            //3 返回数据
            res.send({
                meta: {
                    status: 200,
                    msg: "修改用户信息成功"
                }
            })
        } else if (req.method == "GET") {
            let id = req.params.id
            let ridRes = await handleDB(res, "user", "find", "查询数据库出错", `id=${id}`)
            res.send({
                rid: ridRes[0].rid
            })
        }

    })()

})

app.all("/users/:uId/state/:type", (req, res) => {
    (async function () {
        // 1 获取请求路径中用户id 和state 
        let { url } = req
        let str = url.split("/")
        let id = str[2]
        let mg_state = str[4] == "true" ? Boolean(true) : Boolean() //布尔类型在mysql中为tinyint 类型，当然此处也可以保存为字符串类型
        console.log(url, id, mg_state)
        // 2 更新数据库 的mg_state
        await handleDB(res, "user", "update", "更新数据库出错", `id=${id}`, { mg_state })
        //3 返回数据
        res.send({
            meta: {
                status: 200,
                msg: "获取管理员列表成功"
            }
        })
    })()

})

// 角色请求
app.get("/roles", (req, res) => {
    (async function () {
        let data = await handleDB(res, "roles", "find", "查询数据库出错")
        res.send(data)
    })()

})

app.all('/users/:id/role', (req, res) => {
    (async function () {
        let { body: { rid }, url } = req
        let id = url.split("/")[2]
        if (!rid) {
            res.send({
                meta: {
                    msg: "设置失败",
                    status: 000
                }
            })
            return
        }
        console.log(rid)
        console.log(id)
        await handleDB(res, "user", "update", "更新数据库出错", `id=${id}`, {rid})
        res.send({
            meta: {
                msg: "设置角色成功",
                status: 200
            }
        })
    })()
})

// 时间格式
function getcurrentDate() {
    let d = new Date();
    let y = d.getFullYear();
    let m = d.getMonth() + 1;
    let day = d.getDate();
    let h = d.getHours();
    let min = d.getMinutes();
    let s = d.getSeconds();
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
}
app.listen(3000, () => {
    console.log("正在监听3000端口")
})