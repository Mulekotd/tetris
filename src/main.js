import { GameManager } from './core/GameManager.js';

window.addEventListener('load', () => {
  const gameManager = new GameManager();
  gameManager.init();
});
