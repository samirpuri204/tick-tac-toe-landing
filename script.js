// ============ Reveal-on-scroll ============
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ============ Footer year ============
document.getElementById("year").textContent = new Date().getFullYear();

// ============ Playable demo game ============
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("demoStatus");
const turnEl = document.getElementById("turnLabel");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const resetBtn = document.getElementById("resetBtn");
const modeAiBtn = document.getElementById("modeAi");
const mode2pBtn = document.getElementById("mode2p");

const WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let cells = Array(9).fill(null);
let current = "X";
let gameOver = false;
let vsAi = true;
let score = { X: 0, O: 0 };

// Build the board once
for (let i = 0; i < 9; i++) {
  const btn = document.createElement("button");
  btn.className = "cell";
  btn.setAttribute("aria-label", `Square ${i + 1}`);
  btn.addEventListener("click", () => onCellClick(i));
  boardEl.appendChild(btn);
}
const cellButtons = [...boardEl.children];

function onCellClick(i) {
  if (gameOver || cells[i]) return;
  if (vsAi && current === "O") return; // ignore clicks during AI turn
  place(i);
  if (!gameOver && vsAi && current === "O") setTimeout(aiMove, 420);
}

function place(i) {
  cells[i] = current;
  const btn = cellButtons[i];
  btn.textContent = current;
  btn.classList.add("filled", current === "X" ? "x-mark" : "o-mark");
  btn.disabled = true;
  const win = WINS.find((w) => w.every((idx) => cells[idx] === current));
  if (win) return endRound(current, win);
  if (cells.every(Boolean)) return endRound(null, null);
  current = current === "X" ? "O" : "X";
  updateStatus();
}

function aiMove() {
  if (gameOver) return;
  // Simple but decent AI: win > block > center > corner > random
  const empty = cells.map((c, i) => (c ? null : i)).filter((i) => i !== null);
  const tryLines = (mark) => {
    for (const w of WINS) {
      const vals = w.map((idx) => cells[idx]);
      const open = w.filter((idx) => !cells[idx]);
      if (vals.filter((v) => v === mark).length === 2 && open.length === 1) return open[0];
    }
    return null;
  };
  const move =
    tryLines("O") ?? tryLines("X") ??
    (cells[4] ? null : 4) ??
    [0, 2, 6, 8].filter((i) => !cells[i])[0] ??
    empty[Math.floor(Math.random() * empty.length)];
  place(move);
}

function endRound(winner, winLine) {
  gameOver = true;
  cellButtons.forEach((b) => (b.disabled = true));
  if (winner) {
    score[winner]++;
    scoreXEl.textContent = score.X;
    scoreOEl.textContent = score.O;
    winLine.forEach((i) => cellButtons[i].classList.add("win"));
    statusEl.textContent = vsAi
      ? winner === "X"
        ? "🎉 You win this round!"
        : "AI takes it — try again!"
      : `🎉 Player ${winner} wins!`;
    statusEl.classList.add("win-text");
  } else {
    statusEl.textContent = "It's a draw! Rematch?";
  }
}

function updateStatus() {
  statusEl.classList.remove("win-text");
  if (vsAi) {
    turnEl.textContent = current === "X" ? "Your turn" : "AI thinking…";
    statusEl.textContent = current === "X" ? "Tap a square to place your X" : "AI is making a move…";
  } else {
    turnEl.textContent = `Player ${current}'s turn`;
    statusEl.textContent = `Player ${current}: place your mark`;
  }
}

function newRound() {
  cells = Array(9).fill(null);
  current = "X";
  gameOver = false;
  cellButtons.forEach((b) => {
    b.textContent = "";
    b.disabled = false;
    b.classList.remove("filled", "x-mark", "o-mark", "win");
  });
  updateStatus();
}

resetBtn.addEventListener("click", newRound);

function setMode(vsAiMode) {
  vsAi = vsAiMode;
  modeAiBtn.classList.toggle("active", vsAi);
  mode2pBtn.classList.toggle("active", !vsAi);
  modeAiBtn.setAttribute("aria-selected", String(vsAi));
  mode2pBtn.setAttribute("aria-selected", String(!vsAi));
  score = { X: 0, O: 0 };
  scoreXEl.textContent = "0";
  scoreOEl.textContent = "0";
  newRound();
}

modeAiBtn.addEventListener("click", () => setMode(true));
mode2pBtn.addEventListener("click", () => setMode(false));
