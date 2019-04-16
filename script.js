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

// Set beginning score to zero.
let score = 0;

// Utility functions
const drawBorder = () => {
  ctx.fillStyle = 'Gray';
  ctx.fillRect(0, 0, width, blockSize);
  ctx.fillRect(0, height - blockSize, width, blockSize);
  ctx.fillRect(0, 0, blockSize, height);
  ctx.fillRect(width - blockSize, 0 , blockSize, height);
};

const drawScore = () => {
  ctx.font = '32px Cute Font';
  ctx.fillStyle = 'Black';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${score}`, blockSize + 3, blockSize - 3);
};

const gameOver = () => {
  clearInterval(intervalId);
  ctx.font = '80px Creepster';
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
    const drawSegment = (col, row, color) => {
      const x = col * blockSize;
      const y = row * blockSize;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, blockSize, blockSize);
    };

    this.segments.forEach((segment, i) => {
      if (i === 0) {
        drawSegment(segment.col, segment.row, '#ffe500');
      } else if (i % 2 === 0) {
        drawSegment(segment.col, segment.row, '#dd3300');
      } else {
        drawSegment(segment.col, segment.row, 'Green');
      }
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
      snake.segments.forEach((segment) => {
        if (apple.position.col === segment.col && apple.position.row === segment.row) {
          apple.move();
        }
      });
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
    const x = this.position.col * blockSize + blockSize / 2;
    const y = this.position.row * blockSize + blockSize / 2;
    ctx.fillStyle = 'LimeGreen';
    ctx.beginPath();
    ctx.arc(x, y, blockSize / 2, 0, Math.PI * 2, false);
    ctx.fill();
  }
  move() {
    const randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    const randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
    this.position = new Block(randomCol, randomRow);
  }
  // Moves apple to snake tail to test logic in
  badMove() {
    const badCol = snake.segments[snake.segments.length - 1].col;
    const badRow = snake.segments[snake.segments.length - 1].row;
    this.position = new Block(badCol, badRow);
  }
}

// Create the snake and apple.
const snake = new Snake();
const apple = new Apple();

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