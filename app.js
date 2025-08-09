// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game state
let gameTime = 0;
let gameState = 'playing'; // 'playing', 'win', or 'gameOver'
let winTimer = 0;
const winScreenDuration = 5000; // 5 seconds in milliseconds
let lastTimestamp = performance.now();
const gameDuration = 30000; // 30 seconds game duration
let gameTimer = gameDuration;
let currentLevel = 1;
const coinsPerLevel = 5; // Additional coins per level

// Function to reset game
function resetGame(nextLevel = false) {
    // Update coins based on current level
    if (nextLevel) {
        // Level is already incremented, just update coins
        totalCoins = 10 + (currentLevel - 1) * coinsPerLevel;
        // Cycle through characters
        currentCharacter = characters[(currentLevel - 1) % characters.length];
    } else {
        currentLevel = 1;  // Reset to level 1
        totalCoins = 10;   // Reset to initial coins
        currentCharacter = characters[0]; // Reset to horse
    }

    // Reset game timer
    gameTimer = gameDuration;
    lastTimestamp = performance.now();

    // Reset player
    player.x = 50;
    player.y = canvas.height - 100;
    player.velocityY = 0;
    player.isJumping = false;
    player.jumpsRemaining = 1;
    player.hasDoubleJump = false;
    player.score = 0;

    // Reset coins
    coins.length = 0;
    const powerUpIndex = Math.floor(Math.random() * totalCoins);

    for (let i = 0; i < totalCoins; i++) {
        const isThisPowerUp = i === powerUpIndex;
        const coinY = isThisPowerUp 
            ? canvas.height - 100 - (Math.random() * singleJumpHeight)
            : canvas.height - 100 - (Math.random() * maxJumpHeight);

        coins.push({
            x: Math.random() * (canvas.width - coinWidth),
            y: coinY,
            width: isThisPowerUp ? coinWidth * 2 : coinWidth,
            height: isThisPowerUp ? coinHeight * 2 : coinHeight,
            collected: false,
            isPowerUp: isThisPowerUp
        });
    }

    gameState = 'playing';
}

// Game variables
const player = {
    x: 50,  // Starting position from left
    y: canvas.height - 100,  // Starting position from top
    width: 50,
    height: 50,
    jumpForce: -12,
    gravity: 0.6,
    velocityY: 0,
    isJumping: false,
    jumpsRemaining: 1,  // Start with single jump
    hasDoubleJump: false,  // Double jump power-up status
    score: 0
};

// Coin variables
const coins = [];
const coinWidth = 16;
const coinHeight = 16;
let totalCoins = 10; // Starting number of coins

// Load images
const horseImg = document.getElementById('horseImage');
const turtleImg = document.getElementById('turtleImage');
const catImg = document.getElementById('catImage');
const coinImg = document.getElementById('coinImage');

// Character cycling
const characters = [
    { img: horseImg, name: 'Horse', speed: 5 },
    { img: turtleImg, name: 'Turtle', speed: 4 },
    { img: catImg, name: 'Cat', speed: 6 }
];
let currentCharacter = characters[0]; // Start with horse

// Calculate maximum jump height (using physics formula: h = v0^2 / (2g))
const maxJumpHeight = (player.jumpForce * player.jumpForce) / (2 * player.gravity);
const singleJumpHeight = maxJumpHeight * 0.7; // Reduce to 70% of max height for safety

// Initialize coins in random positions
const powerUpIndex = Math.floor(Math.random() * totalCoins); // Randomly select one coin to be the power-up

for (let i = 0; i < totalCoins; i++) {
    const isThisPowerUp = i === powerUpIndex;
    const minHeight = 50; // Minimum height from ground
    const maxHeight = isThisPowerUp ? singleJumpHeight : maxJumpHeight;
    const coinY = canvas.height - 100 - minHeight - (Math.random() * (maxHeight - minHeight)); // Ensure minimum height from ground

    coins.push({
        x: Math.random() * (canvas.width - coinWidth),
        y: coinY,
        width: isThisPowerUp ? coinWidth * 2 : coinWidth,  // Double size for power-up
        height: isThisPowerUp ? coinHeight * 2 : coinHeight,
        collected: false,
        isPowerUp: isThisPowerUp  // Mark as power-up coin
    });
}

// Input handling
const keys = {
    left: false,
    right: false,
    space: false
};

// Event listeners for keyboard
window.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'Space':
            keys.space = true;
            if (player.jumpsRemaining > 0) {
                player.velocityY = player.jumpForce;
                player.isJumping = true;
                player.jumpsRemaining--;
            }
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'Space':
            keys.space = false;
            break;
    }
});

