import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const buildDir = path.join(__dirname, 'dist');

if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true });
}

fs.mkdirSync(buildDir, { recursive: true });

const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  const items = fs.readdirSync(publicDir);

  items.forEach(item => {
    const srcPath = path.join(publicDir, item);
    const destPath = path.join(buildDir, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });

  console.log('Copied public/ contents to dist root');
}

// Copia pasta src
const srcDir = path.join(__dirname, 'src');
const srcDest = path.join(buildDir, 'src');

if (fs.existsSync(srcDir)) {
  copyDir(srcDir, srcDest);
  console.log('Copied src/');
}

fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(buildDir, 'index.html'));
console.log('Copied index.html');

console.log('Build completed!');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);

  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
