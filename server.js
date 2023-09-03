var express = require("express");
var app = express();
const server = app.listen(1337);
const io = require('socket.io')(server);

let enemies = [];
let players = [];
let powerups = [];

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/static"));

//<--------Object Creation Classes-------->
class Bullet {
    constructor(posX, posY, power, xMove) {
        this.power = power;
        this.xMove = xMove;
        this.posX = posX+18;
        this.posY = posY-50;
        this.outline = '<img src="../image/bullet.png" style="height: 50px;"></img>';
        this.bulletMove();
    };

    bulletMove() {
        setInterval(() => {
            this.posY -= 15;
            this.posX += this.xMove;
        }, 5);
    };
};

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
        this.bulletCount = 20;
        this.health = 100;
        this.reloadStatus = false;
        this.power = 1;
        this.score = 0;
        setInterval(() => {
            this.playerMove();
        }, 5);
        setInterval(() => {
            if (this.fire && this.bulletCount > 0 && this.health > 0 && !this.reloadStatus) {
                this.bulletCount--;
                this.createBullet();
            }
        }, 150);
    };

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
        };
    };

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
        };
    };
};

class Enemy {
    constructor() {
        this.enemyPosx = Math.floor(650 * Math.random());
        this.enemyPosy = -25;
        this.enemyHealth = Math.ceil(3*Math.random());
        this.outline =  `<img src="../image/enemy${this.enemyHealth}.png"></img>`;
        this.move();
        this.swing();
        setInterval(() => {
            this.enemyMove = Math.ceil(3 * Math.random());
        }, 500);
        this.speed = 3 + Math.ceil(3 * Math.random());
    };

    move() {
        setInterval(() => {
            if(this.enemyHealth > 0) {
                this.enemyPosy += this.speed;
            }
        }, 10);
    };

    swing() {
        setInterval(() => {
            if(this.enemyMove == 1 && this.enemyPosx < 650 && this.enemyHealth > 0) {
                this.enemyPosx += 5;
            }
            if(this.enemyMove == 2 && this.enemyPosx > 0 && this.enemyHealth > 0) {
                this.enemyPosx -= 5;
            }
        }, 10);
    };
};

class Powerup {
    constructor () {
        this.posX = Math.floor(650 * Math.random());
        this.posY = 0;
        this.move();
        this.directionX = Math.random() < 0.5;
        this.directionY = false;
        this.time = 0;
        
        setInterval(() => {
            this.time += 1;
        }, 1000);

        if(Math.random() > 0.5) {
            this.outline = `<img src="../image/powerup.png"></img>`;
            this.type = 'power';
        } else {
            this.outline = `<img src="../image/health.png"></img>`;
            this.type = 'health';
        };
    };

    move() {
        setInterval(() => {
            if (!this.directionY) {
                this.posY += 3;
            } else {
                this.posY -= 3;
            }

            if(this.posY > 300) {
                this.directionY = true;
            }
            else if(this.posY < 10) {
                this.directionY = false;
            }

            if (!this.directionX) {
                this.posX += 3;
            } else {
                this.posX -= 3;
            }

            if(this.posX > 650) {
                this.directionX = true;
            }
            else if(this.posX < 0) {
                this.directionX = false;
            }
        }, 10);
    };
};
//<------------------------------->

//<-------Socket triggers--------->
io.on('connection', function (socket) {

    socket.on('moveRight', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].directionRight = data.moveRight;

    });

    socket.on('moveLeft', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].directionLeft = data.moveLeft;

    });

    socket.on('moveUp', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].directionUp = data.moveUp;

    });

    socket.on('moveDown', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].directionDown = data.moveDown;

    });

    socket.on('fire', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].fire = data.fire;
    });

    socket.on('reload', (data) => {
        let player = players.findIndex(player => player.id === data.id)
        players[player].reloadStatus = true;
        
        if(players[player].reloadStatus && players[player].health != 0) {
            
            setTimeout(() => {
                players[player].bulletCount = 20;
                players[player].reloadStatus = false;
            }, 1000);
        };
    });

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
        });

        io.emit('reloadDiv', {
            players: players
        });
    });

    socket.on('disconnect', function() {
        let index = players.findIndex(function(obj) {
            return obj.id === socket.id;
        });
        players.splice(index, 1)
    });
});
// <--------------------------------->

