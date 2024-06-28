
/**
 * 请求任务管理器
 */
const iTask = () => {
  let _t = {}, _task = [], _queue = [], _maximum = 1, _active = 0;
  let _waitTask = [];

  /**
   * 处理队列
   */
  _t.pushActive = (fn) => {
    _task.push(promiseObj());
    function promiseObj() {
      return new Promise((resolve) => {
        function run() {
          _active++;
          fn().then((x) => { resolve(x) }).then(() => { _t.next() })
        }
        if (_active < _maximum) run()
        else _queue.push(run)
      })
    }
  }

  _t.all = () => {
    return Promise.all(_task);
  }

  _t.next = () => {
    _active--;
    if (_queue.length > 0) {
      try {
        var res = _queue.shift()();
        res && res.then && res.then(e => _t.next())
      }
      catch (err) { }
    }
  }

  _t.pushWait = (fn) => {
    _waitTask.push(fn)
  }

  _t.concatWait = () => {
    _waitTask.map((fn) => {
      _queue.push(fn);
    })
    _waitTask = [];
  }


  return _t
}
module.exports = iTask();
