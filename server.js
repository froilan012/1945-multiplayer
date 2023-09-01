var express = require("express");
var app = express();
const server = app.listen(1337);
const io = require('socket.io')(server);

let enemies = [];
let players = [];

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/static"));

class Bullet {
    constructor(posX, posY, power, xMove) {
        this.power = power;
        this.xMove = xMove;
        this.posX = posX+18;
        this.posY = posY-50;
        this.outline = '<img src="../image/bullet.png" style="height: 50px;"></img>';
        this.bulletHealth = 1;
        this.bulletMove();
    }

    bulletMove() {
        setInterval(() => {
            if(this.bulletHealth > 0) {
                this.posY -= 15;
                this.posX += this.xMove;
            }
        }, 5);
    }
}

class Player {
    constructor(id, name, model) {
        this.id = id;
        this.name = name;
        this.model = model;
        this.outline =  `<img src="../image/${this.model}.png"></img>`;
        this.iniPosX;
        this.iniPosY = 640;
        this.bullets = [];
        this.directionLeft = false; 
        this.directionRight = false;
        this.directionUp = false;
        this.directionDown = false;
        this.fire = false;
        this.bulletCount = 10;
        this.health = 1000;
        this.reloadStatus = false;
        this.power = 3;
        setInterval(() => {
            this.playerMove();
        }, 5);
        setInterval(() => {
            if (this.fire && this.bulletCount > 0 && this.health > 0 && !this.reloadStatus) {
                this.bulletCount--;
                this.createBullet();
            }
        }, 150);
    }

    playerMove() {
        if (this.directionRight && this.iniPosX < 650 && this.health > 0) {
            this.iniPosX += 5;
        }
        if (this.directionLeft && this.iniPosX > 0 && this.health > 0) {
            this.iniPosX -= 5;
        }
        if (this.directionUp && this.iniPosY > 50 && this.health > 0) {
            this.iniPosY -= 5;
        }
        if (this.directionDown && this.iniPosY < 640 && this.health > 0) {
            this.iniPosY += 5;
        }
    }

    createBullet() {
        if (this.health > 0 && this.power == 1) {
            this.bullets.push(new Bullet(this.iniPosX, this.iniPosY, this.power, 0));
        }
        else if (this.health > 0 && this.power == 2) {
            this.bullets.push(new Bullet(this.iniPosX-15, this.iniPosY, this.power, 0));
            this.bullets.push(new Bullet(this.iniPosX+15, this.iniPosY, this.power, 0));
        }
        else if (this.health > 0 && this.power == 3) {
            this.bullets.push(new Bullet(this.iniPosX, this.iniPosY, this.power, 0));
            this.bullets.push(new Bullet(this.iniPosX-15, this.iniPosY, this.power, -5));
            this.bullets.push(new Bullet(this.iniPosX+15, this.iniPosY, this.power, 5));
        }
    }
}

class Enemy {
    constructor() {
        this.enemyPosx = Math.floor(650 * Math.random());
        this.enemyPosy = -25;
        this.outline =  '<svg viewBox="0 0 70.71 70.71" width="50px" height="50px">' + 
                            '<path style="fill: rgba(255, 0, 0, 0.93);" id="path13" d="M 50.138 20.571 C 50.326 20.761 50.308 21.001 49.659 22.405 C 49.582 22.569 49.156 23.175 49.156 23.175 C 49.156 23.175 49.442 23.49 49.52 23.568 C 49.67 23.719 49.739 24.057 49.678 24.322 C 49.488 25.142 47.195 28.424 45.911 29.707 C 45.114 30.506 44.703 31.05 44.732 31.27 C 44.756 31.457 45.058 32.261 45.403 33.053 C 46.012 34.451 46.24 34.725 53.11 42.371 C 58.55 48.424 60.215 50.377 60.313 50.821 C 60.587 52.046 59.526 53.184 56.786 54.608 L 55.372 55.339 C 55.372 55.339 34.753 40.577 34.753 40.577 L 22.392 49.967 L 22.675 50.469 C 22.831 50.746 24.123 52.358 25.546 54.05 C 26.969 55.743 28.149 57.289 28.168 57.488 C 28.241 58.28 25.068 60.772 24.592 60.295 C 23.841 59.544 20.688 57.139 20.423 57.114 C 20.233 57.094 17.523 55.029 16.603 54.108 C 15.682 53.187 13.616 50.478 13.598 50.288 C 13.572 50.023 11.167 46.869 10.415 46.119 C 9.939 45.642 12.431 42.469 13.224 42.544 C 13.421 42.561 14.967 43.741 16.66 45.164 C 18.354 46.588 19.965 47.88 20.24 48.036 L 20.744 48.318 L 30.133 35.958 C 30.133 35.958 15.371 15.339 15.371 15.339 L 16.104 13.924 C 17.526 11.184 18.665 10.123 19.891 10.397 C 20.333 10.497 22.286 12.16 28.34 17.602 C 35.985 24.47 36.26 24.698 37.658 25.307 C 38.45 25.653 39.254 25.954 39.441 25.979 C 39.662 26.007 40.206 25.597 41.003 24.799 C 42.287 23.515 45.568 21.221 46.39 21.032 C 46.655 20.97 46.992 21.04 47.143 21.191 C 47.22 21.269 47.531 21.551 47.531 21.551 C 47.531 21.551 48.137 21.124 48.302 21.046 C 49.705 20.398 49.95 20.384 50.138 20.571 Z" transform="matrix(-0.707106, 0.707107, -0.707107, -0.707106, 85.354546, 35.355305)"></path>' +
                        '</svg>';
        this.enemyHealth = 1;
        this.move();
        this.swing();
        setInterval(() => {
            this.enemyMove = Math.ceil(3 * Math.random());
        }, 500);
        this.speed = 3 + Math.ceil(3 * Math.random());
    }

