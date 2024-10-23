import { Game } from "@/core/Game";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const runBtn = document.getElementById("run-btn") as HTMLButtonElement;

const game = new Game(canvas, 0);
game.startLoop();

runBtn.addEventListener("click", changeButtonText);

generateLevelButtons();

function generateLevelButtons() {
  const parent = document.querySelector(".levels")!;

  for (let i = 0; i <= 10; i++) {
    const button = document.createElement("button");
    button.innerText = `${i}`;
    button.classList.add("level-btn");
    if (i === 0) button.classList.add("current");
    button.addEventListener("click", () => setLevel(i));
    parent.appendChild(button);
  }
}

function changeButtonText() {
  if (game.isRunning()) {
    runBtn.innerText = "Start";
    game.pause();
  } else {
    runBtn.innerText = "Pause";
    game.start();
  }
}

function setLevel(level: number) {
  const buttons = document.querySelectorAll(".level-btn");
  buttons.forEach((button) => {
    button.classList.remove("current");
  });
  buttons[level].classList.add("current");
  game.changeLevel(level);
}
