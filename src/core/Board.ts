import { IDrawable } from "./types/index";
import {
  breakPoint,
  controlsMinWidth,
  GRID_COLOR,
  remInPx,
  WALL_COLOR,
  WALLS,
} from "@/utils/constants";
import { CellType, TCell } from "./types";

export class Board implements IDrawable {
  private readonly _canvas: HTMLCanvasElement;
  private _tileSize = 8;
  private _board: TCell[][] = [];

  static readonly HORIZONTAL_TILES = 28;
  static readonly VERTICAL_TILES = 36;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._updateCanvasSize();
    window.addEventListener("resize", this._updateCanvasSize.bind(this));
    this._generateBoard(0);
  }

  public get tileSize() {
    return this._tileSize;
  }

  public get width() {
    return Board.HORIZONTAL_TILES * this._tileSize;
  }

  public get height() {
    return Board.VERTICAL_TILES * this._tileSize;
  }

  public drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = GRID_COLOR;
    for (let i = 0; i < Board.VERTICAL_TILES; i++) {
      for (let j = 0; j < Board.HORIZONTAL_TILES; j++) {
        const [x, y] = this.getRealPosition(j, i);
        ctx.strokeRect(x, y, this._tileSize, this._tileSize);
      }
    }
  }

  public getRealPosition(x: number, y: number) {
    return [x * this._tileSize, y * this._tileSize];
  }

  public getCellCoordinates(x: number, y: number) {
    return [Math.floor(x / this._tileSize), Math.floor(y / this._tileSize)];
  }

  public at(x: number, y: number): TCell {
    return this._board[y][x];
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < Board.VERTICAL_TILES; i++) {
      for (let j = 0; j < Board.HORIZONTAL_TILES; j++) {
        const cell = this._board[i][j];
        const [x, y] = this.getRealPosition(j, i);
        if (cell === CellType.WALL) {
          this._drawWall(ctx, x, y);
        }
        // ctx.fillStyle = "#fff";
        // ctx.fillText(`${i},${j}`, x, y + 20);
      }
    }
  }

  private _updateCanvasSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const maxWidth =
      screenWidth > breakPoint
        ? screenWidth - controlsMinWidth - 6 * remInPx
        : screenWidth - 2 * remInPx;
    const maxHeight = screenHeight - 2 * remInPx;
    const widthTiles = Math.floor(maxWidth / Board.HORIZONTAL_TILES);
    const heightTiles = Math.floor(maxHeight / Board.VERTICAL_TILES);

    this._tileSize = Math.min(widthTiles, heightTiles);
    this._canvas.width = Board.HORIZONTAL_TILES * this._tileSize;
    this._canvas.height = Board.VERTICAL_TILES * this._tileSize;
  }

  private _generateBoard(_level: number) {
    this._board = new Array(Board.VERTICAL_TILES).fill(0);
    for (let i = 0; i < Board.VERTICAL_TILES; i++) {
      this._board[i] = new Array(Board.HORIZONTAL_TILES).fill(CellType.EMPTY);
    }

    for (let i = 0; i < Board.VERTICAL_TILES; i++) {
      this._board[i][0] = CellType.WALL;
      this._board[i][Board.HORIZONTAL_TILES - 1] = CellType.WALL;
    }

    for (let i = 0; i < Board.HORIZONTAL_TILES; i++) {
      this._board[0][i] = CellType.WALL;
      this._board[Board.VERTICAL_TILES - 1][i] = CellType.WALL;
    }

    for (const [i, j] of WALLS) {
      this._board[i][j] = CellType.WALL;
    }
  }

  private _drawWall(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = WALL_COLOR;
    ctx.fillRect(x, y, this._tileSize, this._tileSize);
  }
}
