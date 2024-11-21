import { Game } from "@/core/Game";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const runBtn = document.getElementById("run-btn") as HTMLButtonElement;
const scoreElement = document.getElementById("score") as HTMLSpanElement;
const livesElement = document.getElementById("lives") as HTMLSpanElement;
const winDialog = document.getElementById("win-dialog") as HTMLDialogElement;
const loseDialog = document.getElementById("lose-dialog") as HTMLDialogElement;

const game = new Game(canvas, 0);
game.onScoreChange = onScoreChange;
game.onWin = onWin;
game.onLivesChange = onLivesChange;
game.onLose = onLose;

livesElement.innerText = `${game.lives}`;
game.startLoop();

runBtn.addEventListener("click", onMainButtonClick);
document.querySelectorAll(".dialog-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const parent = btn.parentElement as HTMLDialogElement;
    parent.close();
  });
});

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

function onMainButtonClick() {
  if (game.isRunning()) {
    runBtn.innerText = "Start";
    game.pause();
  } else {
    game.start();
    runBtn.innerText = game.isRunning() ? "Pause" : "Start";
  }
}

function setLevel(level: number) {
  const buttons = document.querySelectorAll(".level-btn");
  buttons.forEach((button) => {
    button.classList.remove("current");
  });
  buttons[level].classList.add("current");
  game.changeLevel(level);
  scoreElement.innerText = "0";
}

function onScoreChange(score: number) {
  scoreElement.innerText = `${score}`;
}

function onWin() {
  winDialog.showModal();
  runBtn.innerText = "Restart";
}

function onLivesChange(lives: number) {
  livesElement.innerText = `${lives}`;
  runBtn.innerText = "Continue";
}

function onLose() {
  loseDialog.showModal();
  runBtn.innerText = "Restart";
}
