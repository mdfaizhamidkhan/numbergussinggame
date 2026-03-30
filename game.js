// ===== Game State =====
let secretNumber;
let attempts;
let guessHistory;
let bestScore = localStorage.getItem('numberGame_bestScore') || null;
let gameOver = false;

// ===== DOM Elements =====
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const attemptsCount = document.getElementById('attempts-count');
const bestScoreEl = document.getElementById('best-score');
const rangeDisplay = document.getElementById('range-display');
const feedbackArea = document.getElementById('feedback-area');
const feedbackMessage = document.getElementById('feedback-message');
const hintIndicator = document.getElementById('hint-indicator');
const hintMarker = document.getElementById('hint-marker');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const winOverlay = document.getElementById('win-overlay');
const winNumber = document.getElementById('win-number');
const winStats = document.getElementById('win-stats');
const newGameBtn = document.getElementById('new-game-btn');
const gameCard = document.getElementById('game-card');
const confettiContainer = document.getElementById('confetti-container');

// ===== Initialize Game =====
function initGame() {
  secretNumber = Math.floor(Math.random() * 100) + 1;
  attempts = 0;
  guessHistory = [];
  gameOver = false;

  // Reset UI
  attemptsCount.textContent = '0';
  bestScoreEl.textContent = bestScore || '—';
  rangeDisplay.textContent = '1 – 100';

  feedbackMessage.className = 'feedback-message';
  feedbackMessage.textContent = '';
  feedbackArea.classList.remove('active');
  hintIndicator.classList.remove('show');

  historySection.classList.remove('show');
  historyList.innerHTML = '';

  winOverlay.classList.remove('show');
  newGameBtn.classList.remove('show');
  gameCard.classList.remove('success');

  guessInput.value = '';
  guessInput.disabled = false;
  guessBtn.disabled = false;
  guessInput.focus();
}

// ===== Make a Guess =====
function makeGuess() {
  if (gameOver) return;

  const value = guessInput.value.trim();
  if (!value) {
    shakeInput();
    return;
  }

  const guess = parseInt(value, 10);

  if (isNaN(guess) || guess < 1 || guess > 100) {
    showFeedback('Please enter a number between 1 and 100', 'too-high');
    shakeInput();
    return;
  }

  // Check for duplicate guess
  if (guessHistory.includes(guess)) {
    showFeedback(`You already guessed ${guess}! Try another.`, 'too-high');
    shakeInput();
    guessInput.value = '';
    return;
  }

  attempts++;
  guessHistory.push(guess);
  attemptsCount.textContent = attempts;
  feedbackArea.classList.add('active');

  // Update range hint
  updateRangeDisplay();

  // Show hint bar marker
  updateHintMarker(guess);

  if (guess === secretNumber) {
    handleWin(guess);
  } else if (guess < secretNumber) {
    showFeedback(`${guess} is too low! ↑ Go higher`, 'too-low');
    addHistoryChip(guess, 'low');
  } else {
    showFeedback(`${guess} is too high! ↓ Go lower`, 'too-high');
    addHistoryChip(guess, 'high');
  }

  guessInput.value = '';
  guessInput.focus();
}

// ===== Show Feedback Message =====
function showFeedback(text, type) {
  feedbackMessage.className = 'feedback-message';
  feedbackMessage.textContent = '';

  // Force reflow for re-animation
  void feedbackMessage.offsetWidth;

  feedbackMessage.textContent = text;
  feedbackMessage.classList.add('show', type);
}

// ===== Update Hint Marker Position =====
function updateHintMarker(guess) {
  hintIndicator.classList.add('show');
  const pct = ((guess - 1) / 99) * 100;
  hintMarker.style.left = `calc(${pct}% - 3px)`;
}

// ===== Update Range Display =====
function updateRangeDisplay() {
  const lows = guessHistory.filter(g => g < secretNumber);
  const highs = guessHistory.filter(g => g > secretNumber);

  const low = lows.length > 0 ? Math.max(...lows) + 1 : 1;
  const high = highs.length > 0 ? Math.min(...highs) - 1 : 100;

  rangeDisplay.textContent = `${low} – ${high}`;
}

// ===== Add History Chip =====
function addHistoryChip(guess, type) {
  historySection.classList.add('show');

  const chip = document.createElement('div');
  chip.className = `history-chip ${type}`;

  const arrow = type === 'low' ? '↑' : '↓';
  chip.innerHTML = `<span>${guess}</span><span class="chip-arrow">${arrow}</span>`;

  // Add with slight stagger
  chip.style.animationDelay = '0.05s';
  historyList.appendChild(chip);
}

// ===== Handle Win =====
function handleWin(guess) {
  gameOver = true;
  guessInput.disabled = true;
  guessBtn.disabled = true;

  // Update best score
  if (!bestScore || attempts < bestScore) {
    bestScore = attempts;
    localStorage.setItem('numberGame_bestScore', bestScore);
    bestScoreEl.textContent = bestScore;
  }

  // Success animation on card
  gameCard.classList.add('success');

  // Add correct chip
  addHistoryChip(guess, 'correct');

  // Show feedback
  showFeedback('🎉 Perfect! You found the number!', 'correct');

  // Show win overlay after a short delay
  setTimeout(() => {
    winNumber.innerHTML = `The number was <strong>${secretNumber}</strong>`;

    const plural = attempts === 1 ? 'attempt' : 'attempts';
    let ratingEmoji = '⭐';
    if (attempts <= 3) ratingEmoji = '🏆 Legendary!';
    else if (attempts <= 5) ratingEmoji = '🌟 Amazing!';
    else if (attempts <= 7) ratingEmoji = '✨ Great job!';
    else if (attempts <= 10) ratingEmoji = '👏 Well done!';
    else ratingEmoji = '💪 Keep practicing!';

    winStats.innerHTML = `You got it in <strong>${attempts}</strong> ${plural}! ${ratingEmoji}`;

    winOverlay.classList.add('show');
    spawnConfetti();
  }, 800);

  newGameBtn.classList.add('show');
}

// ===== Confetti Effect =====
function spawnConfetti() {
  confettiContainer.innerHTML = '';
  const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.width = `${5 + Math.random() * 8}px`;
    piece.style.height = `${5 + Math.random() * 8}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confettiContainer.appendChild(piece);
  }
}

// ===== Shake Input Animation =====
function shakeInput() {
  guessInput.classList.add('shake');
  setTimeout(() => guessInput.classList.remove('shake'), 500);
}

// ===== Reset Game =====
function resetGame() {
  initGame();
}

// ===== Event Listeners =====
guessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    makeGuess();
  }
});

// Prevent non-numeric input
guessInput.addEventListener('input', () => {
  const val = guessInput.value;
  if (val.length > 3) {
    guessInput.value = val.slice(0, 3);
  }
});

// ===== Start the Game =====
initGame();
