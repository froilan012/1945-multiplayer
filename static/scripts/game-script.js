$(document).ready(function () {

    //Input getter
    const queryParams = new URLSearchParams(window.location.search);
    const playerName = queryParams.get('name');
    const playerModel = queryParams.get('model');

    var socket = io();

    //<-------------Socket Events--------------->
    socket.emit('got_a_new_player', {name: playerName, model: playerModel});

    socket.on('updateAllContainer', function (data) {

        let index = data.players.findIndex(function(obj) {
            return obj.id === socket.id;
        });
        
        $('.enemy').remove();
        $('.powerup').remove();
        $('.player').remove();
        $('.shadow').remove();
        $('.bullet').remove();
        $('.playerStats').remove();
        $('#players-list').empty();

        for(let i=0; i<data.powerups.length; i++) {
            let powerPosX = data.powerups[i].posX;
            let powerPosY = data.powerups[i].posY;

            const powerUp = document.createElement('div');
            powerUp.setAttribute('class', 'powerup');
            powerUp.style.position = 'absolute';
            powerUp.innerHTML = data.powerups[i].outline;
            powerUp.style.top = powerPosY + 'px';
            powerUp.style.left = powerPosX + 'px';
            powerUp.style.padding = '0px';

            if (data.powerups[i].type == 'power') {
                powerUp.style.outline = '3px solid yellow';
                powerUp.style.borderRadius = '25px';
            }

            $('#container').append(powerUp);
        };

        for(let i=0; i<data.enemies.length; i++) {
            let enemyPosx = data.enemies[i].enemyPosx;
            let enemyPosy = data.enemies[i].enemyPosy;
            
            const enemy = document.createElement('div');
            enemy.setAttribute('id','enemy-plane');
            enemy.setAttribute('class','enemy');
            enemy.style.position = 'absolute';
            enemy.innerHTML =   data.enemies[i].outline;
            enemy.style.top = enemyPosy + 'px';
            enemy.style.left = enemyPosx + 'px';

            const shadow = document.createElement('div');
            shadow.setAttribute('class','shadow');
            shadow.innerHTML =  data.enemies[i].outline;
            shadow.style.left = data.enemies[i].enemyPosx + 7 + 'px';
            shadow.style.top = data.enemies[i].enemyPosy + 35 + 'px';
            shadow.style.position = 'absolute';

            if(data.enemies[i].enemyMove == 1) {
                enemy.style.transform = "skewY(10deg)";
                shadow.style.transform = "skewY(10deg)";
            }
            else if(data.enemies[i].enemyMove == 2) {
                enemy.style.transform = "skewY(-10deg)";
                shadow.style.transform = "skewY(-10deg)";
            }

            if(data.enemies[i].enemyPosy < 650) {
                $('#container').append(shadow);
            };
            
            $('#container').append(enemy);
        };

        
        for(let i=0; i<data.players.length; i++) {
            const player = document.createElement('div');
            player.setAttribute('id', data.players[i].id)
            player.setAttribute('class','player');
            player.innerHTML =  data.players[i].outline;
            player.style.left = data.players[i].iniPosX + 'px';
            player.style.top = data.players[i].iniPosY + 'px';
            player.style.position = 'absolute';

            const shadow = document.createElement('div');
            shadow.setAttribute('class','shadow');
            shadow.innerHTML =  data.players[i].outline;
            shadow.style.left = data.players[i].iniPosX + 7 + 'px';
            shadow.style.top = data.players[i].iniPosY + 35 + 'px';
            shadow.style.position = 'absolute';
            
            for(j=0; j<data.players[i].bullets.length; j++) {
                const bullet = document.createElement('div');
                bullet.setAttribute('class','bullet');
                bullet.style.width = '50px'
                bullet.style.position = 'absolute';
                bullet.innerHTML = data.players[i].bullets[j].outline;
                bullet.style.top = data.players[i].bullets[j].posY + 'px';
                bullet.style.left = data.players[i].bullets[j].posX + 'px';
                $('#container').append(bullet);
            }
            $('#container').append(player);
            $('#container').append(shadow);
            
            const reloadDisplay = document.getElementById(data.players[i].id)
            if(data.players[i].reloadStatus && data.players[i].health > 0) {
                reloadDisplay.style.display = 'inline-block';
                reloadDisplay.style.left = data.players[i].iniPosX + 'px';
                reloadDisplay.style.top = data.players[i].iniPosY + 'px';
            } else {
                reloadDisplay.style.display = 'none';
            };
        };

        if(index!= -1) {
            const player = document.createElement('div');
            player.setAttribute('class','playerStats');
            player.innerHTML = `<div class="name">Name: ${data.players[index].name}</div>
                                <div class="health-bar">
                                    <div class="health-level" id="healthLevel" style="width: ${data.players[index].health}%">
                                        <div class="health-count">Health: ${data.players[index].health}%</div>
                                    </div>
                                </div>
                                <div class="ammo">Ammo: ${data.players[index].bulletCount}</div>
                                <div class="power">Firepower: ${data.players[index].power}</div>
                                <div class="score">Score: ${data.players[index].score}</div>`;
            $('#player').append(player);

            const warning = document.getElementById('warning');
            const playAgain = document.getElementById('new-game-btn');
            if(data.players[index].bulletCount == 0 && data.players[index].health != 0) {
                warning.style.display = 'block'
                warning.style.color = 'red'
                warning.style.animation = 'blink 1s infinite';
                warning.innerHTML = "RELOAD!!!";
            } else if (data.players[index].health == 0){
                warning.style.display = 'block'
                warning.style.animation = '';
                warning.style.color = 'black'
                warning.innerHTML = "GAME OVER";

                playAgain.style.display = 'block';
            } 
            else {
                warning.style.display = 'none'
                playAgain.style.display = 'none';
            };
        };
        
        for(let i=0; i<data.players.length; i++) {
            const playerList = document.createElement('div');
            playerList.style.display = 'inline-block';
            playerList.style.padding = '10px';
            playerList.style.border = '2px solid black';
            playerList.style.borderRadius = '15px';
            playerList.style.margin = '0 15px';
            playerList.innerHTML = `Name: ${data.players[i].name} 
                                    <div class="health-bar">
                                        <div class="health-level" id="healthLevel" style="width: ${data.players[i].health}%;">
                                            <div class="health-count">Health: ${data.players[i].health}%</div>
                                        </div>
                                    </div> 
                                    Score: ${data.players[i].score}`;
        
            $('#players-list').append(playerList);
        };
    });

    $('#new-game-btn').click(function() {
        window.location.href = `../`;
    });

    socket.on('reloadDiv', function(data) {
        $('.loader').remove();
        $('.reload').remove();
        for(let i=0; i<data.players.length; i++) {
            const reloadDiv = document.createElement('div');
            reloadDiv.setAttribute('id', data.players[i].id);
            reloadDiv.setAttribute('class', 'loader');
            data.players[i].reloadStatus = false;

            $('#container').append(reloadDiv);

            let rotation = 0;
            const rotateSpinner = () => {
                if(rotation == 360) {
                    rotation = 0;
                }
                rotation += 10;
                reloadDiv.style.transform = `rotate(${rotation}deg)`;
            };
            setInterval(rotateSpinner, 15);
        };
    });

    socket.on('updateExplosion', function(data) {
        const expl = document.createElement('img');
        expl.setAttribute('class', 'explosion');
        expl.src = "../image/explosion.png";
        $('#container').append(expl);

        setInterval(() => {
            data.explosions[0]-=2;
            data.explosions[1]-=2;
            expl.style.top = data.explosions[1] + 'px';
            expl.style.left = data.explosions[0] + 'px';
            
        }, 50);

        setTimeout(() => {
            $(expl).remove();
        }, 300);

    });
    //<---------------------------->

    //<-------------Event Listeners--------------->
    window.addEventListener('keydown', () => {
        if (event.key == 'ArrowRight' || event.key == 'd') {
            socket.emit('moveRight', {
                id: socket.id,
                moveRight: true
            });
        };
        if (event.key == 'ArrowLeft' || event.key == 'a') {
            socket.emit('moveLeft', {
                id: socket.id,
                moveLeft: true
            });
        };
        if (event.key == 'ArrowUp' || event.key == 'w') {
            socket.emit('moveUp', {
                id: socket.id,
                moveUp: true
            });
        };
        if (event.key == 'ArrowDown' || event.key == 's') {
            socket.emit('moveDown', {
                id: socket.id,
                moveDown: true
            });
        };
        if (event.key == ' ') {
            socket.emit('fire', {
                id: socket.id,
                fire: true
            });
        };
        if (event.key == 'r') {
            socket.emit('reload', {
                id: socket.id
            });
        };
    });

    window.addEventListener('keyup', () => {
        if (event.key == 'ArrowRight' || event.key == 'd') {
            socket.emit('moveRight', {
                id: socket.id,
                moveRight: false
            });
        };
        if (event.key == 'ArrowLeft' || event.key == 'a') {
            socket.emit('moveLeft', {
                id: socket.id,
                moveLeft: false
            });
        };
        if (event.key == 'ArrowUp' || event.key == 'w') {
            socket.emit('moveUp', {
                id: socket.id,
                moveUp: false
            });
        };
        if (event.key == 'ArrowDown' || event.key == 's') {
            socket.emit('moveDown', {
                id: socket.id,
                moveDown: false
            });
        };
        if (event.key == ' ') {
            socket.emit('fire', {
                id: socket.id,
                fire: false
            });
        };
    });
    //<---------------------------->

    //<-------------Background Animation--------------->
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 700;
    canvas.height = 700;

    const backgroundSpeed = 1;
    let backgroundY = 0;

    const backgroundImage = new Image();
    backgroundImage.src = '../image/ocean.jpg';

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        backgroundY += backgroundSpeed;

        ctx.drawImage(backgroundImage, 0, backgroundY, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, backgroundY - canvas.height, canvas.width, canvas.height);

        if (backgroundY >= canvas.height) {
            backgroundY = 0;
        }

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
    //<---------------------------->
})