// <------Object Creation intervals and animation ------->
setInterval(() => {
    let count = Math.ceil(3 * Math.random());
    if(players.length > 0) {
        setTimeout(() => {
            for(i=0; i<count; i++) {
                enemies.push(new Enemy);
            };
        }, 3000);
    };
}, 500);

setInterval(() => {
    if(players.length > 0) {
        powerups.push(new Powerup);
    }
}, 15000);

setInterval(() => {

    for(let i=0; i<powerups.length; i++) {
        if(powerups[i].time == 10) {
            powerups.splice(i,1);
        };
    };
    
    //Bullet collision
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
                    if (bulletElement.posX >= enemyElement.enemyPosx - 40 && bulletElement.posX <= enemyElement.enemyPosx + 40 && bulletElement.posY <= enemyElement.enemyPosy && bulletElement.posY >= enemyElement.enemyPosy - 40) {
                        enemies[enemies.indexOf(enemyElement)].enemyHealth--;
                        if(enemies[enemies.indexOf(enemyElement)].enemyHealth == 0) {
                            enemies.splice(enemies.indexOf(enemyElement), 1);
                            io.emit('updateExplosion', {
                                explosions: [enemyElement.enemyPosx+25,enemyElement.enemyPosy+25]
                            })
                            players[i].score += 100;
                        };
                        
                        bullet.splice(bullet.indexOf(bulletElement), 1);
                    };
                });
            });
        };
    };

    for(let i=0; i<players.length; i++) {

            let enemy = enemies;
            let player = players;
            let powerup = powerups;

            //Player collision
            player.forEach((playerElement) => {
                enemy.forEach((enemyElement) => {
                    if (playerElement.iniPosX >= enemyElement.enemyPosx - 40 && playerElement.iniPosX <= enemyElement.enemyPosx + 40 && playerElement.iniPosY <= enemyElement.enemyPosy && playerElement.iniPosY >= enemyElement.enemyPosy - 40) {
                        players[player.indexOf(playerElement)].health -= 5;
                        if(players[player.indexOf(playerElement)].health == 0) {
                            io.emit('updateExplosion', {
                                explosions: [players[player.indexOf(playerElement)].iniPosX+25,players[player.indexOf(playerElement)].iniPosY+25]
                            });

                            players[player.indexOf(playerElement)].outline = "";
                            players[player.indexOf(playerElement)].iniPosY = 720;
                            players[player.indexOf(playerElement)].iniPosX = 0;
                            
                        };
                        io.emit('updateExplosion', {
                            explosions: [enemyElement.enemyPosx+25,enemyElement.enemyPosy+25]
                        });
                        enemies.splice(enemies.indexOf(enemyElement), 1)
                    };
                });

                powerup.forEach(powerupElem => {
                    if (playerElement.iniPosX >= powerupElem.posX - 40 && playerElement.iniPosX <= powerupElem.posX + 40 && playerElement.iniPosY <= powerupElem.posY && playerElement.iniPosY >= powerupElem.posY - 40) {
                        if(players[player.indexOf(playerElement)].power < 3 && powerups[powerups.indexOf(powerupElem)].type == 'power') {
                            players[player.indexOf(playerElement)].power++;
                        }
                        else if (players[player.indexOf(playerElement)].health < 75 && powerups[powerups.indexOf(powerupElem)].type == 'health') {
                            players[player.indexOf(playerElement)].health += 25;
                        }
                        else if (powerups[powerups.indexOf(powerupElem)].type == 'health') {
                            players[player.indexOf(playerElement)].health = 100;
                        }
                        powerups.splice(powerups.indexOf(powerupElem), 1);
                    };
                });
            });
    };

    for(let i=0; i<enemies.length; i++) {
        if(enemies[i].enemyPosy > 660) {
            enemies.splice(i, 1);
        };
    };

    io.emit('updateAllContainer', {
        enemies: enemies,
        players: players,
        powerups: powerups
    });
}, 10);
// <--------------------------------->