// Game loop
function update() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimestamp;
    lastTimestamp = currentTime;

    if (gameState === 'playing') {
        // Update game timer
        gameTimer -= deltaTime;
        if (gameTimer <= 0) {
            gameTimer = 0;
            gameState = 'gameOver';
            winTimer = 0;
            return;
        }
    }

    if (gameState === 'win' || gameState === 'gameOver') {
        // Update win timer
        winTimer += deltaTime;
        
        // Handle restart
        if (winTimer >= winScreenDuration && keys.space) {
            if (gameState === 'win') {
                currentLevel++;  // Increment level before reset
                resetGame(true);  // Reset with next level
            } else {
                currentLevel = 1;  // Reset to level 1 if game over
                resetGame(false);
            }
            return;
        }
        return;

        // Only allow restart after 5 seconds
        if (winTimer >= winScreenDuration && keys.space) {
            resetGame();
        }
        return;
    }

    // Move player left/right
    if (keys.left && player.x > 0) {
        player.x -= currentCharacter.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += currentCharacter.speed;
    }

    // Apply gravity and jumping
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Ground collision
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isJumping = false;
        player.jumpsRemaining = player.hasDoubleJump ? 2 : 1;  // Two jumps if power-up collected, otherwise one
    }

    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            if (coin.isPowerUp) {
                player.hasDoubleJump = true;  // Enable double jump
            }
            player.score += 1;

            // Check if all coins are collected
            if (coins.every(c => c.collected)) {
                gameState = 'win';
                winTimer = 0;
                lastTimestamp = performance.now();
            }
        }
    });
}

// Render game
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'win' || gameState === 'gameOver') {
        // Draw end screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        const text = gameState === 'win' ? 'Level ' + currentLevel + ' Complete!' : 'Game Over!';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 60);

        // Add more contrast to end screen text
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2 - 60);

        // Show score
        ctx.font = '24px Arial';
        ctx.fillText('Final Score: ' + player.score, canvas.width / 2, canvas.height / 2 - 20);

        // Show next level info
        if (gameState === 'win') {
            ctx.font = 'bold 24px Arial';
            ctx.fillText('Next Level: ' + (currentLevel + 1), canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('Coins to collect: ' + (10 + currentLevel * coinsPerLevel), canvas.width / 2, canvas.height / 2 + 60);
        }
        
        // Show restart prompt
        if (winTimer >= winScreenDuration) {
            ctx.fillText('Press SPACE to play again', canvas.width / 2, canvas.height / 2 + 100);
        } else {
            const remainingSeconds = Math.ceil((winScreenDuration - winTimer) / 1000);
            ctx.fillText('New game in ' + remainingSeconds + '...', canvas.width / 2, canvas.height / 2 + 100);
        }
        
        ctx.textAlign = 'left'; // Reset text align for the rest of the drawing
        return;
    }
    
    // Draw horse
    // Draw coins
    coins.forEach(coin => {
        if (!coin.collected) {
            if (coin.isPowerUp) {
                // Make power-up coin blink
                ctx.save();
                const blinkRate = 0.008; // Speed of blinking
                const opacity = (Math.sin(gameTime * blinkRate) + 1) / 2; // Oscillate between 0 and 1
                ctx.globalAlpha = opacity;
            }
            ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);
            if (coin.isPowerUp) {
                ctx.restore();
            }
        }
    });

    // Draw player character
    ctx.save();
    if (keys.left) {
        // Flip character when moving left
        ctx.scale(-1, 1);
        ctx.drawImage(currentCharacter.img, -player.x - player.width, player.y, player.width, player.height);
    } else {
        // Normal drawing when moving right or standing still
        ctx.drawImage(currentCharacter.img, player.x, player.y, player.width, player.height);
    }
    ctx.restore();

    // Draw score, level, and timer with better visibility
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    
    // Draw score with shadow
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 4;
    ctx.fillText('Score: ' + player.score, 10, 30);
    
    // Draw current character name
    ctx.fillText(currentCharacter.name, 10, 60);
    
    // Draw level
    ctx.fillText('Level: ' + currentLevel, canvas.width / 2 - 50, 30);
    
    // Draw timer with shadow
    const timeLeft = Math.max(0, Math.ceil(gameTimer / 1000));
    const timerText = 'Time: ' + timeLeft + 's';
    ctx.fillText(timerText, canvas.width - 120, 30);
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Game loop
function gameLoop() {
    gameTime++;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
