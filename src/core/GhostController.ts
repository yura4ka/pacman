import { Board } from "./Board";
import { TGhost } from "./types";

export abstract class IGhostController {
  private readonly _type: TGhost;

  constructor(type: TGhost) {
    this._type = type;
  }

  public get type() {
    return this._type;
  }

  public abstract draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ): void;

  public abstract getTargetCell(board: Board): [number, number];
}

export class BlinkyController extends IGhostController {
  public override draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, size, size);
  }

  public override getTargetCell(board: Board): [number, number] {
    return board.getPlayerPosition();
  }
}
