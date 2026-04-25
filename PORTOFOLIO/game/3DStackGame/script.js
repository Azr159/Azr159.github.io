const CONFIG = {
    width: 400,
    height: 600,
    boxHeight: 25,    
    boxSize: 120,     
    initialSpeed: 3,
    speedIncrement: 0.15,
    gravity: 0.8,
    colorSpeed: 5,
    cameraOffset: 150 
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startMsg = document.getElementById('start-msg');

canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

let state = {
    mode: 'START', 
    stack: [],
    debris: [],
    score: 0,
    lives: 3,
    currentBox: null,
    cameraY: 0,
    hue: 0
};
const livesEl = document.getElementById('lives');

function toIso(x, y, z) {
    const isoX = (x - z) + CONFIG.width / 2;
    const isoY = (x + z) * 0.5 - y + CONFIG.height / 2 + CONFIG.cameraOffset;
    return { x: isoX, y: isoY };
}

function getColor(hue, lightnessOffset = 0) {
    return `hsl(${hue}, 70%, ${50 + lightnessOffset}%)`;
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'perfect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }
}

class Box {
    constructor(x, y, z, w, d, hue) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w; 
        this.d = d; 
        this.h = CONFIG.boxHeight;
        this.hue = hue;
        this.vx = 0;
        this.vz = 0;
        this.vy = 0;
    }

    draw(context, cameraY) {
        const topColor = getColor(this.hue, 10);
        const rightColor = getColor(this.hue, -10);
        const leftColor = getColor(this.hue, -20);

        const nodes = [
            { x: this.x, y: this.y, z: this.z },                      
            { x: this.x + this.w, y: this.y, z: this.z },             
            { x: this.x + this.w, y: this.y, z: this.z + this.d },    
            { x: this.x, y: this.y, z: this.z + this.d },             
            { x: this.x, y: this.y + this.h, z: this.z },             
            { x: this.x + this.w, y: this.y + this.h, z: this.z },    
            { x: this.x + this.w, y: this.y + this.h, z: this.z + this.d }, 
            { x: this.x, y: this.y + this.h, z: this.z + this.d },    
        ];

        const p = nodes.map(n => toIso(n.x, n.y - cameraY, n.z));

        context.lineWidth = 1;
        context.lineJoin = 'round';
        context.strokeStyle = 'rgba(0,0,0,0.1)';
        context.fillStyle = leftColor;
        context.beginPath();
        context.moveTo(p[3].x, p[3].y);
        context.lineTo(p[2].x, p[2].y);
        context.lineTo(p[6].x, p[6].y);
        context.lineTo(p[7].x, p[7].y);
        context.closePath();
        context.fill();
        context.stroke();
        context.fillStyle = rightColor;
        context.beginPath();
        context.moveTo(p[1].x, p[1].y);
        context.lineTo(p[2].x, p[2].y);
        context.lineTo(p[6].x, p[6].y);
        context.lineTo(p[5].x, p[5].y);
        context.closePath();
        context.fill();
        context.stroke();

        context.fillStyle = topColor;
        context.beginPath();
        context.moveTo(p[4].x, p[4].y);
        context.lineTo(p[5].x, p[5].y);
        context.lineTo(p[6].x, p[6].y);
        context.lineTo(p[7].x, p[7].y);
        context.closePath();
        context.fill();
        context.stroke();
    }

    update() {
        this.x += this.vx;
        this.z += this.vz;
        this.y += this.vy; 
    }
}

class Debris extends Box {
    constructor(x, y, z, w, d, hue) {
        super(x, y, z, w, d, hue);
        this.vy = 0;
        this.life = 1.0; 
    }

    update() {
        this.vy -= CONFIG.gravity; 
        this.y += this.vy;
        this.life -= 0.02;
    }

    draw(context, cameraY) {
        if (this.life <= 0) return;
        context.globalAlpha = this.life;
        super.draw(context, cameraY);
        context.globalAlpha = 1.0;
    }
}


function initGame() {
    state.stack = [];
    state.debris = [];
    state.score = 0;
    state.lives = 3;
    state.cameraY = 0;
    state.hue = Math.random() * 360;
    scoreEl.innerText = '0';
    livesEl.innerText = 'Lives: 3';
    scoreEl.classList.remove('shake');

    const baseBox = new Box(
        -CONFIG.boxSize / 2, 
        0,                   
        -CONFIG.boxSize / 2, 
        CONFIG.boxSize,
        CONFIG.boxSize,
        state.hue
    );
    state.stack.push(baseBox);

    spawnNextBox();
    state.mode = 'PLAYING';
    startMsg.style.display = 'none';
}

