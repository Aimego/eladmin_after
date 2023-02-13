const express = require('express')
const router = express.Router()
const fs = require('fs')
const { resolve } = require('path')

const resource_model = require('../model/resource')
let { myfilters } = require('../utils/common')
// 获取文件资源
router.post('/resource',async(req, res) => {
    let { page, size, filters } = req.body
    let count = await resource_model.find({...myfilters(filters)}).count()
    resource_model.find({...myfilters(filters)}).skip((page - 1) * size).limit(size).then(docs => {
        res.send({
            code:200,
            data: docs,
            page,
            size,
            total: count
        })
    })
})

// 删除文件资源
router.post('/deleteResource',(req, res) => {
    let { files } = req.body
    function ManyDel() {
        return new Promise(async(resolve) => {
            for(let i = 0; i < files.length; i++) {
                await new Promise((resolve) => {
                    fs.unlink(`statics/images/${files[i].filename}`,(err) => {
                        if(err) {
                            throw new Error('删除本地文件失败'+err)
                        }
                        resolve()
                    })
                })
                await new Promise((resolve) => {
                    resource_model.deleteOne({
                        _id: files[i]._id
                    },(err) => {
                        if(err) {
                            throw new Error('数据库删除图片记录失败'+err)
                        }
                        resolve()
                    })
                })
            }
            resolve()
        })
    }
    ManyDel().then(() => {
        res.send({code:200,message:'删除成功'})
    })
})

module.exports = router