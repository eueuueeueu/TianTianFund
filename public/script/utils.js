function nextTick(fn) {
  requestAnimationFrame(function () {
    setTimeout(function () {
      typeof fn === "function" && fn();
    }, 0)
  })
}
function typeOf(data) {
  return Object.prototype.toString.call(data).slice(8, -1).toLowerCase()
}
function createElement(tag, attrs, children) {
  if (typeof tag !== 'string') throw new Error('tag参数类型必须是字符串')
  let element = document.createElement(tag)
  if (element instanceof HTMLUnknownElement) throw new Error('tag标签名不合法')
  attrs = typeOf(attrs === 'object') ? attrs : {}
  Object.entries(attrs).forEach(attr => {
    let attrName = attr[0]
    let attrValue = typeOf(attr[1]) === 'object' ? Object.entries(attr[1]).join(';').split(',').join(':') : attr[1]
    element[attrName] = attrValue
  })
  if (typeof children === 'string') element.innerHTML = children
  return element
}
/* function get(url) {
  let xhr = new XMLHttpRequest()
  if (typeof url !== "string") return
  return new Promise(function (resolve, reject) {
    xhr.open("GET", url)
    xhr.onload = function (e) {
      resolve(JSON.parse(e.target.response))
    }
    xhr.onerror = function (e) {
      reject(e)
    }
    xhr.send()
  })
}
function post(url, config) {
  return new Promise(function (resolve, reject) {
    let defaultConfig = { contentType: 'application/json', data: {} }
    config = _.merge(defaultConfig, config)
    let xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Content-Type', config.contentType)//告诉服务端数据类型
    xhr.onreadystatechange = function () {
      if (Math.floor(this.status / 100) === 2 && this.readyState === 4) {
        let contentType = this.getResponseHeader('content-type')//服务端返回的content-type
        let responseData = null
        if (contentType.indexOf('application/json') > -1) {
          responseData = JSON.parse(this.response)
        }
        // console.log(responseData);
        typeof config.success === "function" && config.success(responseData)
        resolve(responseData)
      }
    }
    xhr.onerror = function (err) {
      typeof config.fail === "function" && config.fail(err.message)
      reject(err)
    }
    if (config.contentType === 'application/json') {
      data = JSON.stringify(config.data)
    }
    if (config.contentType === 'application/x-www-form-urlencoded') {
      // 对象转字符串(application/x-www-form-urlencoded)
      data = Qs.stringify(config.data)
    }
    xhr.send(data)
  })
}
post('https://docs-neteasecloudmusicapi.vercel.app/homepage/block/page', { contentType: 'application/json' })
  // get('https://docs-neteasecloudmusicapi.vercel.app/homepage/block/page')
  .then(function (res) {
    createSwiper(res)
    creatClassify(res)
    createSongList(res)
  })
  .catch(function (err) {
    console.log(err);
  }) */