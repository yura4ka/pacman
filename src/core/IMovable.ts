import { Board } from "./Board";
import { IDrawable, TDirection } from "./types";

export abstract class IMovable implements IDrawable {
  protected readonly _boardController: Board;
  protected _x: number;
  protected _y: number;
  private __direction: TDirection;
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
    this.__direction = direction;
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

  public get direction() {
    return this.__direction;
  }

  protected get _direction() {
    return this.__direction;
  }

  protected set _direction(direction: TDirection) {
    if (this.__direction === direction) return;
    if (this.__direction + direction === 0) {
      this.__direction = direction;
      return;
    }
    this.__direction = direction;
    this._x = Math.floor(this._x);
    this._y = Math.floor(this._y);
  }

  public abstract move(): void;
  public abstract draw(ctx: CanvasRenderingContext2D): void;

  protected _isSnappedToCell() {
    const size = this._boardController.tileSize;
    const speed = this._defaultVelocity;

    const isXSnapped =
      Math.floor((this._x - speed) / size) < Math.floor(this._x / size);
    const isYSnapped =
      Math.floor((this._y - speed) / size) < Math.floor(this._y / size);

    return isXSnapped && isYSnapped;
  }
}
