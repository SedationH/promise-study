# 📝Promise学习与imitate过程

⚠️ imitative Promise中的异步操作是通过setTimeout 来实现的，但实际上Promise的调用都是在微任务队列中，执行优先级更高



Promise解决的是**异步编码风格的问题**



## 产生

对于异步任务，想让他按照一定的顺序执行，我们需要嵌套一层一层的回调函数 -> *回调地狱*

```js
XFetch(makeRequest('https://time.geekbang.org/?category'),
      function resolve(response) {
          console.log(response)
          XFetch(makeRequest('https://time.geekbang.org/column'),
              function resolve(response) {
                  console.log(response)
                  XFetch(makeRequest('https://time.geekbang.org')
                      function resolve(response) {
                          console.log(response)
                      }, function reject(e) {
                          console.log(e)
                      })
              }, function reject(e) {
                  console.log(e)
              })
      }, function reject(e) {
          console.log(e)
      })
```

这样看上去很乱

1. 太多嵌套了
2. 因为任务的不确定性，多了好几次reject



解决：

1. 消灭层层嵌套 -> 利用then 延时绑定
2. 消灭多次错误处理 -> 异常穿透

```js
var x1 = XFetch(makeRequest('https://time.geekbang.org/?category'))
var x2 = x1.then(value => {
    console.log(value)
    return XFetch(makeRequest('https://www.geekbang.org/column'))
})
var x3 = x2.then(value => {
    console.log(value)
    return XFetch(makeRequest('https://time.geekbang.org'))
})
x3.catch(error => {
    console.log(error)
})
```



## 参考

[浏览器工作原理与实践](https://time.geekbang.org/column/intro/216) Promise部分

[手写Promise](https://www.bilibili.com/video/BV1MJ41197Eu) 老师讲的很清晰

