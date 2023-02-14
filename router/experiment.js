const express = require('express')
const router = express.Router()

const experiment_model = require('../model/experiment')
const professional_model = require('../model/professional')

let { myfilters } = require('../utils/common')
// 获取所有实验
router.post('/',async(req,res) => {
    let { page, size, filters } = req.body
    let count = await experiment_model.find({...myfilters(filters)}).count()
    experiment_model.find({...myfilters(filters)}).skip((page - 1) * size).limit(size).then(docs => {
        res.send({
            code:200,
            data: docs,
            page,
            size,
            total: count
        })
    })
})

// 获取所有实验专业
router.get('/professional',(req,res) => {
    professional_model.find({}).then(docs => {
        res.send({code:200,data:docs})
    })
})

// 编辑实验
router.post('/editExperiment',(req,res) => {
    let { _id } = req.body
    new Promise((resolve) => {
        experiment_model.findOneAndUpdate({
            _id
        },{
            ...req.body
        },(err, doc) => {
            if(err) { throw new Error(err) }
            resolve(doc)
        })
    }).then((doc) => {
        res.send({code:200, data: doc})
    })
})

// 添加实验
router.post('/addExperiment',(req,res) => {
    new experiment_model({
        ...req.body
    }).save((err) =>{
        if(err) { throw new Error(err) }
        res.send({code:200, message: '添加实验成功'})
    })
})

// 删除实验
router.post('/deleteExperiment',(req,res) => {
    let { _id } = req.body 
    new Promise((resolve) => {
        experiment_model.deleteOne({
            _id
        },(err) => {
            if(err) { throw new Error(err) }
            resolve()
        })
    }).then(() => {
        res.send({code:200, message: '删除实验成功'})
    })
})

module.exports = router