const express = require('express')
const router = express.Router()
const users_model = require('../model/users')
const menu_model = require('../model/menu')
const roles_model = require('../model/roles')
const menuCatalog_model = require('../model/menu_catalog')
const upload = require('../utils/upload') // 封装multer上传函数
// 获取用户信息
router.get('/',(req,res) => {
    let {username} = req.auth // req.auth 是通过 express-jwt中间件解析而来的
    new Promise((resolve) => {
        users_model.findOne({username},(err,doc) => {
            if(err) { throw new Error(err) }
            resolve(doc)
        })
    }).then(doc => {
        res.send({code:200,user:doc})
    })
})

// 获取菜单栏
router.get('/menu',(req,res) => {
    menu_model.find({}).then(docs => {
        res.send({code:200, data:docs})
    })
})

// 更新菜单栏
router.get('/setMenu',(req,res) => {
    menu_model.findOneAndUpdate({
        _id: '63e7502655de704454f68bc1'
    },{
        children: [{"path": "/system/userManagement",
                "name": "userManagement",
                "component": "/system/userManagement",
                "meta": {
                  "title": "用户管理",
                  "icon": "el-icon-s-custom"
                }
            },{
                "path": "/system/roleManagement",
                "name": "roleManagement",
                "component": "/system/roleManagement",
                "meta": {
                  "title": "角色管理",
                  "icon": "el-icon-s-check"
                }
            }]
    }).then(() => {
        res.send({code:200})
    })
})

// 菜单权限
router.get('/menu_authority',async(req,res,next) => {
    let { username } = req.auth
    let { roleId } = await new Promise((resolve) => {
        users_model.findOne({username},(err,doc) => {
            if(!doc) { 
                let error = new Error('该用户未分配角色，请联系管理员')
                error.code = 401
                return next(error)
             }
            resolve(doc)
        })
    })
    let { authority } = await new Promise((resolve) => {
        roles_model.findOne({_id:roleId},(err,doc) => {
            if(!doc) { 
                let error = new Error('该用户角色不存在，请联系管理员')
                error.code = 401
                return next(error)
             }
            resolve(doc)
        })
    })
    menuCatalog_model.aggregate([
    { $addFields: { "menuCatalog_id": { $toString: "$_id" }}}, // 新增字段，将ObjectId类型转换成Stirng类型后添加字段为 menuCatalog_id
    {
        $lookup: {
            from: 'menu_item',
            localField: 'menuCatalog_id',
            foreignField: 'pid',
            as: 'children'
        }
    },
    ]).then(docs => {
        let newMenus = []
        function authorityMenu(menu) { // 根据 authority 权限数组来判断是否有该路由
            let childrenArr = []
            for(let i = 0; i < menu.length; i++) {
                // 如果路由被authority所包含，并且alwaysShow为false那么则直接获取该路由和该路由的children
                if((authority.includes(`${menu[i]._id}`)) && !(menu[i].alwaysShow == undefined ? true : menu[i].alwaysShow)) {
                    newMenus.push(menu[i])
                    continue
                }
                // 如果路由不被authority所包含，但是always为true那么则将该路由下的children进行一个递归处理
                else if((authority.includes(`${menu[i]._id}`)) || menu[i].alwaysShow) {
                    if(menu[i].children) {
                        menu[i].children = authorityMenu(menu[i].children)
                        if(menu[i].children.length != 0) newMenus.push(menu[i])
                    } else {
                        childrenArr.push(menu[i])
                    }
                }
            }
            return childrenArr
        }
        authorityMenu(JSON.parse(JSON.stringify(docs)))
        res.send({code:200,data:newMenus})
    })
})

// 上传用户图片
router.post('/uploadAvatar',(req,res) => {
    let { username } = req.auth
    upload(req, res).then(async(imgsrc) => {
        await users_model.findOneAndUpdate({ // 数据库更新avatar
            username
        },{
            avatar: imgsrc
        })
        res.send({code:200, imgsrc})
    })
})

// 更改用户基本信息
router.post('/updateUser',(req, res) => {
    let { username } = req.auth
    new Promise((resolve) => {
        users_model.findOneAndUpdate({
            username
        },{ $set: {...req.body}
        },(err, doc) => {
            if(err) throw new Error(err)
            resolve(doc)
        })
    }).then(doc => {
        res.send({code:200, message:'更新用户信息成功'})
    })
})

// 修改用户密码
router.post('/updatePass',(req, res) => {
    let { username } = req.auth
    let { oldPass, confirmPass } = req.body
    new Promise((resolve) => {
        users_model.findOneAndUpdate({
            username,
            password: oldPass
        },{ $set: {password: confirmPass}
        },(err, doc) => {
            if(err) throw new Error(err)
            resolve(doc)
        })
    }).then(doc => {
        res.send({code:200, message:'密码修改成功'})
    })
})

module.exports = router