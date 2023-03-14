const mongoose = require('../mongoose')

const permissionBtns_Schema = mongoose.Schema({
    pid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    sort: {
        type: Number,
        default: 999
    },
    hidden: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Permission_btn', permissionBtns_Schema, 'permission_btns')