function spawnNextBox() {
    const prevBox = state.stack[state.stack.length - 1];
    state.hue += CONFIG.colorSpeed;

    const moveX = state.score % 2 === 0;

    const newBox = new Box(
        prevBox.x,
        prevBox.y + CONFIG.boxHeight,
        prevBox.z,
        prevBox.w,
        prevBox.d,
        state.hue
    );

    const speed = CONFIG.initialSpeed + (state.score * CONFIG.speedIncrement);

    const startPos = (state.score % 4 < 2) ? -200 : 200;
    const direction = (state.score % 4 < 2) ? 1 : -1;

    if (moveX) {
        newBox.x = startPos;
        newBox.vx = speed * direction;
    } else {
        newBox.z = startPos;
        newBox.vz = speed * direction;
    }

    state.currentBox = newBox;
}

function placeBox() {
    if (state.mode !== 'PLAYING') return;

    const current = state.currentBox;
    const prev = state.stack[state.stack.length - 1];
    const moveX = state.score % 2 === 0;

    const diff = moveX ? current.x - prev.x : current.z - prev.z;
    if (Math.abs(diff) < 3) {
        playSound('perfect');
        if (moveX) current.x = prev.x;
        else current.z = prev.z;
    }

    let overlap, debrisX, debrisZ, debrisW, debrisD;

    if (moveX) {
        overlap = prev.w - Math.abs(current.x - prev.x);

        if (overlap > 0) {
            debrisZ = current.z;
            debrisD = current.d;
            debrisW = current.w - overlap;

            if (current.x > prev.x) {
                debrisX = current.x + overlap;
                current.w = overlap;
            } else {
                debrisX = current.x;
                current.x = prev.x; 
                current.w = overlap;
            }
        }
    } else {
        overlap = prev.d - Math.abs(current.z - prev.z);

        if (overlap > 0) {
            debrisX = current.x;
            debrisW = current.w;
            debrisD = current.d - overlap;

            if (current.z > prev.z) {
                debrisZ = current.z + overlap;
                current.d = overlap;
            } else {
                debrisZ = current.z;
                current.z = prev.z;
                current.d = overlap;
            }
        }
    }

    if (overlap > 0) {
        if (debrisW > 0.1 && debrisD > 0.1) {
            const debris = new Debris(debrisX, current.y, debrisZ, debrisW, debrisD, current.hue);
            state.debris.push(debris);
        }

        current.vx = 0; 
        current.vz = 0;
        state.stack.push(current);
        state.score++;
        scoreEl.innerText = state.score;

        if (state.score > 5) {
            state.cameraY += CONFIG.boxHeight;
        }

        spawnNextBox();

    } else {
        state.lives--;
        livesEl.innerText = 'Lives: ' + state.lives;

        const debris = new Debris(current.x, current.y, current.z, current.w, current.d, current.hue);
        state.debris.push(debris);

        if (state.lives > 0) {
            spawnNextBox();
        } else {
            gameOver();
        }
    }
}

function gameOver() {
    state.mode = 'GAMEOVER';

    const current = state.currentBox;
    const debris = new Debris(current.x, current.y, current.z, current.w, current.d, current.hue);
    state.debris.push(debris);
    state.currentBox = null;

    scoreEl.classList.add('shake');
    startMsg.innerText = "Game Over! Tap to Restart";
    startMsg.style.display = 'block';
}

function loop() {
    if (state.mode === 'PLAYING' && state.currentBox) {
        state.currentBox.update();

        const limit = 280;
        if (state.currentBox.x > limit && state.currentBox.vx > 0) {
            state.currentBox.vx *= -1;
        } else if (state.currentBox.x < -limit && state.currentBox.vx < 0) {
            state.currentBox.vx *= -1;
        }
        if (state.currentBox.z > limit && state.currentBox.vz > 0) {
            state.currentBox.vz *= -1;
        } else if (state.currentBox.z < -limit && state.currentBox.vz < 0) {
            state.currentBox.vz *= -1;
        }
    }

    for (let i = state.debris.length - 1; i >= 0; i--) {
        state.debris[i].update();
        if (state.debris[i].y < state.cameraY - 500) {
            state.debris.splice(i, 1); 
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    state.stack.forEach(box => box.draw(ctx, state.cameraY));

    state.debris.forEach(d => d.draw(ctx, state.cameraY));

    if (state.currentBox) {
        state.currentBox.draw(ctx, state.cameraY);
    }

    requestAnimationFrame(loop);
}

function handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    e.preventDefault(); 

    if (state.mode === 'START' || state.mode === 'GAMEOVER') {
        initGame();
    } else if (state.mode === 'PLAYING') {
        placeBox();
    }
}

window.addEventListener('keydown', handleInput);
window.addEventListener('pointerdown', handleInput);


loop();
