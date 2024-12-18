import { Board } from "./Board";
import { Cell } from "./Cell";
import { IGhostController } from "./GhostController";
import { IMovable } from "./IMovable";
import { CellType, Direction } from "./types";

export class Ghost extends IMovable {
  private readonly _ghostController: IGhostController;
  private _previousCell: [number, number] | null = null;

  public onPlayerCaught?: () => void;

  constructor(
    ghostController: IGhostController,
    boardController: Board,
    cellX: number,
    cellY: number,
    speed: number
  ) {
    super(boardController, cellX, cellY, Direction.UP, speed);
    this._ghostController = ghostController;
    this._boardController.addGhost(this);
  }

  public get type() {
    return this._ghostController.type;
  }

  public override draw(ctx: CanvasRenderingContext2D) {
    this._ghostController.draw(
      ctx,
      this._x,
      this._y,
      this._boardController.tileSize
    );
  }

  public override move() {
    this._changeMovement();
    switch (this._direction) {
      case Direction.UP:
        this._y -= this._velocity;
        break;
      case Direction.DOWN:
        this._y += this._velocity;
        break;
      case Direction.LEFT:
        this._x -= this._velocity;
        break;
      case Direction.RIGHT:
        this._x += this._velocity;
        break;
    }
  }

  public override resetPosition(x: number, y: number) {
    super.resetPosition(x, y);
    this._previousCell = null;
  }

  private _changeMovement() {
    if (this._checkPlayer()) {
      this.onPlayerCaught?.();
      this._velocity = 0;
      return;
    }

    if (!this._isSnappedToCell()) return;

    const [cellX, cellY] = this._boardController.getCellCoordinates(
      this._x,
      this._y
    );

    const [targetX, targetY] = this._ghostController.getTargetCell(
      this._boardController,
      [cellX, cellY]
    );

    const path = this._boardController.findPath(
      cellX,
      cellY,
      targetX,
      targetY,
      this._isValidNeighbor.bind(this)
    );

    const [nextX, nextY] = path?.at(-2)?.position ?? [cellX, cellY];

    if (nextX === cellX && nextY === cellY) {
      if (this.type === "INKY") console.log(path);
      if (this._isStack()) this._direction *= -1;
      else this._velocity = 0;
      return;
    }

    if (this._boardController.at(nextX, nextY) === CellType.WALL) {
      this._velocity = 0;
      return;
    }

    this._velocity = this._defaultVelocity;

    if (nextX > cellX) this._direction = Direction.RIGHT;
    else if (nextX < cellX) this._direction = Direction.LEFT;
    else if (nextY > cellY) this._direction = Direction.DOWN;
    else if (nextY < cellY) this._direction = Direction.UP;

    this._previousCell = [cellX, cellY];
  }

  private _checkPlayer() {
    const player = this._boardController.getPlayerPosition();
    const ghost = this._boardController.getCellCoordinates(this._x, this._y);
    return player[0] === ghost[0] && player[1] === ghost[1];
  }

  private _isValidNeighbor(
    node: Cell,
    neighbor: Cell,
    previous: Cell | undefined
  ) {
    if (neighbor.type === CellType.WALL) return false;
    if (!this._previousCell) return true;

    const [px, py] = previous?.position ?? this._previousCell;
    const [cx, cy] = node.position;
    const [nx, ny] = neighbor.position;

    if ((cx - px) * (nx - cx) < 0) return false;
    if ((cy - py) * (ny - cy) < 0) return false;

    return true;
  }

  private _isStack() {
    const cell = this._boardController.getCellCoordinates(this._x, this._y);
    const walls = this._boardController
      .getNeighborsByCoordinates(cell[0], cell[1])
      .reduce((acc, wall) => acc + (wall.type === CellType.WALL ? 1 : 0), 0);
    return walls === 3;
  }
}
