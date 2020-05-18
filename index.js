// 定义常量状态
const
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REGECTED = 'REGECTED';


// IIFE闭包 实现绑定到全局作用域
(function (window) {
  function Promise(executor) {
    const self = this

    self.state = PENDING
    self.data = undefined
    self.callbacks = []

    // 状态改变: PENDING -> FULFILLED
    function resolve(value) {
      if (self.state !== PENDING) {
        return;
      }

      self.state = FULFILLED
      self.data = value
      if (self.callbacks.length > 0) {
        self.callbacks.forEach(callbackObj => {
          // 放置于下次loop中执行
          // 否则2是获取不到的
          setTimeout(() => {
            callbackObj.onResolved(self.data)
          }, 0);
        })
      }
    }

    // 状态改变: PENDING -> REGECTED
    function reject(reason) {
      if (self.state !== PENDING) {
        return;
      }

      self.state = REGECTED
      self.data = reason
      if (self.callbacks.length > 0) {
        self.callbacks.forEach(callbackObj => {
          setTimeout(() => {
            callbackObj.onRejected(self.data)
          }, 0)
        })
      }
    }

    try {
      executor(resolve, reject)
    } catch (reason) {
      reject(reason)
    }
  }

  // then(等待并)处理状态改变后的Promise实例
  // 返回新的Promise，新状态由onResolved或者onRejected的返回值决定
  Promise.prototype.then = function (onResolved, onRejected) {

    const self = this


    // 想要返回的新的Promise状态改变，要使用resove/reject,所以把整个代码放到里面
    return new Promise((resovle, reject) => {
      // 如果进入then的时候状态未发生改变，放入回调队列
      if (self.state === PENDING) {
        self.callbacks.push({
          onResolved() {
            try {
              const result = onResolved(self.data)
              if (result instanceof Promise) {
                result.then(
                  value => resovle(value),
                  reason => reject(reason)
                )
              } else {
                resovle(result)
              }
            } catch (reason) {
              reject(reason)
            }
          },
          onRejected() {
            try {
              const result = onRejected(self.data)
              if (result instanceof Promise) {
                result.then(
                  value => resovle(value),
                  reason => reject(reason)
                )
              } else {
                resovle(result)
              }
            } catch (reason) {
              reject(reason)
            }
          }
        })
      } else if (self.state === FULFILLED) {
        // 回调函数是异步执行
        setTimeout(() => {
          /**
           * 对于结果的result的处理分三种情况
           * 1. onResolved执行出错 -> 使用try-catch捕获 后 reject
           * 2. result 为一个非Promise值 直接resolve(result)
           * 3. result 为一个Promise值 那么将要返回的新Promise的值就是result执行的结果
           */
          try {
            const result = onResolved(self.data)
            if (result instanceof Promise) {
              result.then(
                value => resovle(value),
                reason => reject(reason)
              )
            } else {
              resovle(result)
            }
          } catch (reason) {
            reject(reason)
          }
        }, 0);
      } else {
        // 回调函数是异步执行
        setTimeout(() => {
          try {
            const result = onRejected(self.data)
            if (result instanceof Promise) {
              result.then(
                value => resovle(value),
                reason => reject(reason)
              )
            } else {
              resovle(result)
            }
          } catch (reason) {
            reject(reason)
          }
        }, 0);
      }
    })
  }

  window.Promise = Promise
})(window)