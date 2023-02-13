const mongoose = require('../mongoose')

const menuCatalog_Schema = mongoose.Schema({
    cache: {
        type: Boolean,
        default: false
    },
    path: String,
    label: String,
    alwaysShow: Boolean
})

module.exports = mongoose.model("Menu_catalog",menuCatalog_Schema,"menu_catalog")