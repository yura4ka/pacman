import { Board } from "./Board";
import { IDrawable, TDirection } from "./types";

export abstract class IMovable implements IDrawable {
  protected readonly _boardController: Board;
  protected _x: number;
  protected _y: number;
  protected _direction: TDirection;
  protected _defaultVelocity: number;
  protected _velocity: number;

  constructor(
    boardController: Board,
    x: number,
    y: number,
    direction: TDirection,
    velocity: number
  ) {
    this._boardController = boardController;
    const size = this._boardController.tileSize;
    this._x = x * size;
    this._y = y * size;
    this._direction = direction;
    this._defaultVelocity = velocity;
    this._velocity = 0;
  }

  public start() {
    this._velocity = this._defaultVelocity;
  }

  public pause() {
    this._velocity = 0;
  }

  public get x() {
    return this._x;
  }

  public get y() {
    return this._y;
  }

  public get position(): [number, number] {
    return [this._x, this._y];
  }

  public abstract move(): void;
  public abstract draw(ctx: CanvasRenderingContext2D): void;

  protected _isSnappedToCell() {
    const size = this._boardController.tileSize;
    return this._x % size === 0 && this._y % size === 0;
  }
}
