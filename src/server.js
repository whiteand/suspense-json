function* naturals() {
  for (var i = 0; ; i++) yield i;
}
export class SuspenseJsonStream extends ReadableStream {
  constructor(idIterator = naturals()) {
    super();
    this.idIterator = idIterator;
    this.pending = [];
  }
  getId() {
    return this.idIterator.next().value;
  }
  getPlaceholder() {
    const id = this.getId();
    return `r#${id}#`;
  }
  push(placeholder, data) {
    this.pending.push({
      placeholder,
      data: JSON.stringify(data),
    });
  }
}
