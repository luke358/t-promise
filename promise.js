function Promise(executor) {
  let self = this;
  self.status = 'pending';
  self.data = null;
  self.onResolvedCallback = [];
  self.onRejectedCallback = [];

  function resolve(value) {
    if(self.status === 'pending') {
      self.status = 'resolved';
      self.data = value;
      self.onResolvedCallback.forEach(fn => {
        fn(value);
      })
    }
  }

  function reject(reason) {
    if(self.status === 'pending') {
      self.status = 'rejected';
      self.data = reason;
      self.onRejectedCallback.forEach(fn => {
        fn(reason);
      })
    }
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

  onResolved = typeof onResolved === 'function' ? onResolved : function () {};
  onRejected = typeof onRejected === 'function' ? onRejected : function () {};

  if(self.status === 'resolved') {
    return promise2 = new Promise(function (resolve, reject) {
      try {
        let p = onResolved(self.data);
        if(p instanceof Promise) {
          p.then(resolve, reject);
        }
        resolve(p)
      } catch (e) {
        reject(e);
      }
    })
  }
  if(self.status === 'rejected') {
    return promise2 = new Promise(function (resolve, reject) {
      try {
        let p = onRejected(self.data);
        if(p instanceof Promise) {
          p.then(resolve, reject)
        }
        reject(p)
      } catch (e) {
        reject(e)
      }
    })
  }
  if(self.status === 'pending') {
    return promise2 = new Promise(function (resolve, reject) {
      self.onResolvedCallback.push(function (value) {
        try {
          let p = resolve(value)
          if(p instanceof Promise){
            p.then(resolve, reject)
          }
        } catch (e) {
          reject(e)
        }
      })
      self.onRejectedCallback.push(function(reason) {
        try {
          let p = reject(reason);
          if(p instanceof Promise) {
            p.then(resolve, reject)
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  }
}

Promise.prototype.catch =  function (onRejected) {
  return this.then(null, onRejected)
}