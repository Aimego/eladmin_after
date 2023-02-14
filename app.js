const express = require('express')
const bodyParser = require('body-parser') // 用于req.body获取
const server = express() // 创建服务器对象
const svgCaptcha = require('svg-captcha') // 加载验证码模块
const jwt = require('jsonwebtoken') // jwtToken获取
const { expressjwt } = require('express-jwt') // express针对的jwtToken验证
const md5 = require('js-md5')
const upload = require('./utils/upload')
const path = require('path')
require('./utils/getNowDate') // 添加Date内置getNowDate方法
// 路由模块
const dashboard_router = require('./router/dashboard.js')
const user_router = require('./router/user.js')
const experiment_router = require('./router/experiment')
const systemTools_router = require('./router/systemTools')
const roleManagement_router = require('./router/system/roleManagement')
const userManagement_router = require('./router/system/userManagement')

const jwtSecret = 'liuhao' // jwt签名
let codeText = '' // 服务器生成的验证码

// mongodb数据库model
const users_model = require('./model/users')
const resource_model = require('./model/resource')

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }));
server.use('/statics/', express.static('./statics/')) // 将statics图片路径替换成文件的相对路径
server.use(express.static(path.join(__dirname, './dist')))

server.use(expressjwt({
    secret: jwtSecret,
    algorithms:['HS256'], // 如果没有更改jwt算法，则默认使用的加密的是hs256算法
    getToken: (req) => {
        if (req.headers.authorization) {
            return req.headers.authorization
          } 
        return null
    }
}).unless({ // 排除的接口地址
    path:['/captcha','/login','/user/setMenu']
}))

server.use((err,req,res,next) => {
    if(err.name === 'UnauthorizedError') {
        return res.send({
            code: 401,
            message:'无效token或token已过期'
        })
    }
    next()
})

server.all("*",(req,res,next) => { // 给所有请求添加上响应请求头(解决跨域)
    res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Headers',"*");
    // res.setHeader('Access-Control-Allow-Methods',"*")
    next()
})

// 路由模块(dashboard接口)
server.use("/dashboard", dashboard_router)
server.use("/user", user_router)
server.use("/experiment", experiment_router)
server.use('/systemTools', systemTools_router)
server.use('/roleManagement',roleManagement_router)
server.use('/userManagement',userManagement_router)

// 获取验证码
server.get('/captcha',(req,res) => {
    let options = {
        height: 38 // 将svg图片高度限制 38px
    }
    let captcha = svgCaptcha.create(options)
    codeText = captcha.text
    res.send({img:captcha.data})
})

// 用户登录login
server.post('/login',(req,res,next) => {
    let reg = new RegExp(`^${codeText}$`,'i')
    let { username, password, code } = req.body
    if(!reg.test(code)) {
        let error = new Error('验证码错误')
        error.code = 401
        return next(error)
    }
    new Promise((resolve,reject) => {
        users_model.findOne({
            username,
            password
        },(err,doc)=> {
            if(err) {
                throw new Error(err)
            }
            else if(doc) {
                if(doc.forbid) {
                    let error = new Error('该用户已被禁用，请联系管理员')
                    error.code = 401
                    return next(error)
                }
                const token = jwt.sign({username,password}, jwtSecret, { expiresIn: '24h' }); // 默认加密算法是 hs256
                resolve({token, user:doc})
            }else {
                let error = new Error('用户名或密码错误')
                error.code = 401
                return next(error)
            }
            reject()
        })
    }).then(myres => {
        res.send(myres)
    })
})

// 上传图片(上传后会自动记录到resource表中)
server.post('/upload',(req,res) => {
    let { username } = req.auth
    upload(req,res).then(({imageurl,file}) => {
        new resource_model({
            originalname: file.originalname,
            imageurl,
            size: `${Math.ceil(file.size / 1024)}KB`,
            filename: file.filename,
            type: file.mimetype,
            createBy: username,
            createTime: (new Date).getNowDate()
        }).save((err) => {
            if(err) { throw new Error(err + '添加文件资源报错') }
            res.send({code:200,imageurl})
        })
    })
})

server.use((err,req,res,next) => {
    res.send({code:err.code || 500, message: err.message});
})

server.listen(8001,() => {
    console.log('服务已启动,8001端口监听中')
})