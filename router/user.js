const express = require('express')
const router = express.Router()
const users_model = require('../model/users')
const roles_model = require('../model/roles')
const menuCatalog_model = require('../model/menu_catalog')
const menuItem_model = require('../model/menu_item')
let { myfilters } = require('../utils/common')
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
    let { page, size, filters } = req.body
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
    let Menu_item = await menuItem_model.find({_id:{ $in: authority }})
    menuCatalog_model.find({_id:{ $in: authority },...myfilters(filters)}).skip((page - 1) * size).limit(size).then(docs => {
        function getMenusChildren(menus, items) { 
            let amenus = []
            let children = []
            for (let i = 0; i < menus.length; i++) {
                if (menus[i].component !== 'Layout' && !menus[i].alwaysShow) {
                    continue
                };
                amenus[i] = menus[i]
                for (let j = 0; j < items.length; j++) {
                    if (menus[i]._id == items[j].pid) {
                        children.push(items[j])
                    }
                }
                if (children.length != 0) {
                    amenus[i].children = children // 将菜单栏进行合并
                    children = getMenusChildren(children, items) // 递归多层级，将子菜单栏进行递归操作判断是否还有下一层
                }
            }
            if(children.length == 0 && amenus.length != menus.length) return children
            return amenus
        }
        let authorityMenus = getMenusChildren(JSON.parse(JSON.stringify(docs)),JSON.parse(JSON.stringify(Menu_item)))
        // docs是引用类型
        res.send({code:200,data:authorityMenus})
    })
    return false
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