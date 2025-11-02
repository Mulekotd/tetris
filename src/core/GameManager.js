import { BOARD_WIDTH, BOARD_HEIGHT } from '../utils/constants.js';

import { Tetris } from './Tetris.js';
import { InputHandler } from './InputHandler.js';
import { SoundManager } from './SoundManager.js';
import { UIManager } from './UIManager.js';

export class GameManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;

    this.game = null;
    this.isStarted = false;
    this.isLoading = true;

    this.inputHandler = null;
    this.soundManager = new SoundManager();
    this.uiManager = new UIManager();

    this.loadingScreen = document.getElementById('loading-screen');
    this.gameContainer = document.getElementById('game-container');
  }

  init() {
    this.canvas = document.getElementById('game-layer');
    this.ctx = this.canvas.getContext('2d', { alpha: false });

    this.finishLoading();

    // Setup canvas with correct dimensions
    this.setupCanvas();

    // Initialize UI Manager
    this.uiManager.init();

    this.setupGame();

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.game.resize(this.canvas);
    });

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

  finishLoading() {
    this.isLoading = false;

    // Hide loading screen
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden');
    }

    // Show game container
    if (this.gameContainer) {
      this.gameContainer.classList.remove('hidden');
    }
  }

  setupCanvas() {
    const container = document.querySelector('.game-container');
    const containerHeight = container.offsetHeight;

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
    this.game = new Tetris(this.canvas, BOARD_WIDTH, BOARD_HEIGHT, this.soundManager, this.uiManager);
    this.inputHandler = new InputHandler(this.game, this);
    this.inputHandler.listen();
  }

  start() {
    this.game.loop();
    this.uiManager.loop(this.game);
  }
}
