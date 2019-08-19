/**
 * 一、 调用链经典面试题
 */
// 这样写构造函数的功能：1、构造函数   2、在外部调用可以不使用new，而是直接machine();调用即可
function machine(name) {
  if (!(this instanceof machine)) {
    return new machine(name)
  }
  this.name = name
  this.logs = []
  this.logs.push(`start ${name}`)
}
machine.prototype.execute = async function() {
  //async + await
  const logs = this.logs
  if (logs.length > 0) {
    for (let i = 0; i < logs.length; i++) {
      if (typeof logs[i] === 'function') {
        await logs[i]()
      } else {
        console.log(logs[i])
      }
    }
  }
}
machine.prototype.do = function(argument) {
  this.logs.push(`${this.name} ${argument}`)
  return this
}

machine.prototype.wait = function(item) {
  this.logs.push(machine.defer(item))
  return this
}

machine.prototype.waitFirst = function(item) {
  this.logs.unshift(machine.defer(item))
  return this
}
machine.defer = function(time) {
  const times = time
  return function() {
    console.log(`wait ${times}s`)
    return new Promise(resolve => {
      // promise
      setTimeout(() => {
        resolve()
      }, times * 1000)
    })
  }
}
machine('ygy')
  .waitFirst(5)
  .do('eat')
  .execute()
// wait 5s
// start ygy
// ygy eat

// machine('ygy').execute()
// start ygy
// machine('ygy').do('eat').execute();
// start ygy
// ygy eat
// machine('ygy').wait(5).do('eat').execute();
// start ygy
// wait 5s（这里等待了5s）
// ygy eat

/**
 * 二、继承专题
 */

// 1. 构造函数绑定
// 优势（可给父构造函数传参）劣势（获取不到父构造函数的原型上的成员）
function Animal() {
  this.species = '动物'
}
Animal.prototype.fatherSecret = '我其实是一头猪'

function Cat(name, color) {
  Animal.apply(this, arguments)
  this.name = name
  this.color = color
}
var cat1 = new Cat('大毛', '黄色')
console.log(cat1.species) // 动物
console.log(cat1.fatherSecret) // undefined

// 2. 原型链继承（绑定到父构造函数的实例对象上）
// 缺点：子类多个实例上的数据皆来自同一个父类实例，一改全改，存在共享问题。
function Animal() {
  this.species = '动物'
}
Animal.prototype.fatherSecret = '我其实是一头猪'

function Cat(name, color) {
  this.name = name
  this.color = color
}
// 原型链继承
Cat.prototype = new Animal()
Cat.prototype.constructor = Cat

var cat1 = new Cat('大毛', '黄色')
var cat2 = new Cat('二毛', '蓝色')
console.log(cat1.species) // 动物
console.log(cat1.fatherSecret) // 我其实是一头猪
console.log(cat1.fatherSecret === cat2.fatherSecret) // true，cat1和cat2的fatherSecret都是来同一个Animal实例

// 3. 原形式继承（绑定到父构造函数的原型对象上）
// 优点：由于不用建立Animal实例对象所以效率高   缺点：1. 见下文注释，对Cat.prototype的修改会反映到Animal.prototype上；2.子类实例仅能继承父类原型对象上的成员，不能继承父类构造函数实例对象的成员
function Animal() {
  this.species = '动物'
}
Animal.prototype.fatherSecret = '我其实是一头猪'

function Cat(name, color) {
  this.name = name
  this.color = color
}
// 原型式继承
Cat.prototype = Animal.prototype // 指向同一个对象
Cat.prototype.constructor = Cat // 修改了Cat.prototype，会同时修改Animal.prototype

var cat1 = new Cat('大毛', '黄色')
console.log(cat1.species) // undefined 无法继承父类构造函数的实例对象上的成员
console.log(cat1.fatherSecret) // 我其实是一头猪  能继承到父类原型对象上的成员
console.log(Animal.prototype.constructor) // Cat 修改Cat.prototype.constructor同时修改了Animal.prototype.constructor

