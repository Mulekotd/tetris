import { KEYS } from '../utils/constants.js';

export class InputHandler {
  constructor(game, gameManager) {
    this.game = game;
    this.gameManager = gameManager;
  }

  listen() {
    window.addEventListener('keydown', e => this.handleKeyDown(e));
  }

  handleKeyDown(e) {
    // Block all inputs if game hasn't started
    if (!this.gameManager.isStarted) return;

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
