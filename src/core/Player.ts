import { PACMAN_COLOR } from "@/utils/constants";
import { Board } from "./Board";
import { CellType, Direction, IMovable, TDirection } from "./types";

export class Player implements IMovable {
  private readonly _boardController: Board;

  private _x: number;
  private _y: number;
  private _direction: TDirection = Direction.DOWN;
  private _velocity = 0;

  private _requestedDirection: TDirection | null = null;

  constructor(boardController: Board, cellX: number, cellY: number) {
    this._boardController = boardController;
    const size = this._boardController.tileSize;
    this._x = cellX * size;
    this._y = cellY * size;
    this._addKeyListener();
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const size = this._boardController.tileSize / 2;
    ctx.fillStyle = PACMAN_COLOR;
    ctx.beginPath();
    ctx.arc(this._x + size, this._y + size, size * 0.8, 0, 2 * Math.PI);
    ctx.fill();
  }

  public start() {
    this._velocity = 2;
  }

  public pause() {
    this._velocity = 0;
  }

  public move() {
    if (this._requestedDirection && this._isSnappedToCell()) {
      const [x, y] = this._nextPosition(this._requestedDirection);
      if (!this._isCollidingWithWall(x, y)) {
        this._direction = this._requestedDirection;
        this._requestedDirection = null;
        this._x = x;
        this._y = y;
        return;
      }
    }

    const [x, y] = this._nextPosition(this._direction);
    if (!this._isCollidingWithWall(x, y)) {
      this._x = x;
      this._y = y;
    }
  }

  private _nextPosition(nextDirection: TDirection) {
    let x = this._x;
    let y = this._y;
    switch (nextDirection) {
      case Direction.UP:
        y -= this._velocity;
        break;
      case Direction.DOWN:
        y += this._velocity;
        break;
      case Direction.LEFT:
        x -= this._velocity;
        break;
      case Direction.RIGHT:
        x += this._velocity;
        break;
    }
    return [x, y];
  }

  private _isCollidingWithWall(nextX: number, nextY: number) {
    const size = this._boardController.tileSize * 0.999;
    const checks = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ];

    for (const c of checks) {
      const [x, y] = this._boardController.getCellCoordinates(
        nextX + c[1] * size,
        nextY + c[0] * size
      );
      if (this._boardController.at(x, y) === CellType.WALL) return true;
    }

    return false;
  }

  private _changeDirection(direction: TDirection) {
    if (this._direction === direction) return;
    if (this._direction + direction === 0) {
      this._direction = direction;
      return;
    }
    this._requestedDirection = direction;
  }

  private _isSnappedToCell() {
    const size = this._boardController.tileSize;
    return this._x % size === 0 && this._y % size === 0;
  }

  private _addKeyListener() {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          this._changeDirection(Direction.UP);
          break;
        case "ArrowDown":
          this._changeDirection(Direction.DOWN);
          break;
        case "ArrowLeft":
          this._changeDirection(Direction.LEFT);
          break;
        case "ArrowRight":
          this._changeDirection(Direction.RIGHT);
          break;
      }
    });
  }
}