// 4. 空对象中介  为了改善原形式继承导致的父子prototype绑定到一起而出现。通过空对象作为中介打破绑定
// 缺点：仍旧不能继承父类构造函数实例对象的成员
function Animal() {
  this.species = '动物'
}
Animal.prototype.fatherSecret = '我其实是一头猪'

function Cat(name, color) {
  this.name = name
  this.color = color
}

function extend(Child, Parent) {
  var F = function() {}
  F.prototype = Parent.prototype
  Child.prototype = new F()
  Child.prototype.constructor = Child
}
extend(Cat, Animal)
var cat1 = new Cat('大毛', '黄色')
console.log(cat1.species)
console.log(cat1.fatherSecret)
console.log(Animal.prototype.constructor) // Animal 解决了原形式继承的绑定父子原型对象的缺陷。

// 5. 拷贝继承 将父构造函数prototype上的属性一一拷贝给子构造函数的prototype
function extend(Child, Parent) {
  var p = Parent.prototype
  var c = Child.prototype
  for (var i in p) {
    c[i] = p[i]
  }
}

// 6. 组合继承   原型链+构造函数绑定
// 存在原型链继承(继承父类实例对象)的共享问题
function Animal() {
  this.species = '动物'
}
Animal.prototype.fatherSecret = '我其实是一头猪'

function Cat(name, color) {
  Animal.apply(this, arguments)
  this.name = name
  this.color = color
}
Cat.prototype = new Animal()
Cat.prototype.constructor = Cat
var cat1 = new Cat('大毛', '黄色')
console.log(cat1.species)
console.log(cat1.fatherSecret)

// 7. 寄生式继承
function Animal() {
  this.species = '动物'
}
Animal.prototype.fatherSecret = '我其实是一头猪'

function Cat(name, color) {
  this.name = name
  this.color = color
}
// 原型式继承
Cat.prototype = Object.create(Animal.prototype)
Cat.prototype.constructor = Cat

var cat1 = new Cat('大毛', '黄色')
console.log(cat1.species) // undefined 无法继承父类构造函数的实例对象上的成员
console.log(cat1.fatherSecret) // 我其实是一头猪  能继承到父类原型对象上的成员
console.log(Animal.prototype.constructor) // Animal

// 8. class继承 ???
class Animal {
  constructor(species) {
    this.species = species
  }
  fatherSecret() {
    console.log('这是父类原型对象上的方法')
  }
}
class Cat extends Animal {
  constructor(name, color, species) {
    super(species)
    this.name = name
    this.color = color
  }
}
var cat1 = new Cat('大毛', '黄色', '老虎')
console.log(cat1.species)
cat1.fatherSecret()

/**
 * 三、Ajax专题
 */
// 1. 原生js的ajax请求（兼容ie）
// 一般会用promise包裹，在请求成功或失败的回调中调用resolve或reject
var request
if (window.XMLHttpRequest) {
  request = new XMLHttpRequest()
} else {
  request = new ActiveXObject('Microsoft.XMLHTTP')
}
request.open('GET', url)
request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded') // post请求需要设置
request.send(data) // post请求需要send一个data。get请求这个参数为null
request.onload = function() {
  request.status = 200 ? success(request.responseText) : failed(xhr.status)
}
// 2. 跨域之jsonp
// 这个jsonp对后端的要求：后端通过url解析出cb_key对应的cb_name，然后将后端需要给前端的数据一并合成一个cb函数的调用语句的字符串形式返回给前端
function jsonp(url, cb_key, data) {
  // 参数：api:url，回掉函数名cb_key，参数data
  cb_key = !cb_key ? 'callback' : cb_key
  data = !data ? {} : data
  return new Promise((resolve, reject) => {
    // 使用cb_key创建一个绑定在window上的全局函数,这个函数体中调用resolve。该函数会使用后台返回的函数调用语句的字符串形式进行调用
    var cb_name = 'jyf' + Date.now()
    window[cb_name] = function(res) {
      resolve(res)
    }
    // 创建一个script标签，将url放入这个script标签的src属性中
    var script = document.createElement('script')
    url += /\?/.test(url) ? '&' : '?'
    url += cb_key + '=' + cb_name
    for (let key in data) {
      url += `&${key}=${data[key]}`
    }
    script.src = url
    document.body.appendChild(script)
    script.onload = function() {
      this.remove()
    }
  })
}
// 3. 前端路由

