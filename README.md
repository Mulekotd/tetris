# Tetris Game

## 📌 Overview

A modern implementation of the classic Tetris game built with vanilla JavaScript. This project features smooth gameplay mechanics, progressive difficulty levels, score tracking, and an elegant user interface with background music.

## 🎮 Play Online

The game is live and playable at: **[https://mulekotd.github.io/tetris/](https://mulekotd.github.io/tetris/)**

## 🛠️ Selected Technologies

### 1. JavaScript (ES6+)

Used as the main programming language to implement game logic, rendering, and user interactions with modern module syntax.

![JavaScript](https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/480px-Unofficial_JavaScript_logo_2.svg.png)

---

### 2. HTML5 Canvas

Used for rendering the game board, tetromino pieces, and all visual elements with pixel-perfect graphics.

![HTML5](https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/512px-HTML5_logo_and_wordmark.svg.png)

---

### 3. CSS3

Used for creating a modern, responsive UI with gradient backgrounds, smooth animations, and polished visual design.

![CSS3](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/CSS3_logo_and_wordmark.svg/363px-CSS3_logo_and_wordmark.svg.png)

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

Clone this repository to your local environment:

```bash
git clone https://github.com/Mulekotd/tetris.git
cd tetris
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### 3. Run the Development Server

Using npm:

```bash
npm run start
```

Or using yarn:

```bash
yarn start
```

The game will be available at `http://localhost:4173`

## 🎮 Controls

| Key   | Action                          |
| ----- | ------------------------------- |
| ↑     | Rotate piece                    |
| ← →   | Move piece left/right           |
| ↓     | Soft drop (move down faster)    |
| SPACE | Hard drop (move down instantly) |
| P     | Pause/Resume game               |
| R     | Restart game                    |

## 📁 Project Structure

```
.
├── build.js              # Build script
├── index.html            # Main HTML file
├── package.json          # Project dependencies
├── server.js             # Development server
├── public/
│   ├── favicon.ico       # Game icon
│   └── styles.css        # Main stylesheet
└── src/
    ├── main.js           # Application entry point
    ├── assets/
    │   └── audio/
    │       └── bg_music.mp3  # Background music
    ├── core/
    │   ├── GameManager.js    # Game initialization and coordination
    │   ├── InputHandler.js   # Keyboard input handling
    │   ├── SoundManager.js   # Audio management
    │   └── Tetris.js         # Core game logic
    └── utils/
        ├── constants.js      # Game constants and configurations
        └── structs/
            └── Queue.js      # Queue data structure for piece generation
```

## 🤝 Feedback and Contributions

We welcome feedback, suggestions, and contributions from the community!

If you have ideas for improvements or encounter any issues, please [open an issue](https://github.com/Mulekotd/tetris/issues) on GitHub.

## 📄 License

This project is open source and available for educational purposes.
