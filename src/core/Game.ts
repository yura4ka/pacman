import { Board } from "./Board";
import { Ghost } from "./Ghost";
import {
  BlinkyController,
  ClydeController,
  InkyController,
  PinkyController,
} from "./GhostController";
import { IMovable } from "./IMovable";
import { Player } from "./Player";

export class Game {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;

  private _board: Board;
  private _objects: IMovable[];
  private _state: "running" | "paused" | "init" = "init";

  constructor(canvas: HTMLCanvasElement, level = 1) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d")!;
    const { board, coordinates } = this._regenerateBoard(canvas, level);
    this._board = board;
    this._objects = this._generateMovables(coordinates);
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

  public changeLevel(level: number) {
    this._state = "init";
    const { board, coordinates } = this._regenerateBoard(this._canvas, level);
    this._board = board;
    this._objects = this._generateMovables(coordinates);
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

  private _regenerateBoard(
    canvas: HTMLCanvasElement,
    level: number
  ): {
    board: Board;
    coordinates: [number, number][];
  } {
    const board = new Board(canvas, level);
    if (level === 0) {
      return {
        board,
        coordinates: [
          [14, 26],
          [1, 6],
          [26, 6],
          [1, 26],
          [26, 26],
        ],
      };
    }

    const middleX = board.horizontalTiles / 2;
    const middleY = board.verticalTiles / 2;

    const pc = board.findNotWallPosition(
      middleX - middleX / 4,
      middleX + middleX / 4,
      middleY - middleY / 4,
      middleY + middleY / 4
    );

    const gc1 = board.findNotWallPosition(1, middleX, 1, middleY);
    const gc2 = board.findNotWallPosition(
      board.horizontalTiles - 2,
      middleX,
      1,
      middleY
    );
    const gc3 = board.findNotWallPosition(
      1,
      middleX,
      board.verticalTiles - 2,
      middleY
    );
    const gc4 = board.findNotWallPosition(
      board.horizontalTiles - 2,
      middleX,
      board.verticalTiles - 2,
      middleY
    );

    if (!pc || !gc1 || !gc2 || !gc3 || !gc4) {
      return this._regenerateBoard(canvas, level);
    }

    return { board, coordinates: [pc, gc1, gc2, gc3, gc4] };
  }

  private _generateMovables(c: [number, number][]): IMovable[] {
    const pacman = new Player(this._board, c[0][0], c[0][1]);
    const blinky = new Ghost(
      new BlinkyController(),
      this._board,
      c[1][0],
      c[1][1]
    );
    const pinky = new Ghost(
      new PinkyController(),
      this._board,
      c[2][0],
      c[2][1]
    );
    const inky = new Ghost(new InkyController(), this._board, c[3][0], c[3][1]);
    const clyde = new Ghost(
      new ClydeController(),
      this._board,
      c[4][0],
      c[4][1]
    );
    return [pacman, blinky, pinky, inky, clyde];
  }
}
