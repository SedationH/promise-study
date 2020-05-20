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

    onResolved = typeof onResolved === 'function' ? onResolved : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    const self = this

    // 想要返回的新的Promise状态改变，要使用resove/reject,所以把整个代码放到里面
    return new Promise((resovle, reject) => {
      function handle(callback) {
        /**
        * 对于结果的result的处理分三种情况
        * 1. onResolved执行出错 -> 使用try-catch捕获 后 reject
        * 2. result 为一个非Promise值 直接resolve(result)
        * 3. result 为一个Promise值 那么将要返回的新Promise的值就是result执行的结果
        */
        try {
          const result = callback(self.data)
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

      // 如果进入then的时候状态未发生改变，放入回调队列
      if (self.state === PENDING) {
        self.callbacks.push({
          // 在其中封装的目的是不仅是为了执行回调函数，也需要改返回Promise的状态
          onResolved() {
            handle(onResolved)
          },
          onRejected() {
            handle(onRejected)
          }
        })
      } else if (self.state === FULFILLED) {
        // 回调函数是异步执行
        setTimeout(() => {
          handle(onResolved)
        }, 0);
      } else {
        // 回调函数是异步执行
        setTimeout(() => {
          handle(onRejected)
        }, 0);
      }
    })
  }

  // 专门处理then只有reject的情况
  Promise.prototype.catch = function (onRejected) {
    this.then(undefined, onRejected)
  }

  // returns a Promise object that is resolved with a given value
  // If the value is a promise, that promise is returned
  // if the value is a thenable (i.e. has a "then" method),
  //  the returned promise will "follow" that thenable, adopting its eventual state;
  Promise.resolve = function (value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(
          value => resolve(value)
        )
      } else {
        resolve(value)
      }
    })
  }

  Promise.reject = function (reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }

  // It is typically used after having started multiple asynchronous
  // tasks to run concurrently
  // and having created promises for their results,
  // so that one can wait for all the tasks being finished.
  Promise.all = function (arr) {
    // all处理的关键在与如何确认异步的任务全部完成
    return new Promise((resolve, reject) => {
      let values = new Array(arr.length)
      let cnt = 0;
      arr.forEach((value, index) => {
        Promise.resolve(value).then(
          res => {
            cnt++
            values[index] = res
            if (cnt === arr.length) {
              resolve(values)
            }
          },
          reason => {
            reject(reason)
          }
        )
      })
    })
  }

  // race谁先完成就直接结束呗
  Promise.race = function (arr) {
    return new Promise((resolve, reject) => {
      arr.forEach(value => {
        value.then(resolve,reject)
      })
    })
  }

  window.Promise = Promise
})(window)