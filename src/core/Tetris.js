import { Queue } from '../utils/structs/Queue.js';
import { BASE_DROP_INTERVAL, LOCK_DELAY } from '../utils/constants.js';

export class Tetris {
  constructor(canvas, boardWidth, boardHeight, soundManager = null) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: false });
    this.soundManager = soundManager;

    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;

    this.updateBlockSize();

    this.board = Array.from({ length: this.boardHeight }, () => Array(this.boardWidth).fill(0));

    this.pieces = {
      O: {
        shape: [
          [1, 1],
          [1, 1]
        ],
        color: '#FFD700'
      },
      I: { shape: [[1, 1, 1, 1]], color: '#00FFFF' },
      S: {
        shape: [
          [0, 1, 1],
          [1, 1, 0]
        ],
        color: '#FF0000'
      },
      Z: {
        shape: [
          [1, 1, 0],
          [0, 1, 1]
        ],
        color: '#32CD32'
      },
      L: {
        shape: [
          [1, 0, 0],
          [1, 1, 1]
        ],
        color: '#FFA500'
      },
      J: {
        shape: [
          [0, 0, 1],
          [1, 1, 1]
        ],
        color: '#FF69B4'
      },
      T: {
        shape: [
          [0, 1, 0],
          [1, 1, 1]
        ],
        color: '#800080'
      }
    };

    this.queue = new Queue();
    this.fillQueue();
    this.currentPiece = this.queue.dequeue();
    this.nextPiece = this.queue.peek();

    this.position = { x: 3, y: 0 };

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
  }

  updateBlockSize() {
    this.blockSize = this.canvas.width / (this.boardWidth * (window.devicePixelRatio || 1));
  }

  resize(newCanvas) {
    this.canvas = newCanvas;
    this.context = newCanvas.getContext('2d', { alpha: false });

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

        if (newX < 0 || newX >= this.boardWidth || newY >= this.boardHeight) return true;

        if (newY >= 0 && this.board[newY][newX] !== 0) return true;
      }
    }
    return false;
  }

  restart() {
    if (confirm('Game Over! Score: ' + this.score + '\n\nRestart?')) {
      this.board = Array.from({ length: this.boardHeight }, () => Array(this.boardWidth).fill(0));

      this.queue = new Queue();
      this.fillQueue();
      this.currentPiece = this.queue.dequeue();
      this.nextPiece = this.queue.peek();

      this.position = { x: 3, y: 0 };

      this.factor = 1.0;
      this.dropInterval = BASE_DROP_INTERVAL * this.factor;

      this.totalClearedLines = 0;
      this.score = 0;
      this.level = 1;

      this.updateUI();

      if (this.soundManager) this.soundManager.restartBackground();
    }
  }

  resetPiece() {
    this.currentPiece = this.nextPiece;
    this.queue.dequeue();
    this.queue.enqueue(this.randomPiece());
    this.nextPiece = this.queue.peek();

    this.position = { x: 3, y: 0 };

    this.lockTimer = 0;
    this.lockPending = false;

    if (this.checkCollision(0, 0)) this.restart();
  }

  adjustSpeed() {
    const newLevel = Math.floor(this.totalClearedLines / 10) + 1;

    if (newLevel !== this.level) {
      this.level = newLevel;
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

          if (boardY >= 0 && boardY < this.boardHeight) this.board[boardY][boardX] = color;
        }
      })
    );

    this.clearFullLines();
  }

  update(deltaTime) {
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
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const s = this.blockSize;

    for (let y = 0; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        const cell = this.board[y][x];

        if (cell !== 0) {
          this.context.fillStyle = cell;
          this.context.fillRect(x * s, y * s, s - 1, s - 1);
        }
      }
    }
  }

  drawPiece() {
    const { shape, color } = this.currentPiece;
    const s = this.blockSize;

    this.context.fillStyle = color;

    shape.forEach((row, y) =>
      row.forEach((v, x) => {
        if (v) this.context.fillRect((this.position.x + x) * s, (this.position.y + y) * s, s - 1, s - 1);
      })
    );
  }

  draw() {
    this.drawBoard();
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
