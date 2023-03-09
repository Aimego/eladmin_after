const express = require('express')
const router = express.Router()

const menuCatalog_model = require('../../model/menu_catalog')
const menuItem_model = require('../../model/menu_item')
const roles_model = require('../../model/roles')
let { myfilters } = require('../../utils/common')

// 获取角色菜单权限
router.get('/roles_authority',async(req,res) => {
    let Menu_item = await menuItem_model.find({})
    menuCatalog_model.find({}).then(docs => {
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
        let Menus = getMenusChildren(JSON.parse(JSON.stringify(docs)),JSON.parse(JSON.stringify(Menu_item)))
        res.send({code:200,data:Menus})
    })
    
    // menuCatalog_model.aggregate([
    // { $addFields: { "menuCatalog_id": { $toString: "$_id" }}}, // 新增字段，将ObjectId类型转换成Stirng类型后添加字段为 menuCatalog_id
    // {
    //     $lookup: {
    //         from: 'menu_item',
    //         localField: 'menuCatalog_id',
    //         foreignField: 'pid',
    //         as: 'children'
    //     }
    // }]).then(docs => {
    //     res.send({code:200,data:docs})
    // })
})

// 获取角色列表
router.post('/',async(req,res) => {
    let { page, size, filters } = req.body
    let count = await roles_model.find({...myfilters(filters)}).count()
    roles_model.find({...myfilters(filters)}).skip((page - 1) * size).limit(size).sort({level: 1}).then(docs => {
        res.send({
            code:200,
            data: docs,
            page,
            size,
            total: count
        })
    })
})

// 添加角色
router.post('/addRole',(req,res) => {
    let { username } = req.auth
    new roles_model({
        ...req.body,
        createBy: username,
        createTime: (new Date).getNowDate()
    }).save((err) => {
        if(err) { throw new Error(err) }
        res.send({code:200,message:'添加角色成功'})
    })
})

// 修改角色
router.post('/editRole',(req,res) => {
    let { _id } = req.body
    new Promise((resolve) => {
        roles_model.findOneAndUpdate({
            _id
        },{
            ...req.body
        },(err) => {
            if(err) { throw new Error(err) }
            resolve()
        })
    }).then(() => {
        res.send({code:200, message: '编辑角色成功'})
    })
})

// 删除角色
router.post('/deleteRole',(req,res) => {
    let { roles } = req.body
    function ManyDel() {
        return new Promise(async(resolve) => {
            for(let i = 0; i < roles.length; i++) {
                await new Promise((resolve) => {
                    roles_model.deleteOne({
                        _id: roles[i]._id
                    },(err) => {
                        if(err) { throw new Error(err) }
                        resolve()
                    })
                })
            }
            resolve()
        })
    }
    ManyDel().then(() => {
        res.send({code:200, message: '删除角色成功'})
    })
})

module.exports = router