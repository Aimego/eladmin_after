
function myfilters(query) {
    let obj = {}
    Object.keys(query).forEach(val => {
        obj[val] = new RegExp(`${query[val]}`)    
    })
    return obj
}

exports.myfilters = myfilters