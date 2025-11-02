import { BLOCK_SIZE } from '../utils/constants.js';

export class UIManager {
  constructor() {
    this.nextPieceCanvas = null;
    this.nextPieceCtx = null;

    this.scoreDisplay = null;
    this.linesDisplay = null;
    this.levelDisplay = null;

    this.overlay = null;
    this.overlayContent = null;

    this.animationFrameId = null;
  }

  init() {
    // Initialize next piece canvas
    this.nextPieceCanvas = document.getElementById('next-piece-canvas');
    
    if (this.nextPieceCanvas) {
      this.nextPieceCtx = this.nextPieceCanvas.getContext('2d', { alpha: false });
    }

    // Initialize display elements
    this.scoreDisplay = document.getElementById('score-display');
    this.linesDisplay = document.getElementById('lines-display');
    this.levelDisplay = document.getElementById('level-display');

    // Initialize overlay elements
    this.overlay = document.getElementById('game-overlay');

    if (this.overlay) {
      this.overlayContent = this.overlay.querySelector('.overlay-content');
    }
  }

  // Update score, lines, and level displays
  updateStats(score, lines, level) {
    if (this.scoreDisplay) this.scoreDisplay.textContent = score;
    if (this.linesDisplay) this.linesDisplay.textContent = lines;
    if (this.levelDisplay) this.levelDisplay.textContent = level;
  }

  // Draw next piece preview
  drawNextPiece(nextPiece) {
    if (!this.nextPieceCanvas || !this.nextPieceCtx) return;

    const ctx = this.nextPieceCtx;
    const canvas = this.nextPieceCanvas;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (nextPiece) {
      const { shape, color } = nextPiece;

      const offsetX = (canvas.width - shape[0].length * BLOCK_SIZE) / 2;
      const offsetY = (canvas.height - shape.length * BLOCK_SIZE) / 2;

      ctx.fillStyle = color;

      shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) {
            ctx.fillRect(offsetX + x * BLOCK_SIZE, offsetY + y * BLOCK_SIZE, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          }
        });
      });
    }
  }

  // Show pause overlay
  showPause() {
    if (!this.overlay || !this.overlayContent) return;

    this.overlayContent.innerHTML = `
      <h1>PAUSED</h1>
      <p>Press P to resume</p>
    `;

    this.overlay.classList.remove('hidden');
  }

  // Hide overlay
  hideOverlay() {
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
  }

  // Show game over screen
  showGameOver(score, lines, level, onRestart) {
    if (!this.overlay || !this.overlayContent) return;

    this.overlayContent.innerHTML = `
      <h1>GAME OVER</h1>
      <div class="game-over-score">
        <div class="final-score">${score}</div>
        <div class="score-label">Final Score</div>
      </div>
      <div class="game-over-stats">
        <div class="stat">
          <span class="stat-number">${lines}</span>
          <span class="stat-text">Lines Cleared</span>
        </div>
        <div class="stat">
          <span class="stat-number">${level}</span>
          <span class="stat-text">Level Reached</span>
        </div>
      </div>
      <button id="restart-button" class="button">PLAY AGAIN</button>
    `;

    this.overlay.classList.remove('hidden');

    // Attach restart handler
    setTimeout(() => {
      const restartBtn = document.getElementById('restart-button');

      if (restartBtn && onRestart) {
        restartBtn.addEventListener('click', onRestart);
      }
    }, 6000);
  }

  loop(game) {
    if (!game) return;

    this.drawNextPiece(game.nextPiece);
    this.animationFrameId = requestAnimationFrame(() => this.loop(game));
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
