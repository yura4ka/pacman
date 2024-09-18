import { TCell } from "./types";

export class Cell {
  private readonly _x: number;
  private readonly _y: number;
  private readonly _stringValue: string;

  private _type: TCell;

  constructor(x: number, y: number, type: TCell) {
    this._x = x;
    this._y = y;
    this._type = type;
    this._stringValue = `${x},${y}`;
  }

  public get type() {
    return this._type;
  }

  public set type(value: TCell) {
    this._type = value;
  }

  public get position(): [number, number] {
    return [this._x, this._y];
  }

  public get x() {
    return this._x;
  }

  public get y() {
    return this._y;
  }

  public toString() {
    return this._stringValue;
  }
}
