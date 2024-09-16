export interface IDrawable {
  draw(ctx: CanvasRenderingContext2D): void;
}

export const CellType = {
  EMPTY: "EMPTY",
  WALL: "WALL",
  FRUIT: "FRUIT",
} as const;

export type TCell = keyof typeof CellType;

export const Direction = {
  UP: 1,
  DOWN: -1,
  LEFT: 2,
  RIGHT: -2,
} as const;

export type TDirection = (typeof Direction)[keyof typeof Direction];

export const GhostType = {
  BLINKY: "BLINKY",
  PINKY: "PINKY",
  INKY: "INKY",
  CLYDE: "CLYDE",
} as const;

export type TGhost = keyof typeof GhostType;
