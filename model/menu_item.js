const mongoose = require('../mongoose')

const menuItem_Schema = mongoose.Schema({
    path: String,
    pid: String,
    name: String,
    hidden: {
        type: Boolean,
        default: false
    },
    component: String,
    meta: {
        type: Object,
        default: {
            title: 'undefined',
            icon: '',
            sort: 999
        }
    },
    alwaysShow: Boolean
})

module.exports = mongoose.model("Menu_Item",menuItem_Schema,"menu_item")