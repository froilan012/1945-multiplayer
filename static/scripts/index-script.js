$(document).ready(function () {

    let playerName;
    let playerModel;
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

    $(".model img").hover(
        function() {
            $(this).css('background-color', '#0056b3');
          },
          function() {
            $(this).css('background-color', '');
        }
    )

    $(".model img").click(
        function() {
            $(".model img").css('border', '4px solid black')
            $(this).css('border', '4px solid yellow');
            playerModel = $(this).attr('id')
        }
    )

    $('#enter-game-btn').click(function() {
        if(playerModel == undefined && $("#name").val() == '') {
            $('#error').html('Enter your name and select an aircraft model');
        }
        else if($("#name").val() == '') {
            $('#error').html('Enter your name');
        }
        else if(playerModel == undefined) {
            $('#error').html('Select an aircraft model');
        } 
        else {
            playerName = $("#name").val()
        window.location.href = `../game.html?name=${playerName}&model=${playerModel}`;
        }
    });

    // playerName = $("#name").val()
    // window.location.href = `../game.html?name=${playerName}&model=${playerModel}`;
})