const express = require('express')
const router = express.Router()
const users_model = require('../../model/users')
const roles_model = require('../../model/roles')
const menuCatalog_model = require('../../model/menu_catalog')
const menuItem_model = require('../../model/menu_item')
const permissionBtns_model = require('../../model/permission_btns')
let { myfilters, getMenusChildren } = require('../../utils/common')

router.post('/menu_Management',async(req,res,next) => {
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
    let Menu_item = await menuItem_model.aggregate([
        { $addFields: { "menuItem_id": { $toString: "$_id" }}},
        { $match: { "menuItem_id": { $in: authority } } },
        {
            $lookup: {
                from: 'permission_btns',
                localField: 'menuItem_id',
                foreignField: 'pid',
                as: 'children',
                pipeline: [
                    { $addFields: { "menuBtn_id": { $toString: "$_id" }}},
                    { $match: { "menuBtn_id": { $in: authority } } },
                ]
            }
        },
    ])
    let count = await menuCatalog_model.find({_id:{ $in: authority },...myfilters(filters)}).count()
    menuCatalog_model.find({_id:{ $in: authority },...myfilters(filters)}).skip((page - 1) * size).limit(size).sort({'meta.sort':-1}).then(docs => {
        let authorityMenus = getMenusChildren(JSON.parse(JSON.stringify(docs)),JSON.parse(JSON.stringify(Menu_item)),docs.length)
        res.send({
            code:200,
            page,
            size,
            total: count,
            data:authorityMenus
        })
    })
})

// 是否可见菜单目录
router.post('/visibleMenu_catalog', (req, res) => {
    let { _id, status } = req.body
    new Promise((resolve) => {
        menuCatalog_model.findOneAndUpdate({
            _id
        }, {
            hidden: status
        }, (err) => {
            if (err) throw new Error(err)
            resolve()
        })
    }).then(() => {
        res.send({ code: 200, message: '更改成功' })
    })
})

// 是否可见菜单
router.post('/visibleMenu_item', (req, res) => {
    let { _id, status } = req.body
    new Promise((resolve) => {
        menuItem_model.findOneAndUpdate({
            _id
        }, {
            hidden: status
        }, (err) => {
            if (err) throw new Error(err)
            resolve()
        })
    }).then(() => {
        res.send({ code: 200, message: '更改成功' })
    })
})

// 是否可见按钮
router.post('/visibleMenu_btn', (req, res) => {
    let { _id, status } = req.body
    new Promise((resolve) => {
        permissionBtns_model.findOneAndUpdate({
            _id
        }, {
            hidden: status
        }, (err) => {
            if (err) throw new Error(err)
            resolve()
        })
    }).then(() => {
        res.send({ code: 200, message: '更改成功' })
    })
})

// 添加主菜单
router.post('/addRouter_catalog', (req, res) => {
    new menuCatalog_model({
        ...req.body
    }).save((err) => {
        if (err) { throw new Error(err) }
        res.send({ code: 200, message: '添加成功' })
    })
})

// 添加子菜单
router.post('/addRouter_item', (req, res) => {
    new menuItem_model({
        ...req.body
    }).save((err) => {
        if (err) { throw new Error(err) }
        res.send({ code: 200, message: '添加成功' })
    })
})


// 添加按钮
router.post('/addRouter_btn', (req, res) => {
    new permissionBtns_model({
        ...req.body
    }).save((err) => {
        if (err) { throw new Error(err) }
        res.send({ code: 200, message: '添加成功' })
    })
})

// 编辑主菜单
router.post('/editRouter_catalog', (req, res) => {
    let form = req.body
    new Promise((resolve) => {
        menuCatalog_model.findOneAndUpdate({
            _id: form._id
        }, {
            ...form
        }, (err, doc) => {
            if (err) throw new Error(err)
            resolve(doc)
        })
    }).then(doc => {
        res.send({ code: 200, message: '修改成功' })
    })
})

// 编辑子菜单
router.post('/editRouter_item', (req, res) => {
    let form = req.body
    new Promise((resolve) => {
        menuItem_model.findOneAndUpdate({
            _id: form._id
        }, {
            ...form
        }, (err, doc) => {
            if (err) throw new Error(err)
            resolve(doc)
        })
    }).then(doc => {
        res.send({ code: 200, message: '修改成功' })
    })
})

// 编辑按钮
router.post('/editRouter_btn', (req, res) => {
    let form = req.body
    new Promise((resolve) => {
        permissionBtns_model.findOneAndUpdate({
            _id: form._id
        }, {
            ...form
        }, (err, doc) => {
            if (err) throw new Error(err)
            resolve(doc)
        })
    }).then(doc => {
        res.send({ code: 200, message: '修改成功' })
    })
})

// 删除主菜单
router.post('/deleteRouter', async (req, res) => {
    let { menusId } = req.body
    for (let i = 0; i < menusId.length; i++) {
        let key = menusId[i].split('$')
        await new Promise((resolve) => {
            menuCatalog_model.deleteOne({
                _id: key[0],
                path: key[1]
            }, (err, doc) => {
                if (err) throw new Error(err)
                resolve(doc)
            })
        })
        await new Promise((resolve) => {
            menuItem_model.deleteOne({
                _id: key[0],
                path: key[1]
            }, (err, doc) => {
                if (err) throw new Error(err)
                resolve(doc)
            })
        })
        await new Promise((resolve) => {
            permissionBtns_model.deleteOne({
                _id: key[0],
                path: key[1]
            }, (err, doc) => {
                if (err) throw new Error(err)
                resolve(doc)
            })
        })
    }
    res.send({ code: 200, message: '删除成功' })
})



module.exports = router