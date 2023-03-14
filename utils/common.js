
// 过滤空对象key
function myfilters(query) {
    let obj = {}
    Object.keys(query).forEach(val => {
        obj[val] = new RegExp(`${query[val]}`)    
    })
    return obj
}

// 菜单栏多层级嵌套
function getMenusChildren(menus, items, length) {
    let amenus = []
    let children = []
    for (let i = 0; i < menus.length; i++) {
        if (menus[i].component !== 'Layout' && !menus[i].alwaysShow) {
            continue
        };
        amenus[i] = menus[i]
        for (let j = 0; j < items.length; j++) {
            if (menus[i]._id == items[j].pid) {
                children.push(items[j])
            }
        }
        if (children.length != 0) {
            amenus[i].children = children // 将菜单栏进行合并
            children = getMenusChildren(children, items, length) // 递归多层级，将子菜单栏进行递归操作判断是否还有下一层
        }
    }
    if(children.length == 0 && amenus.length != length) return children
    return amenus
}

exports.myfilters = myfilters
exports.getMenusChildren = getMenusChildren