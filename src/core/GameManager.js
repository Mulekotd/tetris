import { Tetris } from './Tetris.js';
import { InputHandler } from './InputHandler.js';
import { SoundManager } from './SoundManager.js';
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE } from '../utils/constants.js';

// Next Piece Preview
function drawNextPiece(game) {
  const canvas = document.getElementById('next-piece-canvas');

  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (game.nextPiece) {
    const { shape, color } = game.nextPiece;

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

  requestAnimationFrame(() => drawNextPiece(game));
}

export class GameManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;

    this.game = null;
    this.isStarted = false;

    this.inputHandler = null;
    this.soundManager = new SoundManager();
  }

  init() {
    this.canvas = document.getElementById('game-layer');
    this.ctx = this.canvas.getContext('2d', { alpha: false });

    this.setupCanvas();
    this.setupGame();

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.game.resize(this.canvas);
    });

    // Setup start button
    const startButton = document.getElementById('start-button');
    const overlay = document.getElementById('game-overlay');

    startButton.addEventListener('click', () => {
      if (!this.isStarted) {
        this.soundManager.playBackground();
        this.start();

        overlay.classList.add('hidden');
        this.isStarted = true;
      }
    });
  }

  setupCanvas() {
    // Calculate height based on container
    const container = document.querySelector('.game-container');
    const containerHeight = container.offsetHeight;

    // Use container height for board
    const maxHeight = containerHeight;
    const blockSize = Math.ceil(maxHeight / BOARD_HEIGHT);

    const displayWidth = blockSize * BOARD_WIDTH;
    const displayHeight = blockSize * BOARD_HEIGHT;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  setupGame() {
    this.game = new Tetris(this.canvas, BOARD_WIDTH, BOARD_HEIGHT, this.soundManager);
    this.inputHandler = new InputHandler(this.game, this);
    this.inputHandler.listen();
  }

  start() {
    this.game.loop();
    drawNextPiece(this.game);
  }
}
