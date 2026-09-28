const game = document.getElementById("game");
const player = document.getElementById("player");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const bestEl = document.getElementById("best");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScore = document.getElementById("finalScore");
const finalBest = document.getElementById("finalBest");
const resultMessage = document.getElementById("resultMessage");

const pauseBtn = document.getElementById("pauseBtn");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const soundBtn = document.getElementById("soundBtn");


let score = 0;
let lives = 3;
let level = 1;

let bestScore =
    Number(localStorage.getItem("neonDodgeBest")) || 0;

let playerX = 50;

let obstacles = [];

let gameRunning = false;
let paused = false;

let animationId;
let spawnTimer;

let speed = 2;


/* SOUND */

let soundOn = true;

function beep(frequency = 500, duration = 0.05) {

    if (!soundOn) return;

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) return;

    const audio = new AudioContext();

    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
        0.05,
        audio.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start();

    oscillator.stop(
        audio.currentTime + duration
    );
}


/* INITIAL */

bestEl.textContent =
    formatNumber(bestScore);


/* FORMAT */

function formatNumber(number) {

    return String(number).padStart(4, "0");

}


/* START */

function startGame() {

    score = 0;
    lives = 3;
    level = 1;
    speed = 2;

    playerX = 50;

    obstacles.forEach(o => o.element.remove());

    obstacles = [];

    scoreEl.textContent = formatNumber(score);
    livesEl.textContent = lives;
    levelEl.textContent = level;

    player.style.left = playerX + "%";

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    gameRunning = true;
    paused = false;

    pauseBtn.textContent = "Ⅱ";

    clearInterval(spawnTimer);

    spawnTimer = setInterval(
        spawnObstacle,
        850
    );

    animationId =
        requestAnimationFrame(gameLoop);

    beep(700, .08);
}


/* SPAWN OBSTACLE */

function spawnObstacle() {

    if (!gameRunning || paused) return;

    const obstacle =
        document.createElement("div");

    obstacle.className = "obstacle";

    const maxX =
        game.clientWidth - 45;

    const x =
        Math.random() * maxX;

    obstacle.style.left = x + "px";
    obstacle.style.top = "-50px";

    game.appendChild(obstacle);

    obstacles.push({
        element: obstacle,
        x: x,
        y: -50
    });
}


/* GAME LOOP */

function gameLoop() {

    if (!gameRunning) return;

    if (!paused) {

        moveObstacles();

        checkLevel();

    }

    animationId =
        requestAnimationFrame(gameLoop);
}


/* MOVE */

function moveObstacles() {

    const gameHeight =
        game.clientHeight;

    const playerRect =
        player.getBoundingClientRect();

    obstacles.forEach((obstacle, index) => {

        obstacle.y += speed;

        obstacle.element.style.top =
            obstacle.y + "px";

        const rect =
            obstacle.element.getBoundingClientRect();

        if (
            rect.bottom > playerRect.top + 10 &&
            rect.top < playerRect.bottom &&
            rect.right > playerRect.left + 7 &&
            rect.left < playerRect.right - 7
        ) {

            hitObstacle(obstacle, index);

            return;
        }

        if (obstacle.y > gameHeight) {

            obstacle.element.remove();

            obstacles.splice(index, 1);

            score++;

            scoreEl.textContent =
                formatNumber(score);

            beep(350, .025);
        }

    });

}


/* COLLISION */

function hitObstacle(obstacle, index) {

    obstacle.element.remove();

    obstacles.splice(index, 1);

    lives--;

    livesEl.textContent = lives;

    game.style.animation =
        "shake .25s";

    setTimeout(() => {
        game.style.animation = "";
    }, 250);

    beep(150, .15);

    if (lives <= 0) {

        endGame();

    }

}


/* LEVEL */

function checkLevel() {

    const newLevel =
        Math.floor(score / 10) + 1;

    if (newLevel !== level) {

        level = newLevel;

        speed =
            Math.min(6, 2 + level * .55);

        levelEl.textContent =
            level;

        beep(900, .1);
    }

}


/* END GAME */

function endGame() {

    gameRunning = false;

    clearInterval(spawnTimer);

    cancelAnimationFrame(animationId);

    obstacles.forEach(o =>
        o.element.remove()
    );

    obstacles = [];

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "neonDodgeBest",
            bestScore
        );

        resultMessage.textContent =
            "✦ NEW HIGH SCORE ✦";

        beep(1000, .2);

    } else {

        resultMessage.textContent =
            "Nice run, pilot. Try again!";
    }

    finalScore.textContent =
        formatNumber(score);

    finalBest.textContent =
        formatNumber(bestScore);

    bestEl.textContent =
        formatNumber(bestScore);

    gameOverScreen.classList.remove("hidden");
}


/* KEYBOARD */

const keys = {};

document.addEventListener(
    "keydown",
    event => {

        keys[event.key.toLowerCase()] = true;

        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
        ) {
            event.preventDefault();
        }

        if (
            event.key.toLowerCase() === "p"
        ) {
            togglePause();
        }

    }
);

document.addEventListener(
    "keyup",
    event => {

        keys[event.key.toLowerCase()] = false;

    }
);


/* PLAYER MOVEMENT */

function movePlayer(direction) {

    if (!gameRunning || paused) return;

    playerX += direction * 3;

    playerX =
        Math.max(
            4,
            Math.min(96, playerX)
        );

    player.style.left =
        playerX + "%";
}


setInterval(() => {

    if (!gameRunning || paused) return;

    if (
        keys["arrowleft"] ||
        keys["a"]
    ) {
        movePlayer(-1);
    }

    if (
        keys["arrowright"] ||
        keys["d"]
    ) {
        movePlayer(1);
    }

}, 16);


/* MOBILE */

let leftPressed = false;
let rightPressed = false;

leftBtn.addEventListener(
    "touchstart",
    e => {
        e.preventDefault();
        leftPressed = true;
    }
);

leftBtn.addEventListener(
    "touchend",
    () => {
        leftPressed = false;
    }
);

rightBtn.addEventListener(
    "touchstart",
    e => {
        e.preventDefault();
        rightPressed = true;
    }
);

rightBtn.addEventListener(
    "touchend",
    () => {
        rightPressed = false;
    }
);


setInterval(() => {

    if (leftPressed)
        movePlayer(-1);

    if (rightPressed)
        movePlayer(1);

}, 16);


/* PAUSE */

function togglePause() {

    if (!gameRunning) return;

    paused = !paused;

    pauseBtn.textContent =
        paused ? "▶" : "Ⅱ";

}


pauseBtn.addEventListener(
    "click",
    togglePause
);


/* BUTTONS */

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);


/* SOUND BUTTON */

soundBtn.addEventListener(
    "click",
    () => {

        soundOn = !soundOn;

        soundBtn.textContent =
            soundOn ? "🔊" : "🔇";

    }
);
