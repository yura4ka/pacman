import {
  IDrawable,
  TValidNeighborFunction,
  CellType,
  TCell,
  TGhost,
} from "./types";
import {
  breakPoint,
  controlsMinWidth,
  DEFAULT_BOARD,
  GRID_COLOR,
  remInPx,
  WALL_COLOR,
} from "@/utils/constants";
import { Cell } from "./Cell";
import { Player } from "./Player";
import { astar } from "@/lib/Astar";
import { BoardGenerator } from "./BoardGenerator";
import { Ghost } from "./Ghost";
import { manhattanDistance } from "@/utils/numberUtils";

export class Board implements IDrawable {
  private readonly _canvas: HTMLCanvasElement;
  private _tileSize = 8;
  private _board: Cell[][] = [];
  private _player: Player | null = null;
  private _ghosts: Map<TGhost, Ghost> = new Map<TGhost, Ghost>();
  private _horizontalTiles = Board.HORIZONTAL_TILES;
  private _verticalTiles = Board.VERTICAL_TILES;

  private static readonly HORIZONTAL_TILES = 28;
  private static readonly VERTICAL_TILES = 36;

  constructor(canvas: HTMLCanvasElement, level = 0) {
    this._canvas = canvas;
    this._generateBoard(level);
    this._updateCanvasSize();
    window.addEventListener("resize", this._updateCanvasSize.bind(this));
  }

  public static getDistance(start: Cell, target: Cell) {
    const [sx, sy] = start.position;
    const [tx, ty] = target.position;
    return manhattanDistance(sx, sy, tx, ty);
  }

  public get tileSize() {
    return this._tileSize;
  }

  public get width() {
    return this._horizontalTiles * this._tileSize;
  }

  public get height() {
    return this._verticalTiles * this._tileSize;
  }

  public get horizontalTiles() {
    return this._horizontalTiles;
  }

  public get verticalTiles() {
    return this._verticalTiles;
  }

  public addPlayer(player: Player) {
    if (this._player) return;
    this._player = player;
  }

  public addGhost(ghost: Ghost) {
    this._ghosts.set(ghost.type, ghost);
  }

  public getGhost(type: TGhost) {
    return this._ghosts.get(type);
  }

  public getPlayerPosition() {
    if (!this._player) throw new Error("Player not found");
    return this.getCellCoordinates(this._player.x, this._player.y);
  }

  public getPlayerDirections() {
    if (!this._player) throw new Error("Player not found");
    return this._player.direction;
  }

  public drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = GRID_COLOR;
    for (let i = 0; i < this._verticalTiles; i++) {
      for (let j = 0; j < this._horizontalTiles; j++) {
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
    for (let i = 0; i < this._board.length; i++) {
      for (let j = 0; j < this._board[i].length; j++) {
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
    isValidNeighbor: TValidNeighborFunction
  ) {
    const start = this._board[startY][startX];
    const target = this._board[targetY][targetX];
    const getNeighbors = (node: Cell, previous: Cell | undefined) =>
      this.getNeighbors(node, previous, isValidNeighbor);
    const heuristic = (node: Cell) => Board.getDistance(node, target);

    return astar(start, target, getNeighbors, Board.getDistance, heuristic);
  }

  public getNeighbors(
    node: Cell,
    previous: Cell | undefined,
    isValidNeighbor: TValidNeighborFunction = Board._defaultValidNeighbor
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
        nx < this._horizontalTiles &&
        ny >= 0 &&
        ny < this._verticalTiles &&
        isValidNeighbor(node, this._board[ny][nx], previous)
      ) {
        result.push(this._board[ny][nx]);
      }
    }

    return result;
  }

  public findNotWallPosition(
    startX: number,
    endX: number,
    startY: number,
    endY: number
  ): [number, number] | null {
    startX = Math.floor(startX);
    startY = Math.floor(startY);
    endX = Math.floor(endX);
    endY = Math.floor(endY);

    let y = startY;
    let x = startX;
    const compareY = () => {
      if (startY < endY) return y < endY;
      return y >= endY;
    };
    const increaseY = () => {
      if (startY < endY) return y++;
      return y--;
    };
    const compareX = () => {
      if (startX < endX) return x < endX;
      return x >= endX;
    };
    const increaseX = () => {
      if (startX < endX) return x++;
      return x--;
    };

    while (compareY()) {
      while (compareX()) {
        if (this.at(x, y) !== CellType.WALL) {
          return [x, y];
        }
        increaseX();
      }
      increaseY();
    }

    return null;
  }

  private static _defaultValidNeighbor: TValidNeighborFunction = function (
    _node: Cell,
    _neighbor: Cell,
    _previous: Cell | undefined
  ) {
    return true;
  };

  private _updateCanvasSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const maxWidth =
      screenWidth > breakPoint
        ? screenWidth - controlsMinWidth - 6 * remInPx
        : screenWidth - 2 * remInPx;
    const maxHeight = screenHeight - 2 * remInPx;
    const widthTiles = Math.floor(maxWidth / this._horizontalTiles);
    const heightTiles = Math.floor(maxHeight / this._verticalTiles);

    this._tileSize = Math.min(widthTiles, heightTiles);
    if (this._tileSize % 2 === 1) this._tileSize -= 1;
    this._canvas.width = this._horizontalTiles * this._tileSize;
    this._canvas.height = this._verticalTiles * this._tileSize;
  }

  private _generateLevel0() {
    for (let y = 0; y < DEFAULT_BOARD.length; y++) {
      const row = [];
      for (let x = 0; x < DEFAULT_BOARD[y].length; x++) {
        row.push(
          new Cell(
            x,
            y,
            DEFAULT_BOARD[y][x] === 1 ? CellType.WALL : CellType.EMPTY
          )
        );
      }
      this._board.push(row);
    }
  }

  private _generateBoard(level: number) {
    if (level === 0) {
      this._generateLevel0();
    } else {
      const generator = new BoardGenerator(
        Board.HORIZONTAL_TILES,
        Board.VERTICAL_TILES
      );
      this._board = generator.generateBoard(level);
    }

    this._horizontalTiles = this._board[0].length;
    this._verticalTiles = this._board.length;
  }

  private _drawWall(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = WALL_COLOR;
    ctx.fillRect(x, y, this._tileSize, this._tileSize);
  }
}
