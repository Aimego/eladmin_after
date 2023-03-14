const multer = require('multer')

// 2. 引入工具
const path = require('path')
const resolve = (dir) => {
    return path.join(__dirname, './', dir)
}

// 配置multer对象
const storage = multer.diskStorage({
    // 存储路径
    destination: (req, file, cb) => {
        // 限制图片类型
        cb(null, resolve('../statics/images'))
    },
    // 存储名称
    filename: (req, file, cb) => {
        let fileFormat = (file.originalname).split(".");
        cb(null, +new Date() + fileFormat[0] + "." + fileFormat[fileFormat.length - 1])
    }
})

module.exports = multer({
    storage
})