/**
 * 四、正则practice
 */

/**
 * 五、实现高阶函数系列
 */
// 1. call apply bind
Function.prototype.myCall = function(context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  context = context || window
  context.fn = this
  const args = [...arguments].slice(1)
  const rs = context.fn(...args)
  delete context.fn
  return rs
}
Function.prototype.myApply = function(context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  context = context || window
  context.fn = this
  let result
  if (arguments[1]) {
    result = context.fn(...arguments[1])
  } else {
    result = context.fn()
  }
  delete context.fn
  return result
}
// bind由于会返回一个函数，而函数的调用若是new方式调用的话，this是不可被改变的
Function.prototype.myBind = function(context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  const _this = this
  const args = [...arguments].slice(1)
  // 返回一个函数
  return function F() {
    // 返回的函数通过new方式调用
    // 通过new方式调用时不会被任何方式改变this,它的this一定是本身，也就是_this
    // 这里 this instanceof F 中的this是函数F的this
    if (this instanceof F) {
      return new _this(...args, ...arguments)
    }
    // 返回的函数直接调用
    // 这里的arguments是function F(){}的，也就是当外部调用 f.bind(obj,1)(2) 那么这里的arguments就是2。我们需要将参数拼接起来
    return _this.apply(context, args.concat(...arguments))
  }
}
// 2. new
function create() {
  let obj = {}
  let Con = [].shift.call(arguments)
  obj.__proto__ = Con.prototype
  let result = Con.apply(obj, arguments)
  // 确保返回的是一个对象。正常情况都是返回result
  return result instanceof Object ? result : obj
}

function A() {
  this.name = 'Emma'
}
console.log(create(A))
// 3. instanceof
function myInstanceof(left, right) {
  let prototype = right.prototype
  left = left.__proto__
  while (true) {
    if (left === null || left === undefined) {
      return false
    }
    if (left === prototype) {
      return true
    }
    left = left.__proto__
  }
}
// 4. 去抖节流
const debounce = (func, wait = 50) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
// 定时器节流
const throttle1 = (func, wait = 50) => {
  let timer = null
  return function(...args) {
    if (timer === null) return
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
// 时间戳节流
const throttle2 = (func, wait = 50) => {
  // 上一次执行该函数的时间
  let lastTime = 0
  return function(...args) {
    // 当前时间
    let now = +new Date()
    // 将当前时间和上一次执行函数时间对比
    // 如果差值大于设置的等待时间就执行函数
    if (now - lastTime > wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}
// 5. 深拷贝
function deepClone1(obj) {
  // 不能克隆函数、RegExp等特殊对象;会抛弃对象的constructor属性，所有的构造函数都会指向Object
  let _obj = JSON.stringfy(obj),
    objClone = JSON.parse(_obj)
  return objClone
}
function deepClone2(obj) {
  let clone = {}
  for (let attr in obj) {
    if (typeof obj[attr] === 'object') {
      clone[attr] = deepClone2(clone[attr])
    } else if (typeof obj[attr] === 'function') {
      clone[attr] = eval('(' + obj[attr].toString() + ')')
    } else {
      clone[attr] = obj[attr]
    }
  }
  return clone
}
// 6. js异步（generator async promise)

/**
 * 六、事件循环
 */

/**
 * 七、webpack
 */