    move() {
        setInterval(() => {
            if(this.enemyHealth > 0) {
                this.enemyPosy += this.speed;
            }
        }, 10);
    }

    swing() {
        setInterval(() => {
            if(this.enemyMove == 1 && this.enemyPosx < 650 && this.enemyHealth > 0) {
                this.enemyPosx += 5;
            }
            if(this.enemyMove == 2 && this.enemyPosx > 0 && this.enemyHealth > 0) {
                this.enemyPosx -= 5;
            }
        }, 10);
    }
}

io.on('connection', function (socket) {

    socket.on('moveRight', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].directionRight = data.moveRight;

    })

    socket.on('moveLeft', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].directionLeft = data.moveLeft;

    })

    socket.on('moveUp', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].directionUp = data.moveUp;

    })

    socket.on('moveDown', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].directionDown = data.moveDown;

    })

    socket.on('fire', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].fire = data.fire;
    })

    socket.on('reload', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].reloadStatus = true;
        
        if(players[player].reloadStatus) {
            
            setTimeout(() => {
                players[player].bulletCount = 10;
                players[player].outline = `<img src="../image/${players[player].model}.png"></img>`;
                players[player].reloadStatus = false;
            }, 1000);
        }
    })

    socket.on('got_a_new_player', function(data) {
        players.push(new Player(socket.id, data.name, data.model));
        
        let player = players;

        player.forEach((playerElement) => {
            if(player.indexOf(playerElement)%2 == 0) {
                players[player.indexOf(playerElement)].iniPosX = 200;
            } else {
                players[player.indexOf(playerElement)].iniPosX = 450;
            }
        });

        io.emit('updatePlayers', {
            players: players
        })

        io.emit('reloadDiv', {
            players: players
        })
    });

    socket.on('disconnect', function() {
        players.splice(players.indexOf(socket.id))
    })

    
})


setInterval(() => {
    let count = Math.ceil(3 * Math.random());
    if(players.length > 0) {
        setTimeout(() => {
            for(i=0; i<count; i++) {
                enemies.push(new Enemy);
            }
        }, 3000);
    }
}, 50000);

setInterval(() => {
    
    for(let i=0; i<players.length; i++) {
        for(let j=0; j<players[i].bullets.length; j++) {
            if(players[i].bullets[j].posY < 10) {
                players[i].bullets.splice(j, 1)
            }
            else if (players[i].bullets[j].posX < -5) {
                players[i].bullets.splice(j, 1)
            }
            else if (players[i].bullets[j].posX > 690) {
                players[i].bullets.splice(j, 1)
            }

            let enemy = enemies;
            let bullet = players[i].bullets;

            bullet.forEach((bulletElement) => {
                enemy.forEach((enemyElement) => {
                    if (bulletElement.posX >= enemyElement.enemyPosx - 50 && bulletElement.posX <= enemyElement.enemyPosx + 50 && bulletElement.posY <= enemyElement.enemyPosy && bulletElement.posY >= enemyElement.enemyPosy - 50) {
                        bullet[bullet.indexOf(bulletElement)].outline = '<img src="../image/explosion.gif?start=0" style="height: 50px;"></img>';
                        bullet[bullet.indexOf(bulletElement)].bulletHealth--;
                        bullet[bullet.indexOf(bulletElement)].posX = enemyElement.enemyPosx;
                        bullet[bullet.indexOf(bulletElement)].posY = enemyElement.enemyPosy;
                        enemies[enemies.indexOf(enemyElement)].enemyHealth--;
                        enemies.splice(enemies.indexOf(enemyElement), 1);
                        setTimeout(() => {
                            bullet.splice(bullet.indexOf(bulletElement), 1);
                        }, 400);
                    }
                })
            });
        }
    }

    for(let i=0; i<players.length; i++) {

            let enemy = enemies;
            let player = players;

            player.forEach((playerElement) => {
                enemy.forEach((enemyElement) => {
                    if (playerElement.iniPosX >= enemyElement.enemyPosx - 50 && playerElement.iniPosX <= enemyElement.enemyPosx + 50 && playerElement.iniPosY <= enemyElement.enemyPosy && playerElement.iniPosY >= enemyElement.enemyPosy - 50) {
                        players[player.indexOf(playerElement)].health -= 5;
                        if(players[player.indexOf(playerElement)].health == 0) {
                            players[player.indexOf(playerElement)].outline = "";
                            players[player.indexOf(playerElement)].iniPosY = 720;
                            players[player.indexOf(playerElement)].iniPosX = 0;
                        }
                        enemies.splice(enemies.indexOf(enemyElement), 1)
                    }
                })
            });
    }

    for(let i=0; i<enemies.length; i++) {
        if(enemies[i].enemyPosy > 660) {
            enemies.splice(i, 1);
        }
    }

    io.emit('updateAllContainer', {
        enemies: enemies,
        players: players
    })
}, 10);