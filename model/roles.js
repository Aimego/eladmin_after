const mongoose = require('../mongoose.js')

const roles_Schema = mongoose.Schema({
    name: String,
    describe: String,
    level: Number,
    authority: Array,
    createBy: String,
    createTime: String
})

module.exports = mongoose.model('Role',roles_Schema,'roles')