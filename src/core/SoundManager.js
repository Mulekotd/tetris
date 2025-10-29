export class SoundManager {
  constructor() {
    this.bgMusic = null;
  }

  load() {
    this.bgMusic = new Audio('./src/assets/audio/bg_music.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.4;
  }

  playBackground() {
    if (!this.bgMusic) this.load();

    const play = this.bgMusic.play();

    if (play !== undefined) {
      play.catch(() => {
        console.warn('Autoplay blocked until user interacts.');
      });
    }
  }

  stopBackground() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  restartBackground() {
    this.stopBackground();
    this.playBackground();
  }
}
