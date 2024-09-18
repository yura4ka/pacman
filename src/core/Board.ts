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
import { Cell } from "./Cell";
import { astar } from "@/lib/Astar";
import { Player } from "./Player";

export class Board implements IDrawable {
  private readonly _canvas: HTMLCanvasElement;
  private _tileSize = 8;
  private _board: Cell[][] = [];
  private _player: Player | null = null;

  static readonly HORIZONTAL_TILES = 28;
  static readonly VERTICAL_TILES = 36;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._updateCanvasSize();
    window.addEventListener("resize", this._updateCanvasSize.bind(this));
    this._generateBoard(0);
  }

  public static getDistance(start: Cell, target: Cell) {
    const [sx, sy] = start.position;
    const [tx, ty] = target.position;
    return Math.abs(sx - tx) + Math.abs(sy - ty);
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

  public addPlayer(player: Player) {
    if (this._player) return;
    this._player = player;
  }

  public getPlayerPosition() {
    if (!this._player) throw new Error("Player not found");
    return this.getCellCoordinates(this._player.x, this._player.y);
  }

  public drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = GRID_COLOR;
    for (let i = 0; i < Board.VERTICAL_TILES; i++) {
      for (let j = 0; j < Board.HORIZONTAL_TILES; j++) {
        const [x, y] = this.getCanvasCoordinates(j, i);
        ctx.strokeRect(x, y, this._tileSize, this._tileSize);
      }
    }
  }

  public getCanvasCoordinates(x: number, y: number): [number, number] {
    return [x * this._tileSize, y * this._tileSize];
  }

  public getCellCoordinates(x: number, y: number): [number, number] {
    return [Math.floor(x / this._tileSize), Math.floor(y / this._tileSize)];
  }

  public at(x: number, y: number): TCell {
    return this._board[y][x].type;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < Board.VERTICAL_TILES; i++) {
      for (let j = 0; j < Board.HORIZONTAL_TILES; j++) {
        const cell = this._board[i][j];
        const [x, y] = this.getCanvasCoordinates(j, i);
        if (cell.type === CellType.WALL) {
          this._drawWall(ctx, x, y);
        }
        // ctx.fillStyle = "#fff";
        // ctx.fillText(`${i},${j}`, x, y + 20);
      }
    }
  }

  public findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    isValidNeighbor: (node: Cell) => boolean
  ) {
    const start = this._board[startY][startX];
    const target = this._board[targetY][targetX];
    const getNeighbors = (node: Cell) =>
      this.getNeighbors(node, isValidNeighbor);
    const heuristic = (node: Cell) => Board.getDistance(node, target);

    return astar(start, target, getNeighbors, Board.getDistance, heuristic);
  }

  public getNeighbors(
    node: Cell,
    isValidNeighbor = Board._defaultValidNeighbor
  ) {
    const result = [];
    const [x, y] = node.position;
    const lookup = [
      [x - 1, y],
      [x, y - 1],
      [x + 1, y],
      [x, y + 1],
    ];

    for (const [nx, ny] of lookup) {
      if (
        nx >= 0 &&
        nx < Board.HORIZONTAL_TILES &&
        ny >= 0 &&
        ny < Board.VERTICAL_TILES &&
        isValidNeighbor(this._board[ny][nx])
      ) {
        result.push(this._board[ny][nx]);
      }
    }

    return result;
  }

  private static _defaultValidNeighbor(_node: Cell) {
    return true;
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
      this._board[i] = new Array(Board.HORIZONTAL_TILES).fill(0);
      for (let j = 0; j < Board.HORIZONTAL_TILES; j++) {
        this._board[i][j] = new Cell(j, i, CellType.EMPTY);
      }
    }

    for (let i = 0; i < Board.VERTICAL_TILES; i++) {
      this._board[i][0].type = CellType.WALL;
      this._board[i][Board.HORIZONTAL_TILES - 1].type = CellType.WALL;
    }

    for (let i = 0; i < Board.HORIZONTAL_TILES; i++) {
      this._board[0][i].type = CellType.WALL;
      this._board[Board.VERTICAL_TILES - 1][i].type = CellType.WALL;
    }

    for (const [i, j] of WALLS) {
      this._board[i][j].type = CellType.WALL;
    }
  }

  private _drawWall(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = WALL_COLOR;
    ctx.fillRect(x, y, this._tileSize, this._tileSize);
  }
}
