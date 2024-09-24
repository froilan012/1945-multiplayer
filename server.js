var express = require("express");
var app = express();
const server = app.listen(1337);
const io = require('socket.io')(server);

let enemies = [];
let players = [];
let powerups = [];
let boss = [];
let stage = 1;
const initStageTimer = 1;
let stageTimer = initStageTimer;

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
        this.iniPosX = 0;
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
        this.shield = 0;
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
        }
        else if (this.health > 0 && this.power == 4) {
            this.bullets.push(new Bullet(this.iniPosX-15, this.iniPosY, this.power, 0));
            this.bullets.push(new Bullet(this.iniPosX+15, this.iniPosY, this.power, 0));
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
        }, 250 + Math.ceil(250 * Math.random()));
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

class Boss {
    constructor() {
        this.bossPosx = 280;
        this.bossPosy = -250;
        this.bossHealth = 50;
        this.outline =  `<img src="../image/boss1.png"></img>`;
        this.bossYDirection = 2;
        this.bossBullets = [];
        this.move();
        this.swing();
        this.attack();
        setInterval(() => {
            this.bossMove = Math.ceil(3 * Math.random());
        }, 500);
        this.speed = 3 + Math.ceil(3 * Math.random());
        
        
        setInterval(() => {
            this.bossYDirection = Math.floor(3 * Math.random());;
        }, 750);
        
    };

    move() {
        setInterval(() => {
            if(this.bossHealth > 0 && this.bossPosy >= 300) {
                this.bossYDirection = 0;
            }
            else if(this.bossHealth > 0 && this.bossPosy <= 0) {
                this.bossYDirection = 1;
            }

            if(this.bossHealth > 0 && this.bossYDirection == 1) {
                this.bossPosy += 5;
            }
            else if(this.bossHealth > 0 && this.bossYDirection == 0) {
                this.bossPosy -= 5;
            }
        }, 10);
    };

    swing() {
        setInterval(() => {
            if(this.bossMove == 1 && this.bossPosx < 530 && this.bossHealth > 0) {
                this.bossPosx += 5;
            }
            if(this.bossMove == 2 && this.bossPosx > 0 && this.bossHealth > 0) {
                this.bossPosx -= 5;
            }
        }, 10);
    };

    attack() {
        setInterval(() => {
            this.bossBullets.push(new BossBullet(this.bossPosx+55, this.bossPosy+110, 0))
            this.bossBullets.push(new BossBullet(this.bossPosx+55, this.bossPosy+110, 2.5))
            this.bossBullets.push(new BossBullet(this.bossPosx+55, this.bossPosy+110, -2.5))
            this.bossBullets.push(new BossBullet(this.bossPosx+55, this.bossPosy+110, 5))
            this.bossBullets.push(new BossBullet(this.bossPosx+55, this.bossPosy+110, -5))
        }, 1000)
        
    }
};

class BossBullet {
    constructor(posX, posY, xMove) {
        this.power = stage * 5;
        this.xMove = xMove;
        this.posX = posX+18;
        this.posY = posY-50;
        this.outline = '<img src="../image/bossbullet.png" style="height: 50px;"></img>';
        this.bulletMove();
    };

    bulletMove() {
        setInterval(() => {
            this.posY += 6;
            this.posX += this.xMove;
        }, 5);
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

            if(this.posY > 600) {
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
    if (boss.length == 0) {
        let count = Math.ceil(stage * Math.random());
        if (players.length > 0) {
            setTimeout(() => {
                for (i=0; i<count; i++) {
                    enemies.push(new Enemy);
                };
            }, 3000);
        }
        else {
            enemies.splice(0, enemies.length);
            
        };
    }
    else if (players.length == 0) {
        stageTimer = initStageTimer;
        stage = 1;
        boss = [];
        powerups = [];
    }
}, 500);

setInterval(() => {
    if(stageTimer != 0 && players.length != 0) {
        stageTimer--;
    }
}, 1000);

setInterval(() => {
    if(stageTimer == 0 && boss.length == 0 && players.length != 0) {
        boss.push(new Boss);
    }
}, 500);

setInterval(() => {
    if(players.length > 0) {
        powerups.push(new Powerup);
    }
}, 5000);

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
            let bosses = boss;
            let bullet = players[i].bullets;

