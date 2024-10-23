import { manhattanDistance } from "@/utils/numberUtils";
import { Board } from "./Board";
import { GhostType, TGhost } from "./types";

export abstract class IGhostController {
  private readonly _type: TGhost;

  constructor(type: TGhost) {
    this._type = type;
  }

  public get type() {
    return this._type;
  }

  public abstract draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ): void;

  public abstract getTargetCell(
    board: Board,
    currentCell: [number, number]
  ): [number, number];
}

export class BlinkyController extends IGhostController {
  constructor() {
    super(GhostType.BLINKY);
  }
  public override draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(x, y, size, size);
  }

  public override getTargetCell(board: Board): [number, number] {
    return board.getPlayerPosition();
  }
}

export class PinkyController extends IGhostController {
  constructor() {
    super(GhostType.PINKY);
  }
  public override draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    ctx.fillStyle = "#ffb8ff";
    ctx.fillRect(x, y, size, size);
  }

  public override getTargetCell(
    board: Board,
    currentCell: [number, number]
  ): [number, number] {
    const position = board.getPlayerPosition();
    const direction = board.getPlayerDirections();
    const distance =
      Math.abs(position[0] - currentCell[0]) +
      Math.abs(position[1] - currentCell[1]);

    if (distance <= 4) return position;
    if (Math.abs(direction) === 1)
      return [position[0], position[1] + direction * 4];
    return [position[0] + direction * 2, position[1]];
  }
}

export class InkyController extends IGhostController {
  constructor() {
    super(GhostType.INKY);
  }
  public override draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(x, y, size, size);
  }

  public override getTargetCell(
    board: Board,
    currentCell: [number, number]
  ): [number, number] {
    const position = board.getPlayerPosition();
    const direction = board.getPlayerDirections();
    const distance =
      Math.abs(position[0] - currentCell[0]) +
      Math.abs(position[1] - currentCell[1]);

    if (distance <= 4) return position;
    if (Math.abs(direction) === 1)
      return [position[0], position[1] - direction * 4];
    return [position[0] - direction * 2, position[1]];
  }
}

export class ClydeController extends IGhostController {
  constructor() {
    super(GhostType.CLYDE);
  }
  public override draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    ctx.fillStyle = "#ffb851";
    ctx.fillRect(x, y, size, size);
  }

  public override getTargetCell(
    board: Board,
    currentCell: [number, number]
  ): [number, number] {
    const position = board.getPlayerPosition();

    const blinky = board.getGhost(GhostType.BLINKY);

    if (blinky) {
      const direction = board.getPlayerDirections();
      const offset =
        Math.abs(direction) === 1
          ? [position[0], position[1] - direction * 2]
          : [position[0] - direction, position[1]];

      const vector = [offset[0] - blinky.x, offset[1] - blinky.y];

      const target: [number, number] = [
        currentCell[0] + vector[0] * 2,
        currentCell[1] + vector[1] * 2,
      ];

      if (
        target[0] > 0 &&
        target[0] < board.horizontalTiles - 1 &&
        target[1] > 0 &&
        target[1] < board.verticalTiles - 1
      ) {
        return target;
      }
    }

    const distance = manhattanDistance(
      position[0],
      position[1],
      currentCell[0],
      currentCell[1]
    );
    if (distance >= 8) return position;
    return this._getClosestCorner(board, currentCell);
  }

  private _getClosestCorner(board: Board, currentCell: [number, number]) {
    const corners: [number, number][] = [
      [0, 0],
      [board.horizontalTiles - 1, 0],
      [0, board.verticalTiles - 1],
      [board.horizontalTiles - 1, board.verticalTiles - 1],
    ];

    let minDistance = Infinity;
    let closestCorner: [number, number] = [0, 0];
    for (const corner of corners) {
      const distance = manhattanDistance(
        corner[0],
        corner[1],
        currentCell[0],
        currentCell[1]
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCorner = corner;
      }
    }

    return closestCorner;
  }
}
