export class PriorityQueue<T> {
  private readonly _comparator: (a: T, b: T) => number;
  private _queue: T[];

  constructor(comparator: (a: T, b: T) => number) {
    this._comparator = comparator;
    this._queue = [];
  }

  public get length() {
    return this._queue.length;
  }

  public has(item: T) {
    return this._queue.includes(item);
  }

  public enqueue(item: T) {
    this._queue.push(item);

    let current = this.length - 1;
    while (
      current > 0 &&
      this._comparator(
        this._queue[this._parent(current)],
        this._queue[current]
      ) > 0
    ) {
      const temp = this._queue[this._parent(current)];
      this._queue[this._parent(current)] = this._queue[current];
      this._queue[current] = temp;
      current = this._parent(current);
    }
  }

  public dequeue(): T | undefined {
    if (this.length === 0) return undefined;
    if (this.length === 1) return this._queue.pop();

    const result = this._queue[0];
    this._queue[0] = this._queue.pop()!;
    this._heapify(0);
    return result;
  }

  private _heapify(index: number) {
    if (this.length <= 1) return;

    const left = this._left(index);
    const right = this._right(index);
    let biggestPriority = index;

    if (
      left < this.length &&
      this._comparator(this._queue[left], this._queue[biggestPriority]) < 0
    )
      biggestPriority = left;
    if (
      right < this.length &&
      this._comparator(this._queue[right], this._queue[biggestPriority]) < 0
    )
      biggestPriority = right;

    if (biggestPriority !== index) {
      const temp = this._queue[biggestPriority];
      this._queue[biggestPriority] = this._queue[index];
      this._queue[index] = temp;
      this._heapify(biggestPriority);
    }
  }

  private _parent(index: number) {
    return Math.floor((index - 1) / 2);
  }

  private _left(index: number) {
    return 2 * index + 1;
  }

  private _right(index: number) {
    return 2 * index + 2;
  }
}
