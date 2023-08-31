$(document).ready(function () {

    var socket = io();
    var name = 'froilan';
    socket.emit('got_a_new_player', {name: name});

    socket.on('updateAllContainer', function (data) {

        
        $('.enemy').remove();
        $('.player').remove();
        $('.bullet').remove();
        $('#players-list').empty();

        for(let i=0; i<data.enemies.length; i++) {
            let enemyPosx = data.enemies[i].enemyPosx;
            let enemyPosy = data.enemies[i].enemyPosy;
            
            const enemy = document.createElement('div');
            enemy.setAttribute('id','enemy-plane');
            enemy.setAttribute('class','enemy');
            enemy.style.position = 'absolute';
            enemy.innerHTML =   data.enemies[i].outline;
            enemy.style.top = enemyPosy + 'px'
            enemy.style.left = enemyPosx + 'px'
            $('#container').append(enemy);
        }

        
        for(let i=0; i<data.players.length; i++) {
            const player = document.createElement('div');
            player.setAttribute('id', data.players[i].id)
            player.setAttribute('class','player');
            player.innerHTML =  data.players[i].outline;
            player.style.left = data.players[i].iniPosX + 'px';
            player.style.top = data.players[i].iniPosY + 'px';
            player.style.position = 'absolute';
            
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
            
            const test = document.getElementById(data.players[i].id)
            if(data.players[i].reloadStatus && data.players[i].health > 0) {
                test.style.display = 'inline-block';
                test.style.left = data.players[i].iniPosX + 'px';
                test.style.top = data.players[i].iniPosY + 'px';
            } else {
                test.style.display = 'none';
            }
        }
        
        for(let i=0; i<data.players.length; i++) {
            const playerList = document.createElement('div');
            playerList.innerHTML += data.players[i].name + " " + `<div class="health-bar">
                <div class="health-level" id="healthLevel" style="width: ${data.players[i].health}%"></div>
            </div>` + " " + data.players[i].bulletCount;
        
            $('#players-list').append(playerList);
        }
    })

    socket.on('reloadDiv', function(data) {
        $('.loader').remove();
        for(let i=0; i<data.players.length; i++) {
            const reloadDiv = document.createElement('div');
            reloadDiv.setAttribute('id', data.players[i].id);
            reloadDiv.setAttribute('class', 'loader');
            data.players[i].reloadStatus = false;
            $('#container').append(reloadDiv);

            let rotation = 0;
            const rotateSpinner = () => {
                rotation += 10;
                reloadDiv.style.transform = `rotate(${rotation}deg)`;
            };
            setInterval(rotateSpinner, 25);
        }
    })
    

    window.addEventListener('keydown', () => {
        if (event.key == 'ArrowRight' || event.key == 'd') {
            socket.emit('moveRight', {
                id: socket.id,
                moveRight: true
            })
        }
        if (event.key == 'ArrowLeft' || event.key == 'a') {
            socket.emit('moveLeft', {
                id: socket.id,
                moveLeft: true
            })
        }
        if (event.key == 'ArrowUp' || event.key == 'w') {
            socket.emit('moveUp', {
                id: socket.id,
                moveUp: true
            })
        }
        if (event.key == 'ArrowDown' || event.key == 's') {
            socket.emit('moveDown', {
                id: socket.id,
                moveDown: true
            })
        }
        if (event.key == ' ') {
            socket.emit('fire', {
                id: socket.id,
                fire: true
            })
        }
        if (event.key == 'r') {
            socket.emit('reload', {
                id: socket.id
            })
        }
    });

    window.addEventListener('keyup', () => {
        if (event.key == 'ArrowRight' || event.key == 'd') {
            socket.emit('moveRight', {
                id: socket.id,
                moveRight: false
            })
        }
        if (event.key == 'ArrowLeft' || event.key == 'a') {
            socket.emit('moveLeft', {
                id: socket.id,
                moveLeft: false
            })
        }
        if (event.key == 'ArrowUp' || event.key == 'w') {
            socket.emit('moveUp', {
                id: socket.id,
                moveUp: false
            })
        }
        if (event.key == 'ArrowDown' || event.key == 's') {
            socket.emit('moveDown', {
                id: socket.id,
                moveDown: false
            })
        }
        if (event.key == ' ') {
            socket.emit('fire', {
                id: socket.id,
                fire: false
            })
        }
    });

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = 700;
    canvas.height = 700;

    // Background variables
    const backgroundSpeed = 1;
    let backgroundY = 0;

    // Load background image
    const backgroundImage = new Image();
    backgroundImage.src = '../image/ocean.jpg'; // Replace with your image path

    // Game loop
    function gameLoop() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update background position
        backgroundY += backgroundSpeed;

        // Draw background
        ctx.drawImage(backgroundImage, 0, backgroundY, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, backgroundY - canvas.height, canvas.width, canvas.height);

        // Loop the background
        if (backgroundY >= canvas.height) {
            backgroundY = 0;
        }

        // Call the next frame
        requestAnimationFrame(gameLoop);
    }

    // Start the game loop
    gameLoop();
})


