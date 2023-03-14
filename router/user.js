const express = require('express')
const router = express.Router()
const users_model = require('../model/users')
const roles_model = require('../model/roles')
const menuCatalog_model = require('../model/menu_catalog')
const menuItem_model = require('../model/menu_item')
const permission_btns = require('../model/permission_btns')
let { getMenusChildren } = require('../utils/common')
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

// 菜单权限
router.post('/menu_authority',async(req,res,next) => {
    let { username } = req.auth
    let roleId = await new Promise((resolve) => {
        users_model.findOne({username},(err,doc) => {
            if(!doc.roleId) { 
                let error = new Error('该用户未分配角色，请联系管理员')
                error.code = 401
                return next(error)
             }
            resolve(doc.roleId)
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
    let Menu_item = await menuItem_model.find({_id:{ $in: authority }}).sort({'meta.sort':-1})
    let permission = await permission_btns.find({_id:{ $in: authority },hidden: false}).select({'path':1}).sort({'sort': -1})
        menuCatalog_model.find({_id:{ $in: authority }}).sort({'meta.sort':-1}).then(docs => {
        let authorityMenus = getMenusChildren(JSON.parse(JSON.stringify(docs)),JSON.parse(JSON.stringify(Menu_item)),docs.length)
        res.send({
            code:200,
            data:authorityMenus,
            permission
        })
    })
})

// 上传用户头像
router.post('/uploadAvatar',(req,res) => {
    let { username } = req.auth
    let { avatar } = req.body
    new Promise((resolve) => {
        users_model.findOneAndUpdate({ // 数据库更新avatar
            username
        },{
            avatar
        },{returnDocument: 'after'},(err, doc) => { // returnDocument: after 返回更新之后的文档
            if(err) throw new Error(err)
            resolve(doc)
        })
    }).then((doc) => {
        res.send({code:200, message:'修改头像成功', data:doc})
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