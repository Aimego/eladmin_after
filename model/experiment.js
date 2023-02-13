const mongoose = require('../mongoose.js')

const experiment_Schema = mongoose.Schema({
    id: Number,
    exname: {
        type: String,
        require: true
    },
    fullname: {
        type: String,
        require: true
    },
    exinfo: {
        type: String,
        require: true
    },
    cid: {
        type: Number,
        require: true
    },
    major: {
        type: String
    },
    exlevel: Number,
    year: Number,
    school: String,
    unity: String,
    imagesurl: String,
    exdata: String,
    briefvideo: String,
    guidevideo: String
})

module.exports = mongoose.model('Experiment',experiment_Schema,'experiment')