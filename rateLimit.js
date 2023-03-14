const rateLimit = require('express-rate-limit')
module.exports = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000, // 同一个 IP 15分钟规定范围内最多发出100条请求
    message: (req,res) => {
        res.send({code: 429, message:'该 IP 在规定时间范围内请求过多，请联系管理员处理!'})
    },
    statusCode: 200 // 默认 429 则不会被拦截器接收
})