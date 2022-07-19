function Promise(executor) {
  let self = this;
  self.status = 'pending';
  self.data = null;
  self.onResolvedCallback = [];
  self.onRejectedCallback = [];

  function resolve(value) {
    // TODO
  }

  function reject(reason) {
    // TODO
  }

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}