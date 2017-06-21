/*
    object superclass - handles methods and properties of in game items
*/
var object = function(x, y, speed, xMove, yMove, sprite) {

    //sprite
    this.sprite = sprite;

    this.start_x = x; //initial position
    this.start_y = y;
    this.x = x; //updated position
    this.y = y;
    this.xStart = xMove; //starting axes
    this.yStart = yMove;
    this.xMove = 0; //track movements
    this.yMove = 0;

    this.speed = speed; //speed of movement

};

//render object on canvas
object.prototype.render = function() {

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

};

// Move method to call in subclass updates
object.prototype.move = function(deltaTime) {
    // check if object is player
    if (this instanceof Player) {

        // discrete player movement (space-by-space) decoupled from deltaTime
        this.x += this.xMove * 101;
        this.y += this.yMove * 83;

    } else {
        //detect edge of screen for reset of enemy
        if (this.x > 6 * 83) {
            this.reset();
        }
        // continuous movement along axes at speed smoothed by time
        this.x += xMove * this.speed * deltaTime;
        this.y += yMove * this.speed * deltaTime;
    }
};

//update object
object.prototype.update = function(deltaTime) {

    //move object at delta time
    this.move(deltaTime);

};

// Reset player position & enemy movement
object.prototype.reset = function() {
    //respawn player in the same position each time
    if (this instanceof Player) {
        this.x = this.start_x;
        this.y = this.start_y;
        this.xMove = this.xStart;
        this.yMove = this.yStart;
    } else {
        //make enemies respawn on different rows
        this.x = this.start_x;
        this.y = getRandomInt(0, 2) * 83 + 55;
        this.xMove = this.xStart;
        this.yMove = this.yStart;
    }
};

//check for collision between enemy and player
object.prototype.collision = function() {

    var collision = false;
    allEnemies.forEach(function(enemy) {
        if (enemy.y + 83 > player.y && enemy.y < player.y + 80) {
            if (enemy.x + 60 > player.x && enemy.x < player.x + 60) {
                collision = true;
            }
        }
    });
    return collision;
};

/*
    Enemy subclass of object class
*/

var Enemy = function(x, y, speed, xMove, yMove, sprite) {

    //call the game object to invoke Enemy
    object.call(this, x, y, speed, xMove, yMove, sprite);

};

// delegate methods up the chain to object
Enemy.prototype = Object.create(object.prototype);
// reset the constructor to the Enemy class, not object
Enemy.prototype.constructor = Enemy;

/*
    Player subtype of object class
*/
var Player = function(x, y, speed, xMove, yMove, sprite) {

    //set default number of lives
    this.lives = 3;
    //call the game object to invoke player
    object.call(this, x, y, speed, xMove, yMove, sprite);

};

// delegate methods up the chain to object
Player.prototype = Object.create(object.prototype);
// reset the constructor to the Player class, not object
Player.prototype.constructor = Player;

//show number of lives the player has remaining
Player.prototype.displayLives = function() {
    var heart = "<img src='images/Heart.png' height='75px'>";
    document.getElementById("lives").innerHTML = "<div>Lives: </div>";
    for (var i = 0; i < this.lives; i++) {
        document.getElementById("lives").innerHTML += heart;
    }
};

Player.prototype.update = function(deltaTime) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // win condition check - player wins if true
    var goal = this.reachedGoal() ? this.win() : 0;

    //check if player collided with enemy - player dies if true
    var collided = this.collision() ? this.die() : 0;

};

//handle player movement via keyboard input
Player.prototype.handleInput = function(key) {

    // reset input axes on new keypress (avoids diagonal)
    this.xMove = this.xStart;
    this.yMove = this.yStart;

    // set axes according to key press
    switch (key) {
        case 'left':
            this.xMove = -1;
            break;
        case 'right':
            this.xMove = 1;
            break;
        case 'up':
            this.yMove = -1;
            break;
        case 'down':
            this.yMove = 1;
            break;
    }
    this.move(0.0);

    //prevent movement off screen
    var left_stop = this.x < -2 ? this.x = -2 : 0;
    var right_stop = this.x > 402 ? this.x = 402 : 0;
    var top_stop = this.y < -20 ? this.y = -20 : 0;
    var bottom_stop = this.y > 390 ? this.y = 390 : 0;

};

// Check if player made it to the top of the screen
Player.prototype.reachedGoal = function() {
    if (this.y < 10) {
        return true;

    }
    return false;
};

//if player has won
Player.prototype.win = function() {
    //write message that the player won the game
    document.getElementById("messages").innerHTML = "YOU WON!";

    //message erased after 2 seconds
    setTimeout(function() {
        document.getElementById("messages").innerHTML = "";
    }, 2000);

    //reset player
    this.reset();

};

//if player collided with Enemy
Player.prototype.die = function() {
    //write message that the player won the game
    document.getElementById("messages").innerHTML = "YOU DIED!";

    //if there are lives remaining
    if (this.lives > 1) {

        //message erased after 2 seconds
        setTimeout(function() {
            document.getElementById("messages").innerHTML = "";
        }, 2000);

        //have the player lose a life & refresh the counter
        this.lives--;
        player.displayLives();
        //reset the player
        this.reset();

    } else {

        //have the player lose a life & refresh the counter
        this.lives--;
        player.displayLives();

        //print game over
        document.getElementById("messages").innerHTML = "GAME OVER!";

    }
};

//random number in range generator - courtesy of JS reference guide
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];

for (var i = 0; i < 4; i++) {

    //y co-ordinate & speed variables
    var speed;
    var row;

    // enemy movement direction (move right)
    var xMove = 1,
        yMove = 0;

    //set row and random speed for each enemy
    row = getRandomInt(0, 2) * 83 + 55;
    speed = Math.random() * 300 + 80;

    //add enemies to array
    allEnemies.push(new Enemy(-90, row, speed, xMove, yMove, 'images/enemy-bug.png'));
}

//instantiate new player in player var
var player = new Player(200, 390, 0, 0, 0, 'images/char-boy.png');

//show player lives remaining
player.displayLives();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// listen for restart button click
document.getElementById("restart-btn").addEventListener("click", function(e) {
    // go back to the instruction page to restart
    window.location = "index.html?";
});