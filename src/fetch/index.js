export function MyFetch(ms, promise) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        reject(console.log('time out'))
      }, ms * 1000)
      promise.then(resolve, reject)
    })
  }