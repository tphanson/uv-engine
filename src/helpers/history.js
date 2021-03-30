import deepcopy from 'deepcopy';

class History {
  constructor(initialState) {
    this.history = [initialState];
    this.index = 0;
  }

  watch = (callback) => {
    this.callback = () => {
      const { index, history } = this;
      return callback({
        disabledUndo: index <= 0,
        disabledRedo: index >= history.length - 1,
      });
    }
  }

  get = () => {
    return deepcopy(this.history[this.index]);
  }

  set = (data) => {
    data = deepcopy(data)
    clearTimeout(this.historyId);
    this.historyId = setTimeout(() => {
      const { history, index } = this;
      const head = history.slice(0, index + 1);
      head[index + 1] = data;
      this.history = deepcopy(head);
      this.index = index + 1;
      return this.callback();
    }, 500);
  }

  undo = () => {
    const { index } = this;
    this.index = Math.max(0, index - 1);
    this.callback();
    return this.get();
  }

  redo = () => {
    const { history, index } = this;
    this.index = Math.min(history.length - 1, index + 1);
    this.callback();
    return this.get();
  }
}

export default History;