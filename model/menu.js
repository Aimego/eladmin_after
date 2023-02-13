const mongoose = require('../mongoose.js')

const menu_Schema = mongoose.Schema({
    path: String,
    alwaysShow: Boolean,
    component: String,
    name: String,
    meta: Object,
    redirect: String,
    children: Array
})

module.exports = mongoose.model('Menu',menu_Schema,'menus')