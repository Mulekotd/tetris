import { KEYS } from '../utils/constants.js';

export class InputHandler {
  constructor(game) {
    this.game = game;
    this.isListening = false;
  }

  listen() {
    if (this.isListening) return;

    window.addEventListener('keydown', e => this.handleKeyDown(e));
    this.isListening = true;
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();
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
      case KEYS.RESTART.includes(key):
        this.game.restart();
        break;
    }
  }

  move(dir) {
    if (!this.game.checkCollision(dir, 0)) {
      this.game.position.x += dir;
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
      }
    }

    this.game.lockTimer = 0;
  }
}
