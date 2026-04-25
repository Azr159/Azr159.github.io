let pScore = parseInt(localStorage.getItem('pScore')) || 0;
let cScore = parseInt(localStorage.getItem('cScore')) || 0;

document.getElementById('p-score').innerText = pScore;
document.getElementById('c-score').innerText = cScore;

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-icon').innerText = '☀️';
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-icon').innerText = isDark ? '☀️' : '🌙';
}

function resetGame() {
    pScore = 0; cScore = 0;
    localStorage.setItem('pScore', 0);
    localStorage.setItem('cScore', 0);
    document.getElementById('p-score').innerText = 0;
    document.getElementById('c-score').innerText = 0;
    document.getElementById('status').innerText = "SCORE RESET";
}

function updateGlow(color) {
    const glow = document.getElementById('glow');
    glow.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
    setTimeout(() => glow.style.background = 'transparent', 500);
}

function playGame(userChoice) {
    const hands = { rock: '✊', paper: '✋', scissors: '✌️' };
    const pHand = document.getElementById('p-hand');
    const cHand = document.getElementById('c-hand');
    const vsText = document.getElementById('vs-text');
    const status = document.getElementById('status');
    const btns = document.querySelectorAll('.control-btn');

    btns.forEach(b => b.disabled = true);

    pHand.innerText = '✊';
    cHand.innerText = '✊';
    pHand.classList.add('shake-p');
    cHand.classList.add('shake-c');
    vsText.classList.remove('vs-clash');
    status.innerText = "WAIT...";

    setTimeout(() => {
        pHand.classList.remove('shake-p');
        cHand.classList.remove('shake-c');
        vsText.classList.add('vs-clash'); 

        const choices = ['rock', 'paper', 'scissors'];
        const cpuChoice = choices[Math.floor(Math.random() * 3)];

        pHand.innerText = hands[userChoice];
        cHand.innerText = hands[cpuChoice];

        if (userChoice === cpuChoice) {
            status.innerText = "DRAW!";
            updateGlow('rgba(148, 163, 184, 1)');
        } else if (
            (userChoice === 'rock' && cpuChoice === 'scissors') ||
            (userChoice === 'paper' && cpuChoice === 'rock') ||
            (userChoice === 'scissors' && cpuChoice === 'paper')
        ) {
            status.innerText = "YOU WIN!";
            pScore++;
            updateGlow('rgba(16, 185, 129, 1)');
        } else {
            status.innerText = "CPU WINS!";
            cScore++;
            updateGlow('rgba(239, 68, 68, 1)');
        }

        document.getElementById('p-score').innerText = pScore;
        document.getElementById('c-score').innerText = cScore;
        localStorage.setItem('pScore', pScore);
        localStorage.setItem('cScore', cScore);

        btns.forEach(b => b.disabled = false);
    }, 700);
}
