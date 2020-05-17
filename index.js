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
  // 还不能返回新的Promise
  Promise.prototype.then = function (onResolved, onRejected) {
    // 如果进入then的时候状态未发生改变，放入回调队列
    if (this.state === PENDING) {
      this.callbacks.push({
        onResolved,
        onRejected
      })
    } else if (this.state === FULFILLED) {
      // 回调函数是异步执行
      setTimeout(() => {
        onResolved(this.data)
      }, 0);
    } else {
      // 回调函数是异步执行
      setTimeout(() => {
        onRejected(this.data)
      }, 0);
    }
  }

  window.Promise = Promise
})(window)