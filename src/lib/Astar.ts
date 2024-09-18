import { DefaultMap } from "./DefaultMap";
import { PriorityQueue } from "./PriorityQueue";

export function astar<T>(
  start: T,
  target: T,
  getNeighbors: (node: T) => T[],
  getDistance: (a: T, b: T) => number,
  heuristic: (n: T) => number
): T[] | null {
  const cameFrom = new Map<T, T>();
  const gScore = new DefaultMap<T, number>(Number.MAX_SAFE_INTEGER, [
    [start, 0],
  ]);
  const fScore = new DefaultMap<T, number>(Number.MAX_SAFE_INTEGER, [
    [start, heuristic(start)],
  ]);

  const priorityComparator = (a: T, b: T) => {
    return fScore.get(a) - fScore.get(b);
  };
  const discovered = new PriorityQueue<T>(priorityComparator);
  discovered.enqueue(start);

  while (discovered.length > 0) {
    const current = discovered.dequeue()!;
    if (current === target) return restorePath(cameFrom, current);

    for (const n of getNeighbors(current)) {
      const score = gScore.get(current) + getDistance(current, n);
      if (score < gScore.get(n)) {
        cameFrom.set(n, current);
        gScore.set(n, score);
        fScore.set(n, score + heuristic(n));
        if (!discovered.has(n)) {
          discovered.enqueue(n);
        }
      }
    }
  }

  return null;
}

function restorePath<T>(cameFrom: Map<T, T>, current: T) {
  const path = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.push(current);
  }
  return path;
}
