import { interpolate } from "@/utils/numberUtils";
import { Cell } from "./Cell";
import { CellType } from "./types";

class MazeCell {
  public i: number;
  public j: number;
  /** up, right, down, left */
  public walls: [boolean, boolean, boolean, boolean];
  public isVisited: boolean;
  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true];
    this.isVisited = false;
  }

  public get upWall() {
    return this.walls[0];
  }

  public get rightWall() {
    return this.walls[1];
  }

  public get downWall() {
    return this.walls[2];
  }

  public get leftWall() {
    return this.walls[3];
  }

  public set upWall(value: boolean) {
    this.walls[0] = value;
  }

  public set rightWall(value: boolean) {
    this.walls[1] = value;
  }

  public set downWall(value: boolean) {
    this.walls[2] = value;
  }

  public set leftWall(value: boolean) {
    this.walls[3] = value;
  }
}

export class BoardGenerator {
  private _width: number;
  private _height: number;

  constructor(width: number, height: number) {
    this._width = Math.floor(width / 2) - 1;
    this._height = Math.floor(height / 2) - 1;
  }

  public generateBoard(level: number = 1) {
    let board = null;
    while (
      !(
        board && this._countDeadEnds(board) <= interpolate(level, 1, 10, 10, 20)
      )
    ) {
      let grid = this._generateThinWall();
      grid = this._removeDeadEnds(grid);
      board = this._convertToBoard(grid);
      board = this._clearExtraWalls(board, level);
    }
    const result = this._convertToCells(board);
    return this._enclose(result);
  }

  private _convertToCells(grid: number[][]) {
    return grid.map((row, y) =>
      row.map(
        (cell, x) => new Cell(x, y, cell === 1 ? CellType.WALL : CellType.EMPTY)
      )
    );
  }

  private _enclose(board: Cell[][]) {
    for (let i = 0; i < board.length; i++) {
      board[i][0].type = CellType.WALL;
      board[i][board[0].length - 1].type = CellType.WALL;
    }

    for (let j = 0; j < board[0].length; j++) {
      board[0][j].type = CellType.WALL;
      board[board.length - 1][j].type = CellType.WALL;
    }

    return board;
  }

  private _generateThinWall() {
    const grid = [];
    for (let i = 0; i < this._height; i++) {
      for (let j = 0; j < this._width; j++) {
        grid.push(new MazeCell(i, j));
      }
    }

    let current = grid[0];
    const stack = [];
    while (!grid.every((cell) => cell.isVisited)) {
      current.isVisited = true;
      const neighbor = this._getRandomNeighbor(grid, current);
      if (neighbor) {
        stack.push(current);
        this._removeWall(current, neighbor);
        current = neighbor;
      } else {
        current = stack.pop()!;
      }
    }

    return grid;
  }

  private _removeDeadEnds(grid: MazeCell[]) {
    for (const cell of grid) {
      if (cell.walls.reduce((acc, wall) => acc + (wall ? 1 : 0), 0) > 2) {
        this._removeRandomWall(grid, cell);
      }
    }
    return grid;
  }

  private _convertToBoard(grid: MazeCell[]) {
    const grid2d = this._gridTo2d(grid);
    const board = [new Array(this._width * 2 + 1).fill(1)];

    for (let i = 0; i < this._height; i++) {
      const lineUp = [1];
      const lineSide = [1];

      for (let j = 0; j < this._width; j++) {
        lineSide.push(0);
        if (grid2d[i][j].rightWall) lineSide.push(1);
        else lineSide.push(0);
      }

      for (let j = 0; j < this._width - 1; j++) {
        if (i === 0) continue;

        if (grid2d[i][j].upWall) lineUp.push(1);
        else lineUp.push(0);

        if (
          grid2d[i][j + 1].upWall ||
          grid2d[i][j].rightWall ||
          grid2d[i - 1][j].rightWall ||
          grid2d[i][j].upWall
        )
          lineUp.push(1);
        else lineUp.push(0);
      }

      if (grid2d[i][this._width - 1].upWall) lineUp.push(1);
      else lineUp.push(0);
      lineUp.push(1);
      if (i > 0) board.push(lineUp);
      board.push(lineSide);
    }

    board.push(new Array(this._width * 2 + 1).fill(1));
    return board;
  }

  private _clearExtraWalls(board: number[][], level: number) {
    let ratio = this._countPassagesWallsRatio(board);
    const desiredRation = interpolate(level, 1, 10, 70, 40) / 100;
    while (ratio <= desiredRation) {
      const i = Math.floor(Math.random() * board.length);
      const j = Math.floor(Math.random() * board[i].length);
      if (board[i][j] === 1) {
        board[i][j] = 0;
        ratio = this._countPassagesWallsRatio(board);
      }
    }
    return board;
  }

  private _countDeadEnds(board: number[][]) {
    const checks = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    let result = 0;
    for (let i = 1; i < board.length - 1; i++) {
      for (let j = 1; j < board[i].length - 1; j++) {
        let count = 0;
        for (const [x, y] of checks) {
          if (board[i + x][j + y] === 1) count++;
        }
        if (count === 3 && board[i][j] === 0) result++;
      }
    }

    return result;
  }

  private _countPassagesWallsRatio(board: number[][]) {
    let walls = 0;
    let passages = 0;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === 1) walls++;
        else passages++;
      }
    }
    return passages / (walls + passages);
  }

  private _gridTo2d(grid: MazeCell[]) {
    const grid2d = [];
    for (let i = 0; i < this._height; i++) {
      const row = [];
      for (let j = 0; j < this._width; j++) {
        const cell = grid[i * this._width + j];
        row.push(cell);
      }
      grid2d.push(row);
    }
    return grid2d;
  }

  private _removeRandomWall(grid: MazeCell[], cell: MazeCell) {
    const checks = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ];
    const walls = [];
    for (let i = 0; i < checks.length; i++) {
      const [x, y] = checks[i];
      const neighbor = grid[this._getIndex(cell.i + x, cell.j + y)];
      if (neighbor && cell.walls[i]) {
        walls.push(i);
      }
    }

    if (!walls.length) return;

    const index = walls[Math.floor(Math.random() * walls.length)];
    cell.walls[index] = false;
    const [x, y] = checks[index];
    const neighbor = grid[this._getIndex(cell.i + x, cell.j + y)];
    neighbor.walls[3 - index] = false;
  }

  private _removeWall(a: MazeCell, b: MazeCell) {
    const x = a.j - b.j;
    const y = a.i - b.i;
    if (x === 1) {
      a.leftWall = false;
      b.rightWall = false;
    } else if (x === -1) {
      a.rightWall = false;
      b.leftWall = false;
    } else if (y === 1) {
      a.upWall = false;
      b.downWall = false;
    } else if (y === -1) {
      a.downWall = false;
      b.upWall = false;
    }
  }

  private _getIndex(i: number, j: number) {
    if (i < 0 || j < 0 || i >= this._height || j >= this._width) {
      return -1;
    }
    return i * this._width + j;
  }

  private _getNeighbors(grid: MazeCell[], cell: MazeCell) {
    const checks = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    const neighbors = [];
    for (const [x, y] of checks) {
      const index = this._getIndex(cell.i + x, cell.j + y);
      if (index !== -1) {
        neighbors.push(grid[index]);
      }
    }

    return neighbors;
  }

  private _getRandomNeighbor(grid: MazeCell[], cell: MazeCell) {
    const neighbors = this._getNeighbors(grid, cell).filter(
      (c) => !c.isVisited
    );
    if (neighbors.length)
      return neighbors[Math.floor(Math.random() * neighbors.length)];
    return null;
  }
}
