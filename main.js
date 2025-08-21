// Haetaan <canvas> ja 2D-piirtokonteksti
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Perusasetukset
const box = 20; // Peliruudun koko
let snake = [{ x: 9 * box, y: 10 * box }]; // Käärmeen aloituspaikka
let direction;
let food = randomFood();
let score = 0;

// Pelinopeusasetukset
const speed = 8; // Ruutua sekunnissa
let lastTime = 0;
let moveDelay = 1000 / speed;
let moveAccumulator = 0;

// Ruoka-efektin pulssi
let pulse = 0;
let pulseSpeed = 0.05;
let pulseGrowing = true;

// Pelitilat ("start", "playing", "gameover")
let gameState = "start";

// Näppäimistön kuuntelu
document.addEventListener("keydown", keyHandler);

// Näppäimistön käsittely riippuen pelitilasta
function keyHandler(e) {
  if (gameState === "start" && e.key.startsWith("Arrow")) {
    direction = e.key.replace("Arrow", "").toUpperCase();
    gameState = "playing";
    return;
  }
  if (gameState === "gameover" && e.key.startsWith("Arrow")) {
    resetGame();
    direction = e.key.replace("Arrow", "").toUpperCase();
    gameState = "playing";
    return;
  }
  if (gameState === "playing") {
    if(e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    else if(e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    else if(e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    else if(e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  }
}

// Uudelleenkäynnistää pelin arvot
function resetGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  score = 0;
  food = randomFood();
}

// Ruoan satunnainen sijainti
function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

// Tarkistaa osuuko pää omaan vartaloon
function collision(head, array) {
  return array.some(segment => head.x === segment.x && head.y === segment.y);
}

// Käärmeen sijainnin päivitys ja törmäysten tarkistus
function updateSnake() {
  let headX = snake[0].x;
  let headY = snake[0].y;

  if(direction === "LEFT") headX -= box;
  if(direction === "RIGHT") headX += box;
  if(direction === "UP") headY -= box;
  if(direction === "DOWN") headY += box;

  if(headX === food.x && headY === food.y) {
    score++;
    food = randomFood();
  } else {
    snake.pop();
  }

  const newHead = { x: headX, y: headY };

  if(
    headX < 0 || headY < 0 ||
    headX >= canvas.width || headY >= canvas.height ||
    collision(newHead, snake)
  ) {
    gameState = "gameover";
    return;
  }

  snake.unshift(newHead);
}

// Taustaruudukon piirtäminen
function drawGrid() {
  ctx.strokeStyle = "#333";
  for(let x = 0; x < canvas.width; x += box) {
    for(let y = 0; y < canvas.height; y += box) {
      ctx.strokeRect(x, y, box, box);
    }
  }
}

// Ruoan piirtäminen pulssiefektillä
function drawFood() {
  if(pulseGrowing) {
    pulse += pulseSpeed;
    if(pulse >= 1) pulseGrowing = false;
  } else {
    pulse -= pulseSpeed;
    if(pulse <= 0) pulseGrowing = true;
  }

  const pulseSize = box + pulse * 6;
  const pulseOffset = (box - pulseSize) / 2;

  ctx.fillStyle = "red";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "darkred";
  ctx.fillRect(food.x + pulseOffset, food.y + pulseOffset, pulseSize, pulseSize);
  ctx.shadowBlur = 0;
}

// Käärmeen piirtäminen liukuvärillä
function drawSnake() {
  for(let i = 0; i < snake.length; i++) {
    const gradient = ctx.createLinearGradient(
      snake[i].x, snake[i].y,
      snake[i].x + box, snake[i].y + box
    );
    gradient.addColorStop(0, i === 0 ? "#aef359" : "#76b852");
    gradient.addColorStop(1, i === 0 ? "#6fdc2f" : "#3c8d2f");

    ctx.fillStyle = gradient;
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }
}

// Keskitetyn tekstin piirtäminen
function drawCenteredText(text, color, size, offsetY = 0) {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + offsetY);
}

// Pisteiden piirtäminen
function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Pisteet: " + score, 10, 10);
}

// Pääpiirto
function draw() {
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  if (gameState === "start") {
    drawCenteredText("Aloita painamalla nuolinäppäintä", "white", 24);
    return;
  }

  if (gameState === "gameover") {
    drawCenteredText("Peli päättyi", "red", 28);
    drawCenteredText("Aloita uudelleen painamalla nuolinäppäintä", "white", 16, 40);
    return;
  }

  drawFood();
  drawSnake();
  drawScore();
}

// Pääsilmukka
function gameLoop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  moveAccumulator += delta;

  if (gameState === "playing" && moveAccumulator > moveDelay) {
    updateSnake();
    moveAccumulator = 0;
  }

  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

