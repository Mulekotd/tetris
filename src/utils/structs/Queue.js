export class Queue {
  constructor() {
    this.elements = [];
  }

  enqueue(item) {
    this.elements.push(item); // Add to the end of the array
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    return this.elements.shift(); // Remove from the beginning of the array
  }

  peek() {
    if (this.isEmpty()) {
      return null;
    }

    return this.elements[0];
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  size() {
    return this.elements.length;
  }
}
