const mongoose = require('../mongoose')

const menuCatalog_Schema = mongoose.Schema({    
    path: String,
    alwaysShow: Boolean,
    name: String,
    component: String,
    meta: {
        type: Object,
        default: {
            title: 'undefined',
            icon: '',
            sort: 999
        }
    },
    hidden: {
        type: Boolean,
        default: false
    },
    redirect: {
        type: String,
        defualt: 'noRedirect'
    }
})

module.exports = mongoose.model("Menu_catalog",menuCatalog_Schema,"menu_catalog")