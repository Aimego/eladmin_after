const mongoose = require('../mongoose.js')
const md5 = require('js-md5')
const users_Schema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        default: md5('123456'),
        require: true
    },
    sex: {
        type: String,
        default: '男'
    },
    avatar: {
        type: String,
        default: 'http://localhost:8001/statics/images/16756960392063.jpg'
    },
    phone: String,
    email: {
        type: String,
        match: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
    },
    forbid: {
        type: Boolean,
        default: true
    },
    roleId: String,
    createTime: String
})

module.exports = mongoose.model('User',users_Schema,'users')