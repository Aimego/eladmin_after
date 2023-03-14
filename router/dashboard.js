const express = require('express')
const router = express.Router()
const evaluate = require('../model/dashboard_evaluation')
const { experimentalPeriod } = require('../jsonDb/dashboard.json')

// 实验周期统计
router.get('/experimentalPeriod',(req,res) => {
    let data = {}
    switch(req.query.status) {
        case '0' : data = experimentalPeriod.week; break;
        case '1' : data = experimentalPeriod.month; break;
        case '2' : data = experimentalPeriod.year; break;
    }
    res.send({code:200,data})
})

// 实验评价
router.post('/experimentalEvaluation',async (req,res) => {
    let { page, size } = req.body
    let count = await evaluate.find({}).count()
    evaluate.find({}).skip((page - 1) * size).limit(size).then((docs) => {
        res.send({
            code:200,
            data: docs,
            page,
            size,
            total: count
        })
    })
})

// 实验评价查询
router.get('/EvaluationView',(req,res) => {
    new Promise((resolve) => {
        evaluate.findOne({id:+req.query.id},(err,doc) => {
            if(err) { throw new Error(err) }
            resolve(doc)
        })
    }).then(doc => res.send({code:200,data:doc}))
})

// 删除评价
router.get('/DelEvaluation',(req,res) => {
    new Promise((resolve) => {
        evaluate.deleteOne({id:+req.query.id},(err,doc) => {
            if(err) { throw new Error(err) }
            resolve(doc)
        })
    }).then(doc => res.send({code:200,message:'删除成功',data:doc}))
})

module.exports = router