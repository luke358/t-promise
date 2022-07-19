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