function Promise(executor) {
  let self = this;
  self.status = 'pending';
  self.data = null;
  self.onResolvedCallback = [];
  self.onRejectedCallback = [];

  function resolve(value) {
    if (value instanceof Promise) {
      return value.then(resolve, reject)
    }
    setTimeout(function () {
      if (self.status === 'pending') {
        self.status = 'resolved';
        self.data = value;
        self.onResolvedCallback.forEach(fn => {
          fn(value);
        })
      }
    })
  }

  function reject(reason) {
    setTimeout(() => {
      if (self.status === 'pending') {
        self.status = 'rejected';
        self.data = reason;
        self.onRejectedCallback.forEach(fn => {
          fn(reason);
        })
      }
    });
  }

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

Promise.prototype.then = function (onResolved, onRejected) {
  let self = this;
  let promise2;

  onResolved = typeof onResolved === 'function' ? onResolved : function (value) { return value; };
  onRejected = typeof onRejected === 'function' ? onRejected : function (reason) { return reason; };

  if (self.status === 'resolved') {
    return promise2 = new Promise(function (resolve, reject) {
      setTimeout(function () { // 异步执行onResolved
        try {
          let p = onResolved(self.data);
          resolvePromise(promise2, p, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    })
  }
  if (self.status === 'rejected') {
    return promise2 = new Promise(function (resolve, reject) {
      setTimeout(function () {
        try {
          let p = onRejected(self.data);
          resolvePromise(promise2, p, resolve, reject);
        } catch (e) {
          reject(e)
        }
      })
    })
  }
  if (self.status === 'pending') {
    return promise2 = new Promise(function (resolve, reject) {
      self.onResolvedCallback.push(function (value) {
        try {
          let p = onResolved(value)
          resolvePromise(promise2, p, resolve, reject);
        } catch (e) {
          reject(e)
        }
      })
      self.onRejectedCallback.push(function (reason) {
        try {
          let p = onRejected(reason);
          resolvePromise(promise2, p, resolve, reject);
        } catch (e) {
          reject(e)
        }
      })
    })
  }
}

function resolvePromise(promise2, p, resolve, reject) {
  var then
  var thenCalledOrThrow = false

  // 不能自己引用自己
  if (promise2 === p) {
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  if (p instanceof Promise) {
    if (p.status === 'pending') { //because p could resolved by a Promise Object
      p.then(function (v) {
        resolvePromise(promise2, v, resolve, reject)
      }, reject)
    } else { //but if it is resolved, it will never resolved by a Promise Object but a static value;
      p.then(resolve, reject)
    }
    return
  }

  if ((p !== null) && ((typeof p === 'object') || (typeof p === 'function'))) {
    try {
      then = p.then //because p.then could be a getter
      if (typeof then === 'function') {
        then.call(p, function rs(y) {
          if (thenCalledOrThrow) return
          thenCalledOrThrow = true
          return resolvePromise(promise2, y, resolve, reject)
        }, function rj(r) {
          if (thenCalledOrThrow) return
          thenCalledOrThrow = true
          return reject(r)
        })
      } else {
        resolve(p)
      }
    } catch (e) {
      if (thenCalledOrThrow) return
      thenCalledOrThrow = true
      return reject(e)
    }
  } else {
    resolve(p)
  }
}

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}