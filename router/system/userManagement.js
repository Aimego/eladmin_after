const express = require('express')
const router = express.Router()

const users_model = require('../../model/users')
let { myfilters } = require('../../utils/common')

// 获取用户列表
router.post('/',async(req,res) => {
    let { page, size, filters } = req.body
    let count = await users_model.find({...myfilters(filters)}).count()
    users_model.find({...myfilters(filters)}).skip((page - 1) * size).limit(size).then(docs => {
        res.send({
            code:200,
            data: docs,
            page,
            size,
            total: count
        })
    })
})

// 添加用户
router.post('/addUser',(req,res) => {
    let { username } = req.auth
    new users_model({
        ...req.body,
        createBy: username,
        createTime: (new Date).getNowDate()
    }).save((err) => {
        if(err) { throw new Error(err) }
        res.send({code:200,message:'添加用户成功'})
    })
})

// 修改用户
router.post('/editUser',(req,res) => {
    let { username } = req.auth
    let { _id } = req.body
    new Promise((resolve) => {
        users_model.findOneAndUpdate({
            _id
        },{
            ...req.body,
            createBy: username,
            createTime: (new Date).getNowDate()
        },(err) => {
            if(err) { throw new Error(err) }
            resolve()
        })
    }).then(() => {
        res.send({code:200, message: '编辑用户成功'})
    })
})

// 删除用户
router.post('/deleteUser',(req,res) => {
    let { users } = req.body
    function ManyDel() {
        return new Promise(async(resolve) => {
            for(let i = 0; i < users.length; i++) {
                await new Promise((resolve) => {
                    users_model.deleteOne({
                        _id: users[i]._id
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
        res.send({code:200, message: '删除用户成功'})
    })
})

module.exports = router