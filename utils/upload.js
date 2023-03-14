// 引入multerConfig配置文件
const multerConfig = require('./multerConfig')
const { BASE_URL } = require('../setting')
const fileName = 'file' // 上传的 filename 名称
const uploadBaseUrl = BASE_URL // 上传服务器地址
const imgPath = "/statics/images/"

function upload(req, res) {
    return new Promise((resolve,reject) => {
        multerConfig.single(fileName)(req, res, (err) => {
            if(err) {
                reject(err)
            } else {
                // req.file.filename 文件名称后缀
                // uploadBaseUrl + imgPath + req.file.filename 完整的服务器虚拟目录
                resolve({imageurl:uploadBaseUrl + imgPath + req.file.filename,file:req.file})
            }
        })
    })
}

module.exports = upload