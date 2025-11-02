export class SoundManager {
  constructor() {
    this.sounds = {};
    this.currentBgMusic = null;
    this.isPaused = false;
    this.isLoaded = false;

    this.config = {
      bgMusic: { path: './src/assets/audio/bgm.mp3', loop: true, volume: 0.2 },
      bgMusicFast: { path: './src/assets/audio/bgm-fast.mp3', loop: true, volume: 0.4 },
      gameOver: { path: './src/assets/audio/game-over.mp3', loop: false, volume: 0.4 },
      lineClear: { path: './src/assets/audio/line-clear.mp3', loop: false, volume: 0.4 },
      nextLevel: { path: './src/assets/audio/next-level.mp3', loop: false, volume: 1.0 },
      pause: { path: './src/assets/audio/pause.mp3', loop: false, volume: 0.2 }
    };
  }

  load() {
    if (this.isLoaded) return;

    Object.entries(this.config).forEach(([key, config]) => {
      const audio = new Audio(config.path);
      audio.loop = config.loop;
      audio.volume = config.volume;
      this.sounds[key] = audio;
    });

    this.currentBgMusic = this.sounds.bgMusic;
    this.isLoaded = true;
  }

  ensureLoaded() {
    if (!this.isLoaded) this.load();
  }

  playSound(soundKey, restart = true) {
    this.ensureLoaded();

    const sound = this.sounds[soundKey];
    if (!sound) return;

    if (restart) sound.currentTime = 0;
    sound.play();
  }

  stopSound(soundKey) {
    const sound = this.sounds[soundKey];
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
  }

  // Background Music Control
  playBackground() {
    this.ensureLoaded();
    this.currentBgMusic = this.sounds.bgMusic;
    this.isPaused = false;
    this.sounds.bgMusic.play();
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
    this.stopSound('bgMusic');
    this.stopSound('bgMusicFast');
  }

  restartBackground() {
    this.stopBackground();
    this.playBackground();
  }

  switchBackgroundMusic(targetKey) {
    const target = this.sounds[targetKey];
    if (!target || this.currentBgMusic === target) return;

    // Pause current
    if (this.currentBgMusic) {
      this.currentBgMusic.pause();
    }

    // Play new
    target.currentTime = 0;
    target.play();

    this.currentBgMusic = target;
    this.isPaused = false;
  }

  switchToFastMusic() {
    this.switchBackgroundMusic('bgMusicFast');
  }

  switchToNormalMusic() {
    this.switchBackgroundMusic('bgMusic');
  }

  // Sound Effects
  playGameOver() {
    this.stopBackground();
    this.playSound('gameOver');
  }

  playPauseSound() {
    this.playSound('pause');
  }

  playLineClear() {
    this.playSound('lineClear');
  }

  playNextLevelSound() {
    this.playSound('nextLevel');
  }
}
