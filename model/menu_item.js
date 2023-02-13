const mongoose = require('../mongoose')

const menuItem_Schema = mongoose.Schema({
    cache: {
        type: Boolean,
        default: false
    },
    path: String,
    label: String,
    pid: String
})

module.exports = mongoose.model("Menu_Item",menuItem_Schema,"menu_item")