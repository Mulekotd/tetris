import { KEYS } from '../utils/constants.js';

export class InputHandler {
  constructor(game, gameManager) {
    this.game = game;
    this.gameManager = gameManager;

    // Touch state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.lastTapTime = 0;
    this.isTouchHolding = false;
    this.touchHoldTimer = null;
    this.softDropInterval = null;
    this.hasMoved = false;

    // Touch thresholds
    this.swipeThreshold = 30;
    this.holdThreshold = 150;
    this.doubleTapThreshold = 300;
  }

  listen() {
    window.addEventListener('keydown', e => this.handleKeyDown(e));

    // Touch events
    const gameCanvas = document.getElementById('game-layer');
    if (gameCanvas) {
      gameCanvas.addEventListener('touchstart', e => this.handleTouchStart(e), { passive: false });
      gameCanvas.addEventListener('touchmove', e => this.handleTouchMove(e), { passive: false });
      gameCanvas.addEventListener('touchend', e => this.handleTouchEnd(e), { passive: false });
      gameCanvas.addEventListener('touchcancel', e => this.handleTouchCancel(e), { passive: false });
    }
  }

  handleTouchStart(e) {
    if (!this.gameManager.isStarted || this.game.isGameOver || this.game.isPaused) return;
    e.preventDefault();

    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    this.hasMoved = false;

    // Start hold timer for soft drop
    this.touchHoldTimer = setTimeout(() => {
      if (!this.hasMoved) {
        this.isTouchHolding = true;
        this.startSoftDropRepeat();
      }
    }, this.holdThreshold);
  }

  handleTouchMove(e) {
    if (!this.gameManager.isStarted || this.game.isGameOver || this.game.isPaused) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    // Horizontal swipe detection
    if (Math.abs(deltaX) > this.swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      this.hasMoved = true;
      this.clearHoldTimer();

      if (deltaX > 0) {
        this.move(1);
      } else {
        this.move(-1);
      }

      // Reset start position for continuous movement
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    }
  }

  handleTouchEnd(e) {
    if (!this.gameManager.isStarted || this.game.isGameOver || this.game.isPaused) return;
    e.preventDefault();

    this.clearHoldTimer();
    this.stopSoftDropRepeat();

    const touchDuration = Date.now() - this.touchStartTime;
    const currentTime = Date.now();

    // If it was a hold (soft drop), don't process as tap
    if (this.isTouchHolding) {
      this.isTouchHolding = false;
      return;
    }

    // If piece was moved, don't process as tap
    if (this.hasMoved) {
      return;
    }

    // Quick tap (not a hold)
    if (touchDuration < this.holdThreshold) {
      // Check for double tap (hard drop)
      if (currentTime - this.lastTapTime < this.doubleTapThreshold) {
        this.hardDrop();
        this.lastTapTime = 0;
      } else {
        // Single tap - rotate
        this.lastTapTime = currentTime;
        // Delay rotation to check for double tap
        setTimeout(() => {
          if (this.lastTapTime === currentTime) {
            this.rotate();
          }
        }, this.doubleTapThreshold);
      }
    }
  }

  handleTouchCancel(e) {
    this.clearHoldTimer();
    this.stopSoftDropRepeat();
    this.isTouchHolding = false;
    this.hasMoved = false;
  }

  clearHoldTimer() {
    if (this.touchHoldTimer) {
      clearTimeout(this.touchHoldTimer);
      this.touchHoldTimer = null;
    }
  }

  startSoftDropRepeat() {
    // Initial soft drop
    this.softDrop();

    // Continue soft drop while holding
    this.softDropInterval = setInterval(() => {
      if (this.isTouchHolding) {
        this.softDrop();
      }
    }, 50);
  }

  stopSoftDropRepeat() {
    if (this.softDropInterval) {
      clearInterval(this.softDropInterval);
      this.softDropInterval = null;
    }
  }

  handleKeyDown(e) {
    // Block all inputs if game hasn't started
    if (!this.gameManager.isStarted) return;

    // Disable inputs if game is over
    if (this.game.isGameOver) return;

    const key = e.key.toLowerCase();

    if (KEYS.PAUSE.includes(key)) {
      this.game.togglePause();
      return;
    }

    if (this.game.isPaused) return;

    switch (true) {
      case KEYS.LEFT.includes(key):
        this.move(-1);
        break;
      case KEYS.RIGHT.includes(key):
        this.move(1);
        break;
      case KEYS.DOWN.includes(key):
        this.softDrop();
        break;
      case KEYS.ROTATE.includes(key):
        e.preventDefault();
        this.rotate();
        break;
      case KEYS.HARD_DROP.includes(key):
        e.preventDefault();
        this.hardDrop();
        break;
      case KEYS.RESTART.includes(key):
        this.game.restart();
        break;
    }
  }

  applyGravity() {
    while (!this.game.checkCollision(0, 1)) {
      this.game.position.y++;
    }

    if (this.game.checkCollision(0, 0)) {
      this.game.lockPending = true;
    } else {
      this.game.lockPending = false;
    }
  }

  move(dir) {
    if (!this.game.checkCollision(dir, 0)) {
      this.game.position.x += dir;

      if (this.game.lockPending) {
        this.applyGravity();
      }

      this.game.lockTimer = 0;
    }
  }

  softDrop() {
    if (!this.game.checkCollision(0, 1)) {
      this.game.position.y++;
      this.game.score += 1;

      this.game.updateUI();
    } else {
      this.game.lockPending = true;
    }
  }

  hardDrop() {
    let dropDistance = 0;

    while (!this.game.checkCollision(0, dropDistance + 1)) {
      dropDistance++;
    }

    if (dropDistance > 0) {
      this.game.position.y += dropDistance;
      this.game.score += dropDistance * 2;

      this.game.mergePiece();
      this.game.resetPiece();

      this.game.updateUI();
    }
  }

  rotate() {
    const { shape } = this.game.currentPiece;

    const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
    const oldShape = this.game.currentPiece.shape;

    this.game.currentPiece.shape = rotated;

    if (this.game.checkCollision(0, 0)) {
      const kickTests = [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-2, 0],
        [2, 0],
        [0, -1],
        [-1, -1],
        [1, -1]
      ];

      let rotatedSuccessfully = false;

      for (let [x, y] of kickTests) {
        if (!this.game.checkCollision(x, y)) {
          this.game.position.x += x;
          this.game.position.y += y;

          rotatedSuccessfully = true;
          break;
        }
      }

      if (!rotatedSuccessfully) {
        this.game.currentPiece.shape = oldShape;
        return;
      }
    }

    if (this.game.lockPending) {
      this.applyGravity();
    }

    this.game.lockTimer = 0;
  }
}