            bullet.forEach((bulletElement) => {
                enemy.forEach((enemyElement) => {
                    if (bulletElement.posX >= enemyElement.enemyPosx - 40 && bulletElement.posX <= enemyElement.enemyPosx + 40 && bulletElement.posY <= enemyElement.enemyPosy && bulletElement.posY >= enemyElement.enemyPosy - 300) {
                        enemies[enemies.indexOf(enemyElement)].enemyHealth--;
                        if(enemies[enemies.indexOf(enemyElement)].enemyHealth == 0) {
                            enemies.splice(enemies.indexOf(enemyElement), 1);
                            io.emit('updateExplosion', {
                                explosions: [enemyElement.enemyPosx+25,enemyElement.enemyPosy+25,50,50,"small"]
                            })
                            players[i].score += 100;
                        };
                        
                        bullet.splice(bullet.indexOf(bulletElement), 1);
                    };
                });

                bosses.forEach((bossElement) => {
                    if (bulletElement.posX >= bossElement.bossPosx + 5 && bulletElement.posX <= bossElement.bossPosx + 155 && bulletElement.posY <= bossElement.bossPosy + 150 && bulletElement.posY >= bossElement.bossPosy) {
                        bosses[bosses.indexOf(bossElement)].bossHealth--;
                        players[i].score += 100;
                        if(bosses[bosses.indexOf(bossElement)].bossHealth == 0) {
                            boss.splice(boss.indexOf(bossElement), 1);
                            io.emit('updateExplosion', {
                                explosions: [bossElement.bossPosx-50,bossElement.bossPosy+250,300,300,"big"]
                            })
                            stage++;
                            stageTimer = initStageTimer;
                        };
                        
                        bullet.splice(bullet.indexOf(bulletElement), 1);
                    };
                });

            });
        };
    };

    for(let i=0; i<boss.length; i++) {
        for(let j=0; j<boss[i].bossBullets.length; j++) {
            if(boss[i].bossBullets[j].posY > 645) {
                boss[i].bossBullets.splice(j, 1)
            }
            else if (boss[i].bossBullets[j].posX < -5) {
                boss[i].bossBullets.splice(j, 1)
            }
            else if (boss[i].bossBullets[j].posX > 690) {
                boss[i].bossBullets.splice(j, 1)
            }

            let player = players;
            let bossBullet = boss[i].bossBullets;

            

            player.forEach((playerElement) => {
                bossBullet.forEach((bossBullet) => {
                    if (playerElement.iniPosX >= bossBullet.posX - 45 && playerElement.iniPosX <= bossBullet.posX + 15 && playerElement.iniPosY <= bossBullet.posY && playerElement.iniPosY >= bossBullet.posY - 15) {
                        players[player.indexOf(playerElement)].health -= bossBullet.power;
                        if(players[player.indexOf(playerElement)].health <= 0) {
                            io.emit('updateExplosion', {
                                explosions: [players[player.indexOf(playerElement)].iniPosX+25,players[player.indexOf(playerElement)].iniPosY+25]
                            });
    
                            players[player.indexOf(playerElement)].outline = "";
                            players[player.indexOf(playerElement)].iniPosY = 720;
                            players[player.indexOf(playerElement)].iniPosX = 0;
                            players[player.indexOf(playerElement)].health = 0;
                        };
                        io.emit('updateExplosion', {
                            explosions: [bossBullet.posX+25,bossBullet.posY+25]
                        });
                        boss[i].bossBullets.splice(boss[i].bossBullets.indexOf(bossBullet), 1)
                    };
                });
            });
        };
    };

    for(let i=0; i<players.length; i++) {

        let enemy = enemies;
        let player = players;
        let powerup = powerups;
        let bosses = boss;

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
                    if(players[player.indexOf(playerElement)].power < 4 && powerups[powerups.indexOf(powerupElem)].type == 'power') {
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

            bosses.forEach((bossElement) => {
                if (playerElement.iniPosX >= bossElement.bossPosx - 35 && playerElement.iniPosX <= bossElement.bossPosx + 155 && playerElement.iniPosY <= bossElement.bossPosy + 250 && playerElement.iniPosY >= bossElement.bossPosy + 50) {
                    if (players[player.indexOf(playerElement)].shield == 0) {
                        players[player.indexOf(playerElement)].health -= 5;
                        players[player.indexOf(playerElement)].shield = 1;
                        setTimeout(() => {
                            players[player.indexOf(playerElement)].shield = 0;
                        }, 1000);
                    }
                    
                    
                    if(players[player.indexOf(playerElement)].health == 0) {
                        io.emit('updateExplosion', {
                            explosions: [players[player.indexOf(playerElement)].iniPosX+25,players[player.indexOf(playerElement)].iniPosY+25]
                        });

                        players[player.indexOf(playerElement)].outline = "";
                        players[player.indexOf(playerElement)].iniPosY = 720;
                        players[player.indexOf(playerElement)].iniPosX = 0;
                        
                    };
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
        powerups: powerups,
        boss: boss
    });
}, 10);
// <--------------------------------->