function* naturals() {
  for (var i = 0; ; i++) yield i;
}

class SuspenseJsonStreamState {
  constructor({
    idIterator = naturals(),
    resolved = new Map(),
    toSend = [],
    notResolved = new Set(),
    initiated = false,
  } = {}) {
    /**
     * @type {Array<{ placeholder: string, data: string }>}
     */
    this.toSendPool = [];
    this.idIterator = idIterator;
    /**
     * @type {Map<string, string>}
     */
    this.resolved = resolved;
    /**
     * @type {Array<{ placeholder: string, data: string }>}
     */
    this.toSend = toSend;
    /**
     * @type {Set<string>}
     */
    this.notResolved = notResolved;
    /**
     * @type {boolean}
     */
    this.initiated = initiated;
  }

  isDone() {
    return (
      this.initiated && this.toSend.length === 0 && this.notResolved.size === 0
    );
  }
  destroy() {
    this.initiated = true;
    this.toSend.length = 0;
    this.notResolved.clear();
    this.resolved.clear();
  }

  push(placeholder, data) {
    if (this.resolved.has(placeholder)) {
      throw new Error(`Placeholder ${placeholder} already resolved.`);
    }
    this.notResolved.delete(placeholder);
    this.initiated = true;
    this._collectNotResolved(data);
    this.resolved.set(placeholder, data);
    const toSendObj = this._allocToSend();
    toSendObj.placeholder = placeholder;
    toSendObj.data = JSON.stringify(data);
    this.toSend.push(toSendObj);
  }

  _allocToSend() {
    if (this.toSendPool.length > 0) {
      return this.toSendPool.pop();
    }
    return { placeholder: "", data: "" };
  }

  deallocToSend(obj) {
    obj.placeholder = "";
    obj.data = "";
    if (this.toSendPool.length < 100) {
      this.toSendPool.push(obj);
    }
  }

  _collectNotResolved(value) {
    const nodes = [value];
    const { notResolved, resolved } = this;
    while (nodes.length > 0) {
      const node = nodes.pop();
      if (node == null) continue;
      if (typeof node === "object") {
        if (Array.isArray(node)) {
          for (const item of node) {
            nodes.push(item);
          }
        } else {
          for (const [key, val] of Object.entries(node)) {
            nodes.push(key, val);
          }
        }
        continue;
      }
      if (typeof node !== "string") continue;
      if (node.startsWith("r#") && node.endsWith("#")) {
        if (!resolved.has(node)) {
          notResolved.add(node);
        }
        continue;
      }
    }
  }
  getPlaceholder() {
    const id = this.idIterator.next().value;
    return `r#${id}#`;
  }
}

export class SuspenseJsonStream extends ReadableStream {
  constructor(options) {
    const state = new SuspenseJsonStreamState(options);
    super({
      state,
      start(controller) {},
      pull(controller) {
        const { state } = this;
        if (state.isDone()) {
          controller.close();
          return;
        }
        for (var i = 0, n = state.toSend.length; i < n; i++) {
          const obj = state.toSend[i];
          const { placeholder, data } = obj;
          controller.enqueue(`\n/** ${placeholder} */\n${data}`);
          state.deallocToSend(obj);
        }
        state.toSend.length = 0;
      },
      cancel(reason) {
        this.state.destroy();
      },
    });
    this.state = state;
  }

  getPlaceholder() {
    return this.state.getPlaceholder();
  }
  /**
   * @param {string} placeholder
   * @param {unknown} data
   */
  push(placeholder, data) {
    this.state.push(placeholder, data);
  }
}
