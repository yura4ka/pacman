import { Game } from "@/core/Game";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const runBtn = document.getElementById("run-btn") as HTMLButtonElement;

const game = new Game(canvas);
game.startLoop();

runBtn.addEventListener("click", () => {
  if (game.isRunning()) {
    runBtn.innerText = "Start";
    game.pause();
  } else {
    runBtn.innerText = "Pause";
    game.start();
  }
});
