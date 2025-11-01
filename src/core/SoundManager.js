export class SoundManager {
  constructor() {
    this.bgMusic = null;
    this.bgMusicFast = null;
    this.currentBgMusic = null;

    this.pauseSound = null;
    this.gameOverSound = null;
    this.lineClearSound = null;
    this.nextLevelSound = null;

    this.isPaused = false;
  }

  load() {
    // Background music (normal)
    this.bgMusic = new Audio('./src/assets/audio/bgm.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.2;

    // Background music (fast)
    this.bgMusicFast = new Audio('./src/assets/audio/bgm-fast.mp3');
    this.bgMusicFast.loop = true;
    this.bgMusicFast.volume = 0.4;

    // Game over sound
    this.gameOverSound = new Audio('./src/assets/audio/game-over.mp3');
    this.gameOverSound.loop = false;
    this.gameOverSound.volume = 0.4;

    // Line clear sound
    this.lineClearSound = new Audio('./src/assets/audio/line-clear.mp3');
    this.lineClearSound.loop = false;
    this.lineClearSound.volume = 0.4;

    // Next level sound
    this.nextLevelSound = new Audio('./src/assets/audio/next-level.mp3');
    this.nextLevelSound.loop = false;
    this.nextLevelSound.volume = 0.6;

    // Pause sound
    this.pauseSound = new Audio('./src/assets/audio/pause.mp3');
    this.pauseSound.loop = false;
    this.pauseSound.volume = 0.2;

    this.currentBgMusic = this.bgMusic;
  }

  playBackground() {
    if (!this.bgMusic) this.load();
    this.currentBgMusic = this.bgMusic;
    this.isPaused = false;
    this.bgMusic.play();
  }

  pauseBackground() {
    if (this.currentBgMusic && !this.currentBgMusic.paused) {
      this.currentBgMusic.pause();
      this.isPaused = true;
    }
  }

  resumeBackground() {
    if (this.currentBgMusic && this.isPaused) {
      this.currentBgMusic.play();
      this.isPaused = false;
    }
  }

  stopBackground() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
    if (this.bgMusicFast) {
      this.bgMusicFast.pause();
      this.bgMusicFast.currentTime = 0;
    }
  }

  restartBackground() {
    this.stopBackground();
    this.playBackground();
  }

  switchToFastMusic() {
    if (!this.bgMusicFast || this.currentBgMusic === this.bgMusicFast) return;

    this.bgMusic.pause();

    this.bgMusicFast.currentTime = 0;
    this.bgMusicFast.play();

    this.currentBgMusic = this.bgMusicFast;
    this.isPaused = false;
  }

  switchToNormalMusic() {
    if (!this.bgMusic || this.currentBgMusic === this.bgMusic) return;

    this.bgMusicFast.pause();

    this.bgMusic.currentTime = 0;
    this.bgMusic.play();

    this.currentBgMusic = this.bgMusic;
    this.isPaused = false;
  }

  playGameOver() {
    if (!this.gameOverSound) this.load();

    this.stopBackground();

    this.gameOverSound.currentTime = 0;
    this.gameOverSound.play();
  }

  playPauseSound() {
    if (!this.pauseSound) this.load();
    this.pauseSound.currentTime = 0;
    this.pauseSound.play();
  }

  playLineClear() {
    if (!this.lineClearSound) this.load();
    this.lineClearSound.currentTime = 0;
    this.lineClearSound.play();
  }

  playNextLevelSound() {
    if (!this.nextLevelSound) this.load();
    this.nextLevelSound.currentTime = 0;
    this.nextLevelSound.play();
  }
}
