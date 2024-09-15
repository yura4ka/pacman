import { Board } from "./Board";
import { Player } from "./Player";
import { IMovable } from "./types";

export class Game {
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly _board: Board;

  private _objects: IMovable[];
  private _state: "running" | "paused" = "paused";

  constructor(canvas: HTMLCanvasElement) {
    this._ctx = canvas.getContext("2d")!;
    this._board = new Board(canvas);
    const pacman = new Player(this._board, 14, 17);
    this._objects = [pacman];
  }

  public get state() {
    return this._state;
  }

  public isRunning() {
    return this._state === "running";
  }

  public start() {
    this._state = "running";
    this._objects.forEach((obj) => obj.start());
  }

  public pause() {
    this._state = "paused";
    this._objects.forEach((obj) => obj.pause());
  }

  public startLoop() {
    this._loop();
  }

  private _loop() {
    requestAnimationFrame(() => this._loop());
    this._drawAll();
    this._moveAll();
  }

  private _drawAll() {
    this._ctx.clearRect(0, 0, this._board.width, this._board.height);
    this._board.draw(this._ctx);
    this._objects.forEach((obj) => obj.draw(this._ctx));
    this._board.drawGrid(this._ctx);
  }

  private _moveAll() {
    this._objects.forEach((obj) => obj.move());
  }
}
