const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Elementos da interface
const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

// Áudio para quando a cobra come a comida
const audio = new Audio("../assets/audio.mp3");

// Tamanho de cada célula do jogo (tamanho da cobra e da comida)
const size = 30;

// Posição inicial da cobra
const initialPosition = { x: 270, y: 240 };
let snake = [initialPosition];

// Função para aumentar a pontuação
const incrementScore = () => {
    score.innerText = +score.innerText + 10;
};

// Função para gerar um número aleatório dentro de um intervalo
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

// Gera uma posição aleatória alinhada à grade de 30px
const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size);
    return Math.round(number / 30) * 30;
};

// Gera uma cor aleatória para a comida
const randomColor = () => {
    const red = randomNumber(0, 255);
    const green = randomNumber(0, 255);
    const blue = randomNumber(0, 255);

    return `rgb(${red}, ${green}, ${blue})`;
};

// Objeto que representa a comida
const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
};

let direction, loopId;

// Desenha a comida na tela
const drawFood = () => {
    const { x, y, color } = food;

    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.shadowBlur = 0;
};

// Desenha a cobra na tela
const drawSnake = () => {
    ctx.fillStyle = "#ddd";

    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = "white"; // Cabeça da cobra
        }
        ctx.fillRect(position.x, position.y, size, size);
    });
};

// Move a cobra na direção escolhida
const moveSnake = () => {
    if (!direction) return;

    const head = snake[snake.length - 1];

    if (direction == "right") snake.push({ x: head.x + size, y: head.y });
    if (direction == "left") snake.push({ x: head.x - size, y: head.y });
    if (direction == "down") snake.push({ x: head.x, y: head.y + size });
    if (direction == "up") snake.push({ x: head.x, y: head.y - size });

    snake.shift(); // Remove a cauda para manter o tamanho constante
};

// Desenha a grade de fundo
const drawGrid = () => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#191919";

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.lineTo(i, 0);
        ctx.lineTo(i, 600);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(0, i);
        ctx.lineTo(600, i);
        ctx.stroke();
    }
};

// Verifica se a cobra comeu a comida
const checkEat = () => {
    const head = snake[snake.length - 1];

    if (head.x == food.x && head.y == food.y) {
        incrementScore();
        snake.push(head); // Aumenta o tamanho da cobra
        audio.play();

        let x = randomPosition();
        let y = randomPosition();

        // Evita que a comida apareça dentro da cobra
        while (snake.find(position => position.x == x && position.y == y)) {
            x = randomPosition();
            y = randomPosition();
        }

        food.x = x;
        food.y = y;
        food.color = randomColor();
    }
};

// Verifica colisões da cobra (parede ou ela mesma)
const checkCollision = () => {
    const head = snake[snake.length - 1];
    const canvasLimit = canvas.width - size;
    const neckIndex = snake.length - 2;

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit;
    const selfCollision = snake.find((position, index) => index < neckIndex && position.x == head.x && position.y == head.y);

    if (wallCollision || selfCollision) {
        gameOver();
    }
};

// Finaliza o jogo ao bater na parede ou em si mesma
const gameOver = () => {
    direction = undefined;
    menu.style.display = "flex";
    finalScore.innerText = score.innerText;
    canvas.style.filter = "blur(2px)";
};

// Loop principal do jogo
const gameLoop = () => {
    clearInterval(loopId);

    ctx.clearRect(0, 0, 600, 600);
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
    checkEat();
    checkCollision();

    loopId = setTimeout(() => {
        gameLoop();
    }, 300);
};

gameLoop();

// Captura os eventos do teclado para controlar a cobra
document.addEventListener("keydown", ({ key }) => {
    if (key == "ArrowRight" && direction != "left") direction = "right";
    if (key == "ArrowLeft" && direction != "right") direction = "left";
    if (key == "ArrowDown" && direction != "up") direction = "down";
    if (key == "ArrowUp" && direction != "down") direction = "up";
});

// Reinicia o jogo ao clicar no botão "Jogar novamente"
buttonPlay.addEventListener("click", () => {
    score.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";
    snake = [initialPosition];
});
