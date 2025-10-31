import { Queue } from '../utils/structs/Queue.js';
import { BASE_DROP_INTERVAL, LOCK_DELAY } from '../utils/constants.js';

export class Tetris {
  constructor(canvas, boardWidth, boardHeight, soundManager = null) {
    this.soundManager = soundManager;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });

    // Game Board
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.board = Array.from({ length: this.boardHeight }, () => Array(this.boardWidth).fill(0));

    this.updateBlockSize();

    this.pieces = {
      O: { shape: [[1, 1], [1, 1]], color: '#FFD700' },
      I: { shape: [[1, 1, 1, 1]], color: '#00FFFF' },
      S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#FF0000' },
      Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#32CD32' },
      L: { shape: [[1, 0, 0], [1, 1, 1]], color: '#FFA500' },
      J: { shape: [[0, 0, 1], [1, 1, 1]], color: '#FF69B4' },
      T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' }
    };

    // Pieces and Queue
    this.queue = new Queue();
    this.fillQueue();
    this.currentPiece = this.queue.dequeue();
    this.nextPiece = this.queue.peek();

    this.pieceHeight = this.currentPiece.shape.length;

    this.position = { x: 3, y: -this.pieceHeight };
    this.factor = 1.0;

    this.dropInterval = BASE_DROP_INTERVAL * this.factor;
    this.dropCounter = 0;
    this.lastTime = 0;

    this.lockDelay = LOCK_DELAY;
    this.lockTimer = 0;
    this.lockPending = false;

    this.totalClearedLines = 0;
    this.score = 0;
    this.level = 1;

    this.isPaused = false;
    this.isGameOver = false;
  }

  updateBlockSize() {
    this.blockSize = this.canvas.width / (this.boardWidth * (window.devicePixelRatio || 1));
  }

  resize(newCanvas) {
    this.canvas = newCanvas;
    this.ctx = newCanvas.getContext('2d', { alpha: false });

    this.updateBlockSize();
  }

  randomPiece() {
    const keys = Object.keys(this.pieces);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const { shape, color } = this.pieces[randomKey];

    return { shape: shape.map(r => [...r]), color };
  }

  fillQueue() {
    while (this.queue.size() < 3) this.queue.enqueue(this.randomPiece());
  }

  checkCollision(offsetX = 0, offsetY = 0) {
    const { shape } = this.currentPiece;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;

        const newX = this.position.x + x + offsetX;
        const newY = this.position.y + y + offsetY;

        if (newX < 0 || newX >= this.boardWidth || newY >= this.boardHeight) {
          return true;
        }

        if (newY >= 0 && this.board[newY][newX] !== 0) {
          return true;
        }
      }
    }

    return false;
  }

  checkTopCollision() {
    // Check if any blocks exist at the very top row of the board
    for (let x = 0; x < this.boardWidth; x++) {
      if (this.board[0][x] !== 0) return true;
    }

    return false;
  }

  // Check if board is more than half filled
  isBoardHalfFilled() {
    let filledCells = 0;

    const totalCells = this.boardWidth * this.boardHeight;

    for (let y = 0; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        if (this.board[y][x] !== 0) {
          filledCells++;
        }
      }
    }

    return filledCells >= totalCells / 2;
  }

  // Check if fast music should be playing
  shouldPlayFastMusic() {
    return this.level >= 10 || this.isBoardHalfFilled();
  }

  // Update background music based on game state
  updateBackgroundMusic() {
    if (!this.soundManager) return;

    if (this.shouldPlayFastMusic()) {
      this.soundManager.switchToFastMusic();
    } else {
      this.soundManager.switchToNormalMusic();
    }
  }

  togglePause() {
    if (this.isGameOver) return;

    this.isPaused = !this.isPaused;

    const overlay = document.getElementById('game-overlay');
    const overlayContent = overlay.querySelector('.overlay-content');

    if (this.isPaused) {
      this.soundManager.pauseBackground();
      this.soundManager.playPauseSound();

      overlayContent.innerHTML = `
        <h1>PAUSED</h1>
        <p>Press P to resume</p>
      `;
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
      this.soundManager.resumeBackground();
    }
  }

  showGameOver() {
    this.isGameOver = true;

    // Play game over sound
    if (this.soundManager) {
      this.soundManager.playGameOver();
    }

    const overlay = document.getElementById('game-overlay');
    const overlayContent = overlay.querySelector('.overlay-content');

    overlayContent.innerHTML = `
      <h1>GAME OVER</h1>
      <div class="game-over-score">
        <div class="final-score">${this.score}</div>
        <div class="score-label">Final Score</div>
      </div>
      <div class="game-over-stats">
        <div class="stat">
          <span class="stat-number">${this.totalClearedLines}</span>
          <span class="stat-text">Lines Cleared</span>
        </div>
        <div class="stat">
          <span class="stat-number">${this.level}</span>
          <span class="stat-text">Level Reached</span>
        </div>
      </div>
      <button id="restart-button" class="restart-button">PLAY AGAIN</button>
    `;

    overlay.classList.remove('hidden');

    setTimeout(() => {
      const restartBtn = document.getElementById('restart-button');
      if (restartBtn) restartBtn.addEventListener('click', () => this.restart());
    }, 0);
  }

  restart() {
    const overlay = document.getElementById('game-overlay');
    overlay.classList.add('hidden');

    this.board = Array.from({ length: this.boardHeight }, () => Array(this.boardWidth).fill(0));

    this.queue = new Queue();
    this.fillQueue();
    this.currentPiece = this.queue.dequeue();
    this.nextPiece = this.queue.peek();

    this.pieceHeight = this.currentPiece.shape.length;
    this.position = { x: 3, y: -this.pieceHeight };

    this.factor = 1.0;
    this.dropInterval = BASE_DROP_INTERVAL * this.factor;

    this.totalClearedLines = 0;
    this.score = 0;
    this.level = 1;

    this.isPaused = false;
    this.isGameOver = false;

    this.updateUI();

    if (this.soundManager) this.soundManager.restartBackground();
  }

  resetPiece() {
    this.currentPiece = this.nextPiece;

    // Start piece above the board (negative y) so it appears gradually
    this.pieceHeight = this.currentPiece.shape.length;
    this.position = { x: 3, y: -this.pieceHeight };

    this.lockTimer = 0;
    this.lockPending = false;

    if (this.checkCollision(0, 0)) {
      this.showGameOver();
      return;
    }

    this.queue.dequeue();
    this.queue.enqueue(this.randomPiece());
    this.nextPiece = this.queue.peek();
  }

  adjustSpeed() {
    const newLevel = Math.floor(this.totalClearedLines / 10) + 1;

    if (newLevel !== this.level) {
      this.level = newLevel;
      this.soundManager.playNextLevelSound();
      this.updateBackgroundMusic();
    }

    this.factor = Math.max(0.1, 1.0 - (this.level - 1) * 0.08);
    this.dropInterval = BASE_DROP_INTERVAL * this.factor;
  }

  clearFullLines() {
    let linesCleared = 0;

    for (let y = this.boardHeight - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 0)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.boardWidth).fill(0));

        y++;
        linesCleared++;
      }
    }

    if (linesCleared > 0) {
      if (this.soundManager) {
        this.soundManager.playLineClear();
      }

      this.totalClearedLines += linesCleared;
      const lineScores = [0, 100, 300, 500, 800];

      this.score += lineScores[linesCleared] * this.level;
      this.adjustSpeed();
      this.updateUI();
    }
  }

  updateUI() {
    const scoreDisplay = document.getElementById('score-display');
    const linesDisplay = document.getElementById('lines-display');
    const levelDisplay = document.getElementById('level-display');

    if (scoreDisplay) scoreDisplay.textContent = this.score;
    if (linesDisplay) linesDisplay.textContent = this.totalClearedLines;
    if (levelDisplay) levelDisplay.textContent = this.level;
  }

  mergePiece() {
    const { shape, color } = this.currentPiece;

    shape.forEach((row, y) =>
      row.forEach((v, x) => {
        if (v) {
          const boardY = this.position.y + y;
          const boardX = this.position.x + x;

          if (boardY >= 0 && boardY < this.boardHeight) {
            this.board[boardY][boardX] = color;
          }
        }
      })
    );

    this.clearFullLines();

    // Check if blocks are touching the top after merge - game over condition
    if (this.checkTopCollision()) {
      this.showGameOver();
      return;
    }

    // Update background music based on board state
    this.updateBackgroundMusic();
  }

  update(deltaTime) {
    if (this.isPaused || this.isGameOver) return;

    this.dropCounter += deltaTime;

    if (this.dropCounter > this.dropInterval) {
      this.position.y++;

      if (this.checkCollision(0, 0)) {
        this.position.y--;
        this.lockPending = true;
      } else {
        this.lockPending = false;
      }

      this.dropCounter = 0;
    }

    if (this.lockPending) {
      this.lockTimer += deltaTime;

      if (this.lockTimer >= this.lockDelay) {
        this.mergePiece();
        this.resetPiece();
      }
    } else {
      this.lockTimer = 0;
    }
  }

  drawBoard() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const s = this.blockSize;

    // Draw placed blocks first
    for (let y = 0; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        const cell = this.board[y][x];

        if (cell !== 0) {
          this.ctx.fillStyle = cell;
          this.ctx.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
        }
      }
    }

    // Draw grid lines on top
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1.5;

    for (let y = 0; y <= this.boardHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * s);
      this.ctx.lineTo(this.boardWidth * s, y * s);
      this.ctx.stroke();
    }

    for (let x = 0; x <= this.boardWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * s, 0);
      this.ctx.lineTo(x * s, this.boardHeight * s);
      this.ctx.stroke();
    }
  }

  getGhostPosition() {
    let ghostY = this.position.y;

    // Move down until collision
    while (!this.checkCollision(0, ghostY - this.position.y + 1)) {
      ghostY++;
    }

    return ghostY;
  }

  drawGhostPiece() {
    const { shape } = this.currentPiece;
    const s = this.blockSize;
    const ghostY = this.getGhostPosition();

    // Don't draw ghost if it's at the same position as current piece
    if (ghostY === this.position.y) return;

    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;

    shape.forEach((row, y) =>
      row.forEach((v, x) => {
        if (v) {
          const posX = (this.position.x + x) * s;
          const posY = (ghostY + y) * s;

          // Draw outline rectangle
          this.ctx.strokeRect(posX + 1, posY + 1, s - 3, s - 3);
        }
      })
    );
  }

  drawPiece() {
    const { shape, color } = this.currentPiece;
    const s = this.blockSize;

    this.ctx.fillStyle = color;

    shape.forEach((row, y) =>
      row.forEach((v, x) => {
        if (v) this.ctx.fillRect((this.position.x + x) * s + 1, (this.position.y + y) * s + 1, s - 2, s - 2);
      })
    );
  }

  draw() {
    this.drawBoard();
    this.drawGhostPiece();
    this.drawPiece();
  }

  loop(time = 0) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  }
}
