const express = require('express')
const router = express.Router()

const menuCatalog_model = require('../../model/menu_catalog')
const roles_model = require('../../model/roles')
let { myfilters } = require('../../utils/common')

// 获取角色菜单权限
router.get('/roles_authority',(req,res) => {
    menuCatalog_model.aggregate([
    { $addFields: { "menuCatalog_id": { $toString: "$_id" }}}, // 新增字段，将ObjectId类型转换成Stirng类型后添加字段为 menuCatalog_id
    {
        $lookup: {
            from: 'menu_item',
            localField: 'menuCatalog_id',
            foreignField: 'pid',
            as: 'children'
        }
    }]).then(docs => {
        docs.forEach(val => { // 如果目录标识为false，则该目录下的children为 []
            if(!(val.alwaysShow)) {
                val.children = []
            }
        })
        res.send({code:200,data:docs})
    })
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