const mongoose = require('../mongoose.js')

const resource_Schema = mongoose.Schema({
    originalname: {
        type:String,
        require: true
    },
    imageurl: {
        type: String,
        require: true
    },
    size: {
        type: String,
        require: true
    },
    filename: {
        type: String,
        require: true
    },
    type: {
        type: String,
    },
    createBy: String,
    createTime: String
})

module.exports = mongoose.model('Resource',resource_Schema,'resource')