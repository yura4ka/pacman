export function interpolate(
  x: number,
  a: number,
  b: number,
  c: number,
  d: number
) {
  const transformedValue = c + ((x - a) * (d - c)) / (b - a);

  return Math.round(transformedValue);
}

export function manhattanDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}
