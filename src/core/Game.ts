import { Board } from "./Board";
import { Ghost } from "./Ghost";
import { BlinkyController } from "./GhostController";
import { IMovable } from "./IMovable";
import { Player } from "./Player";
import { GhostType } from "./types";

export class Game {
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly _board: Board;

  private _objects: IMovable[];
  private _state: "running" | "paused" | "init" = "init";

  constructor(canvas: HTMLCanvasElement) {
    this._ctx = canvas.getContext("2d")!;
    this._board = new Board(canvas);

    const pacman = new Player(this._board, 14, 17);
    const blinky = new Ghost(
      new BlinkyController(GhostType.BLINKY),
      this._board,
      12,
      12
    );

    this._objects = [pacman, blinky];
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
    if (this._state === "paused") return;
    this._drawAll();
    this._moveAll();
    if (this._state === "init") this._state = "paused";
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
