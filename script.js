// Set up canvas.
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Get the width and height from the canvas element.
const width = canvas.width;
const height = canvas.height;

// Width and height in block units.
const blockSize = 10;
const widthInBlocks = width / blockSize;
const heightInBlocks = height / blockSize;

// Utility functions
const drawBorder = () => {
  ctx.fillStyle = 'Gray';
  ctx.fillRect(0, 0, width, blockSize);
  ctx.fillRect(0, height - blockSize, width, blockSize);
  ctx.fillRect(0, 0, blockSize, height);
  ctx.fillRect(width - blockSize, 0 , blockSize, height);
};

const drawScore = () => {
  ctx.font = '20px Courier';
  ctx.fillStyle = 'Black';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${score}`, blockSize, blockSize);
};

const circle = (x, y, radius, fillCircle) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);

  if (fillCircle) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
};

const gameOver = () => {
  clearInterval(intervalId);
  ctx.font = '60px Courier';
  ctx.fillStyle = 'Black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', width / 2, height / 2);
};

class Block {
  constructor(col, row) {
    this.col = col;
    this.row = row;
  }
  drawSquare(color) {
    const x = this.col * blockSize;
    const y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
  }
  drawCircle(color) {
    const x = this.col * blockSize + blockSize / 2;
    const y = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(x, y, blockSize / 2, true);
  }
  equal(otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
  }
}

class Snake {
  constructor() {
    this.segments = [
      new Block(7, 5),
      new Block(6, 5),
      new Block(5, 5)
    ];
    this.direction = 'right';
    this.nextDirection = 'right';
  }
  draw() {
    this.segments.forEach((segment) => {
      segment.drawSquare('Blue');
    });
  }
  move() {
    const head = this.segments[0];
    let newHead;

    this.direction = this.nextDirection;

    // Create new head segment in the appropriate direction.
    if (this.direction === 'right') {
      newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === 'down') {
      newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === 'left') {
      newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === 'up') {
      newHead = new Block(head.col, head.row - 1);
    }

    // Check if the new head hit a wall or another snake segment...
    if (this.checkCollision(newHead)) {
      // ...End the game if it did.
      gameOver();
      return;
    }

    // If no collision, go ahead and add new head segment.
    this.segments.unshift(newHead);

    // If the new head hit the apple...
    if (newHead.equal(apple.position)) {
      // ...up the score by 1...
      score++;
      // ... move the apple...
      apple.move();
      // ... If not, just remove the last tail segment.
    } else {
      this.segments.pop();
    }
  }
  checkCollision(head) {
    const leftCollision = (head.col === 0);
    const topCollision = (head.row === 0);
    const rightCollision = (head.col === widthInBlocks - 1);
    const bottomCollision = (head.row === heightInBlocks - 1);

    const wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

    let selfCollision = false;

    this.segments.forEach((segment) => {
      if (head.equal(segment)) {
        selfCollision = true;
      }
    });

    return wallCollision || selfCollision;
  }
  setDirection(newDirection) {
    // If newDirection is an illegal turn, ignore it...
    if (this.direction === 'up' && newDirection === 'down') {
      return;
    } else if (this.direction === 'right' && newDirection === 'left') {
      return;
    } else if (this.direction === 'down' && newDirection === 'up') {
      return;
    } else if (this.direction === 'left' && newDirection === 'right') {
      return;
    }
    // ...Otherwise, set snake's nextDirection to the newDirection.
    this.nextDirection = newDirection;
  }
}

class Apple {
  constructor() {
    this.position = new Block(10, 10);
  }
  draw() {
    this.position.drawCircle('LimeGreen');
  }
  move() {
    const randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    const randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
    this.position = new Block(randomCol, randomRow);
  }
}

// Create the snake and apple.
const snake = new Snake();
const apple = new Apple();
// Set beginning score to zero.
let score = 0;

// Set up keyboard event handler for snake controls.
const directions = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
};

$('body').keydown((e) => {
  const newDirection = directions[e.keyCode];
  if (newDirection !== undefined) {
    snake.setDirection(newDirection);
  }
});

// Run game animation.
let intervalId = setInterval(() => {
  ctx.clearRect(0, 0, width, height);
  drawBorder();
  drawScore();
  snake.move();
  snake.draw();
  apple.draw();
}, 100);