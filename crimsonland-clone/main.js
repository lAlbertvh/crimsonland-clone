const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 4,
    angle: 0,
    color: '#4caf50'
};

const bullets = [];
const enemies = [];
const particles = [];
let score = 0;
let keys = {};
let gameStarted = false;
let enemyInterval = null;

const shootSound = new Audio('sounds/shoot.wav');

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.restore();
}

function drawBullets() {
    ctx.fillStyle = '#fff';
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    ctx.fillStyle = '#e53935';
    enemies.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

function showStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CRIMSONLAND JS', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '24px Arial';
    ctx.fillText('Нажмите "Старт", чтобы начать', canvas.width / 2, canvas.height / 2);
}

function updatePlayer() {
    let dx = 0, dy = 0;
    if (keys['w']) dy -= 1;
    if (keys['s']) dy += 1;
    if (keys['a']) dx -= 1;
    if (keys['d']) dx += 1;
    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx = dx / len;
        dy = dy / len;
    }
    player.x += dx * player.speed;
    player.y += dy * player.speed;
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.dx;
        b.y += b.dy;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.dx *= 0.92;
        p.dy *= 0.92;
        p.radius *= 0.96;
        p.alpha -= 0.03;
        if (p.alpha <= 0 || p.radius < 0.5) {
            particles.splice(i, 1);
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed;
        e.y += Math.sin(angle) * e.speed;
        const dist = Math.hypot(player.x - e.x, player.y - e.y);
        if (dist < player.radius + e.radius) {
            alert('Game Over! Ваш счет: ' + score);
            stopGame();
        }
    }
}

function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = 0; y = Math.random() * canvas.height; }
    else if (edge === 1) { x = canvas.width; y = Math.random() * canvas.height; }
    else if (edge === 2) { x = Math.random() * canvas.width; y = 0; }
    else { x = Math.random() * canvas.width; y = canvas.height; }
    enemies.push({ x, y, radius: 18, speed: 1.5 });
}

function spawnParticles(x, y, color = '#e53935', count = 12) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        particles.push({
            x,
            y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 2,
            alpha: 1,
            color
        });
    }
}

function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            const e = enemies[i];
            const b = bullets[j];
            const dist = Math.hypot(e.x - b.x, e.y - b.y);
            if (dist < e.radius + 5) {
                spawnParticles(e.x, e.y);
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score++;
                break;
            }
        }
    }
}

function gameLoop() {
    if (!gameStarted) {
        showStartScreen();
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawParticles();
    drawScore();
    updatePlayer();
    updateBullets();
    updateEnemies();
    updateParticles();
    checkCollisions();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameStarted = true;
    score = 0;
    enemies.length = 0;
    bullets.length = 0;
    particles.length = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.angle = 0;
    if (enemyInterval) clearInterval(enemyInterval);
    enemyInterval = setInterval(spawnEnemy, 1200);
    gameLoop();
    document.getElementById('startBtn').style.display = 'none';
}

function stopGame() {
    gameStarted = false;
    clearInterval(enemyInterval);
    document.getElementById('startBtn').style.display = '';
    showStartScreen();
}

document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    player.angle = Math.atan2(my - player.y, mx - player.x);
});

canvas.addEventListener('mousedown', e => {
    if (!gameStarted) return;
    const angle = player.angle;
    bullets.push({
        x: player.x + Math.cos(angle) * player.radius,
        y: player.y + Math.sin(angle) * player.radius,
        dx: Math.cos(angle) * 8,
        dy: Math.sin(angle) * 8
    });
    shootSound.currentTime = 0;
    shootSound.play();
});

document.getElementById('shoot-btn').ontouchstart = () => {
    if (!gameStarted) return;
    const angle = player.angle;
    bullets.push({
        x: player.x + Math.cos(angle) * player.radius,
        y: player.y + Math.sin(angle) * player.radius,
        dx: Math.cos(angle) * 8,
        dy: Math.sin(angle) * 8
    });
    shootSound.currentTime = 0;
    shootSound.play();
};

// Мобильное управление движением
function setKey(key, value) {
    keys[key] = value;
}

document.getElementById('btn-up').ontouchstart = () => setKey('w', true);
document.getElementById('btn-up').ontouchend = () => setKey('w', false);
document.getElementById('btn-down').ontouchstart = () => setKey('s', true);
document.getElementById('btn-down').ontouchend = () => setKey('s', false);
document.getElementById('btn-left').ontouchstart = () => setKey('a', true);
document.getElementById('btn-left').ontouchend = () => setKey('a', false);
document.getElementById('btn-right').ontouchstart = () => setKey('d', true);
document.getElementById('btn-right').ontouchend = () => setKey('d', false);

// Показываем стартовый экран при загрузке
showStartScreen();

// Кнопка старта (добавь в index.html: <button id="startBtn">Старт</button>)
document.getElementById('startBtn').onclick = startGame;

// Запускаем основной цикл
gameLoop();
