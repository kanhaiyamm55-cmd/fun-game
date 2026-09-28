const gameArea = document.getElementById("gameArea");
const target = document.getElementById("target");

const startMessage = document.getElementById("startMessage");
const gameOver = document.getElementById("gameOver");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const bestDisplay = document.getElementById("best");

const finalScore = document.getElementById("finalScore");
const resultMessage = document.getElementById("resultMessage");

const soundBtn = document.getElementById("soundBtn");

let score = 0;
let time = 30;
let timer;
let gameRunning = false;
let soundOn = true;

let bestScore = Number(localStorage.getItem("bestScore")) || 0;

bestDisplay.textContent = bestScore;


/* Emojis */

const emojis = [
    "😎",
    "😂",
    "🤩",
    "😈",
    "🥳",
    "🤖",
    "👻",
    "🐸",
    "🦄",
    "🔥",
    "🍕",
    "🍩"
];


/* Start Game */

function startGame() {

    score = 0;
    time = 30;

    gameRunning = true;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = time;

    startMessage.style.display = "none";
    gameOver.style.display = "none";

    target.style.display = "block";

    moveTarget();

    clearInterval(timer);

    timer = setInterval(() => {

        time--;

        timeDisplay.textContent = time;

        if (time <= 0) {
            endGame();
        }

    }, 1000);
}


/* Move Target */

function moveTarget() {

    const targetSize = target.offsetWidth;

    const maxX = gameArea.clientWidth - targetSize;
    const maxY = gameArea.clientHeight - targetSize;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    const randomEmoji =
        emojis[Math.floor(Math.random() * emojis.length)];

    target.textContent = randomEmoji;
}


/* Target Click */

target.addEventListener("click", () => {

    if (!gameRunning) return;

    score++;

    scoreDisplay.textContent = score;

    moveTarget();

    playSound();
});


/* End Game */

function endGame() {

    gameRunning = false;

    clearInterval(timer);

    target.style.display = "none";

    finalScore.textContent = score;

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "bestScore",
            bestScore
        );

        bestDisplay.textContent = bestScore;

        resultMessage.textContent =
            "🎉 New High Score!";
    }

    else if (score >= 20) {

        resultMessage.textContent =
            "🔥 Amazing! You're super fast!";
    }

    else if (score >= 10) {

        resultMessage.textContent =
            "😎 Great job! Keep going!";
    }

    else {

        resultMessage.textContent =
            "😂 Nice try! Try again!";
    }

    gameOver.style.display = "flex";
}


/* Restart */

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);


/* Sound */

soundBtn.addEventListener("click", () => {

    soundOn = !soundOn;

    soundBtn.textContent =
        soundOn ? "🔊" : "🔇";
});


/* Small click sound */

function playSound() {

    if (!soundOn) return;

    const audioContext =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.frequency.value = 600;

    oscillator.type = "sine";

    gain.gain.setValueAtTime(
        0.08,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.08
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.08
    );
}
