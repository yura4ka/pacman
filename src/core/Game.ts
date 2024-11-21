import { interpolate } from "@/utils/numberUtils";
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
import { MAX_LIVES } from "@/utils/constants";

type TGameState = "running" | "paused" | "init" | "finished";

export class Game {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;

  private _board!: Board;
  private _objects!: IMovable[];
  private _state: TGameState = "init";
  private _level = 0;
  private _totalFruits = 0;
  private _score = 0;
  private _lives = MAX_LIVES;
  private _originalCoordinates: [number, number][] = [];

  public onScoreChange?: (score: number) => void;
  public onWin?: () => void;
  public onLivesChange?: (lives: number) => void;
  public onLose?: () => void;

  constructor(canvas: HTMLCanvasElement, level = 1) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d")!;
    this._setupGame(canvas, level);
  }

  public get state() {
    return this._state;
  }

  public get lives() {
    return this._lives;
  }

  public isRunning() {
    return this._state === "running";
  }

  public start() {
    if (this._state === "finished") {
      this._setupGame(this._canvas, this._level);
      return;
    }
    this._state = "running";
    this._objects.forEach((obj) => obj.start());
  }

  public pause() {
    if (this._state === "finished") return;
    this._state = "paused";
    this._objects.forEach((obj) => obj.pause());
  }

  public startLoop() {
    if (this._state !== "init") return;
    this._loop();
  }

  public changeLevel(level: number) {
    this._setupGame(this._canvas, level);
  }

  private _setupGame(canvas: HTMLCanvasElement, level: number) {
    const { board, coordinates } = this._regenerateBoard(canvas, level);
    this._originalCoordinates = coordinates;
    this._board = board;
    this._board.addFruits(level);
    this._board.onFruitEaten = this._onFruitEaten.bind(this);
    this._objects = this._generateMovables(coordinates, level);
    this._totalFruits = this._board.countFruits();
    this._score = 0;
    this._level = level;
    this._lives = MAX_LIVES;
    this._state = "init";
  }

  private _loop() {
    requestAnimationFrame(() => this._loop());
    if (this._state === "paused" || this._state === "finished") return;
    this._drawAll();
    this._moveAll();
    if (this._state === "init") this._state = "paused";
  }

  private _drawAll() {
    this._ctx.clearRect(0, 0, this._board.width, this._board.height);
    this._board.draw(this._ctx);
    this._objects.forEach((obj) => obj.draw(this._ctx));
    // this._board.drawGrid(this._ctx);
  }

  private _moveAll() {
    this._objects.forEach((obj) => obj.move());
  }

  private _onFruitEaten() {
    this._score++;
    this.onScoreChange?.(this._score);
    this._checkWin();
  }

  private _checkWin() {
    if (this._score !== this._totalFruits) return;
    this._state = "finished";
    this.onWin?.();
  }

  private _onPlayerCaught() {
    this.pause();
    this._lives--;
    this.onLivesChange?.(this._lives);
    if (!this._checkLose()) {
      this._objects.forEach((obj, i) => {
        const [x, y] = this._originalCoordinates[i];
        obj.resetPosition(x, y);
      });
    }
  }

  private _checkLose() {
    if (this._lives > 0) return false;
    this._state = "finished";
    this.onLose?.();
    return true;
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
      const coordinates: [number, number][] = [
        [14, 26],
        [1, 6],
        [26, 6],
        [1, 26],
        [26, 26],
      ];
      return { board, coordinates };
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

  private _generateMovables(c: [number, number][], level: number): IMovable[] {
    const pacman = new Player(this._board, c[0][0], c[0][1]);

    const ghostSpeed =
      level === 0 ? 1.9 : interpolate(level, 1, 10, 150, 200) / 100;

    const ghosts = [
      new Ghost(
        new BlinkyController(),
        this._board,
        c[1][0],
        c[1][1],
        ghostSpeed
      ),
      new Ghost(
        new PinkyController(),
        this._board,
        c[2][0],
        c[2][1],
        ghostSpeed
      ),
      new Ghost(
        new InkyController(),
        this._board,
        c[3][0],
        c[3][1],
        ghostSpeed
      ),
      new Ghost(
        new ClydeController(),
        this._board,
        c[4][0],
        c[4][1],
        ghostSpeed
      ),
    ];

    ghosts.forEach((g) => {
      g.onPlayerCaught = this._onPlayerCaught.bind(this);
    });

    return [pacman, ...ghosts];
  }
}
