const state = {
    view:{
        squares: document.querySelectorAll('.square'),
        enemy: document.querySelector('.enemy'),
        timeLeft: document.querySelector('#time_left'),
        score: document.querySelector('#score'),
        lives: document.querySelector('#lives'),
    },
    values:{
        gameVelocity: 1000,
        hitPosition: 0,
        correntTime: 60,
        score: 0,
        lives: 3,
    },
    actions:{
        timerId: setInterval(randomSquare, 1000),
        countDownTimerId: setInterval(updateTime, 1000),
    }
};

let backgroundMusic;
let isPaused = false;

function playSound(audioName) {
    let audio = new Audio(`./src/audios/${audioName}.mp3`);
    audio.volume = 0.3;
    audio.play();

    let gameOverAudio = new Audio(`./src/audios/${audioName}.mp3`);
    gameOverAudio.volume = 0.3;
    gameOverAudio.addEventListener('ended', () => {
        gameOverAudio.currentTime = 0;
    });
    gameOverAudio.loop = false;
    gameOverAudio.play();
}

function pauseGame() {
    if (!isPaused) {
        clearInterval(state.actions.timerId);
        clearInterval(state.actions.countDownTimerId);
        isPaused = true;
        document.getElementById('pauseIcon').className = 'fa-solid fa-play';
        document.getElementById('pauseOverlay').style.display = 'flex';
    } else {
        state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
        state.actions.countDownTimerId = setInterval(updateTime, 1000);
        isPaused = false;
        document.getElementById('pauseIcon').className = 'fa-solid fa-pause';
        document.getElementById('pauseOverlay').style.display = 'none';
    }
}

function updateTime() {
    state.values.correntTime--;
    state.view.timeLeft.textContent = state.values.correntTime;

    if (state.values.correntTime <= 0) {
        gameOver();
    }
}

function randomSquare() {
    if (state.values.lives <= 0) {
        gameOver();
        return;
    }
    
    state.view.squares.forEach(square => {
        square.classList.remove('enemy');
    });
    let randomNumber = Math.floor(Math.random() * 9);
    let randomSquare = state.view.squares[randomNumber];
    randomSquare.classList.add('enemy');
    state.values.hitPosition = randomSquare.id;
}

function updateLives() {
    state.view.lives.textContent = `x${state.values.lives}`;
}

function addListenerHitBox() {
    if (isPaused) return;
    state.view.squares.forEach((square) => {
        square.addEventListener("mousedown", () => {
            if (square.classList.contains('enemy') && square.id === state.values.hitPosition) {
                square.classList.remove('enemy');
                state.values.score++;
                state.view.score.textContent = state.values.score;
                state.values.hitPosition = null;
                playSound("hard-slap");
            } else {
                state.values.lives--;
                updateLives();
                playSound("miss");
                if (state.values.lives <= 0) {
                    gameOver();
                }
            }
        });
    });
}

function gameOver() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    playSound("game-over-classic");
    clearInterval(state.actions.timerId);
    clearInterval(state.actions.countDownTimerId);
    const modal = document.getElementById('gameOverModal');
    const text = document.getElementById('gameOverText');
    text.textContent = `Game Over! Your score is ${state.values.score}`;
    modal.style.display = 'flex';
}

function increaseDifficulty() {
    if (state.values.gameVelocity > 300) { 
        state.values.gameVelocity -= 100;
        clearInterval(state.actions.timerId);
        state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
    }
}

function startBackgroundMusic() {
    if (!backgroundMusic) {
        backgroundMusic = new Audio('./src/audios/musica-fundo.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.4;
    }
    backgroundMusic.play();
    document.removeEventListener('mousedown', startBackgroundMusic);
}

function init() {
    addListenerHitBox();
    document.addEventListener('mousedown', startBackgroundMusic);
    document.getElementById('pauseBtn').addEventListener('click', pauseGame);
}

init();
setInterval(increaseDifficulty, 7000);