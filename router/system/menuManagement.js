const express = require('express')
const router = express.Router()
const menuCatalog_model = require('../../model/menu_catalog')
const menuItem_model = require('../../model/menu_item')
// let { myfilters } = require('../../utils/common')

// 获取所有菜单栏
// router.post('/', async (req, res) => {
//     let { page, size, filters } = req.body
//     let count = await menuCatalog_model.find({ ...myfilters(filters) }).count()

//     let Menu_item = await menuItem_model.find({ _id: { $in: authority } })
//     menuCatalog_model.find({ _id: { $in: authority } }).skip(page - 1 * size).limit(size).then(docs => {
//         {
//             if (err) throw new Error(err)
//             function getMenusChildren(menus, items) {
//                 let amenus = []
//                 let children = []
//                 for (let i = 0; i < menus.length; i++) {
//                     if (menus[i].component !== 'Layout' && !menus[i].alwaysShow) {
//                         continue
//                     };
//                     amenus[i] = menus[i]
//                     for (let j = 0; j < items.length; j++) {
//                         if (menus[i]._id == items[j].pid) {
//                             children.push(items[j])
//                         }
//                     }
//                     if (children.length != 0) {
//                         amenus[i].children = children // 将菜单栏进行合并
//                         children = getMenusChildren(children, items) // 递归多层级，将子菜单栏进行递归操作判断是否还有下一层
//                     }
//                 }
//                 if (children.length == 0 && amenus.length != menus.length) return children
//                 return amenus
//             }
//             let authorityMenus = getMenusChildren(JSON.parse(JSON.stringify(docs)), JSON.parse(JSON.stringify(Menu_item))) // docs是引用类型
//             res.send({
//                 code: 200,
//                 data: authorityMenus,
//                 page,
//                 size,
//                 total: count
//             })
//         }
//     })


//     // menuCatalog_model.aggregate([
//     //     {
//     //         $addFields: {
//     //             "menuCatalog_id": { $toString: '$_id' }
//     //         }
//     //     },
//     //     {
//     //         $lookup: {
//     //             from: 'menu_item',
//     //             localField: 'menuCatalog_id',
//     //             foreignField: 'pid',
//     //             as: 'children'
//     //         }
//     //     },
//     //     {
//     //         $skip: (page - 1) * size
//     //     },
//     //     {
//     //         $limit: +size
//     //     }
//     // ]).then(docs => {
//     //     res.send({
//     //         code: 200,
//     //         data: docs,
//     //         page,
//     //         size,
//     //         total: count
//     //     })
//     // })
// })

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
    }
    res.send({ code: 200, message: '删除成功' })
})

module.exports = router