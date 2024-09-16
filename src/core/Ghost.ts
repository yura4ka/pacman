import { Board } from "./Board";
import { IGhostController } from "./GhostController";
import { IMovable } from "./IMovable";
import { CellType, Direction } from "./types";

export class Ghost extends IMovable {
  private readonly _ghostController: IGhostController;

  constructor(
    ghostController: IGhostController,
    boardController: Board,
    cellX: number,
    cellY: number
  ) {
    super(boardController, cellX, cellY, Direction.UP, 1);
    this._ghostController = ghostController;
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

  private _changeMovement() {
    if (!this._isSnappedToCell()) return;

    const [targetX, targetY] = this._ghostController.getTargetCell(
      this._boardController
    );

    if (this._boardController.at(targetX, targetY) === CellType.WALL) return;

    const [cellX, cellY] = this._boardController.getCellCoordinates(
      this._x,
      this._y
    );

    if (targetX === cellX && targetY === cellY) {
      this._velocity = 0;
      return;
    } else {
      this._velocity = this._defaultVelocity;
    }

    if (targetX > cellX) this._direction = Direction.RIGHT;
    else if (targetX < cellX) this._direction = Direction.LEFT;
    else if (targetY > cellY) this._direction = Direction.DOWN;
    else if (targetY < cellY) this._direction = Direction.UP;
  }
}
