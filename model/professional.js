const mongoose = require('../mongoose.js')

const professional_Schema = mongoose.Schema({
    id: Number,
    createId: Number,
    collegeId: Number,
    najorname: {
        type: String,
        require: true
    },
    number: Number,
    percent: Number
})

module.exports = mongoose.model('Professional',professional_Schema,'professional')