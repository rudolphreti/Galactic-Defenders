var container = document.getElementById('container');
var playerSpeed = 10;
var positionX = 0;
var positionY = 0;
var player = document.createElement('img'); 
player.src = 'robot.png'; 
player.style.height = '200px';
player.style.position = 'absolute';
container.appendChild(player); 
var lastFireTime = 0;
var fireDelay = 200; 
var isMusicPlaying = false;

function initGame() {
    positionX = (container.offsetWidth - player.offsetWidth) / 2;
    positionY = container.offsetHeight - player.offsetHeight;
    player.style.left = positionX + 'px';
    player.style.top = positionY + 'px';
    setInterval(checkCollisions, 10);
    setInterval(spawnEnemy, 5000);
    setInterval(spawnStar, 200);
}

document.addEventListener('keydown', movePlayer);


function movePlayer(e) {
    switch (e.keyCode) {
        case 37: // lewo
            positionX -= playerSpeed;
            break;
        case 38: // góra
            positionY -= playerSpeed;
            break;
        case 39: // prawo
            positionX += playerSpeed;
            break;
        case 40: // dół
            positionY += playerSpeed;
            break;
        case 32: // space
            var currentTime = new Date().getTime();
            if (currentTime - lastFireTime > fireDelay) {
                fireProjectile();
                lastFireTime = currentTime;
            }
            break;
    }

    positionX = Math.max(0, Math.min(container.offsetWidth - player.offsetWidth, positionX));
    positionY = Math.max(0, Math.min(container.offsetHeight - player.offsetHeight, positionY));

    player.style.left = positionX + 'px';
    player.style.top = positionY + 'px';
}

function fireProjectile() {
  var projectile = document.createElement('img');
  projectile.src = 'weapon.png'; 
  projectile.style.position = 'absolute';
  projectile.style.left = positionX + (player.offsetWidth / 2) - 55 + 'px'; // Centrowanie pocisku względem gracza
  projectile.style.top = positionY - 35 + 'px';
  projectile.style.height = '50px';
  container.appendChild(projectile);
  projectile.className = 'projectile';

  var newFireSound = document.createElement('audio');
  newFireSound.src = 'lasershot.mp3'; // Podmień na właściwą ścieżkę
  newFireSound.play();
  newFireSound.volume = 0.1;
  newFireSound.onended = function () {
    newFireSound.remove();
  };

  var interval = setInterval(function () {
    var posY = parseInt(projectile.style.top) - 5; // Szybkość poruszania się pocisku
    if (posY < 0) {
      clearInterval(interval);
      if (!projectile.classList.contains('destroyed')) {
        container.removeChild(projectile);
      }
    } else {
      projectile.style.top = posY + 'px';
    }
  }, 20);
}

document.addEventListener('keydown', movePlayer);

var lastFireTime = 0;
var fireDelay = 200; // czas w milisekundach, który musi upłynąć przed kolejnym strzałem

var isMusicPlaying = false;

// Funkcja generująca wrogów
function spawnEnemy() {
  if (!isMusicPlaying) {
    var audioElement = document.getElementById('backgroundMusic');
    if (audioElement.paused) {
      audioElement.play();
      isMusicPlaying = true;
    }
  }

  var enemy = document.createElement('img');
  enemy.src = 'spider.png'; // Ścieżka do obrazka wroga
  enemy.className = 'enemy';
  enemy.style.position = 'absolute';
  enemy.style.left = Math.random() * (container.offsetWidth - enemy.offsetWidth) + 'px'; // Losowa pozycja X
  enemy.style.top = '0px'; // Start na górze kontenera
  enemy.style.width = '50px';
  enemy.style.height = '50px';
  container.appendChild(enemy);

  moveEnemy(enemy);
}

// Funkcja poruszająca wrogami
function moveEnemy(enemy) {
  var moveDown = setInterval(function () {
    var currentTop = parseInt(enemy.style.top);
    enemy.style.top = currentTop + 1 + 'px';
    if (currentTop > container.offsetHeight) {
      clearInterval(moveDown);
      enemy.classList.add('destroyed');
      if (container.contains(enemy)) {
        container.removeChild(enemy);
      }
    }
  }, 50);
}

// Oddzielna funkcja do sprawdzania kolizji
function checkCollisions() {
  document.querySelectorAll('.enemy:not(.destroyed)').forEach((enemy) => {
    document.querySelectorAll('.projectile:not(.destroyed)').forEach((projectile) => {
      if (isColliding(projectile, enemy)) {
        enemy.classList.add('destroyed');
        projectile.classList.add('destroyed');
        var hitSound = document.createElement('audio');
        hitSound.src = 'explosion.mp3';
        hitSound.play();
        hitSound.volume = 0.3;
        hitSound.onended = function () {
          hitSound.remove();
        };
        showExplosion(parseInt(enemy.style.left), parseInt(enemy.style.top));
        if (container.contains(enemy)) {
          container.removeChild(enemy);
        }
        if (container.contains(projectile)) {
          container.removeChild(projectile);
        }
      }
    });
  });
}

// Funkcja sprawdzająca kolizję
function isColliding(a, b) {
  var aRect = a.getBoundingClientRect();
  var bRect = b.getBoundingClientRect();

  return !(
    aRect.right < bRect.left ||
    aRect.left > bRect.right ||
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom
  );
}

// Funkcja do pokazywania eksplozji
function showExplosion(x, y) {
  var explosion = document.createElement('img');
  explosion.src = 'explosion.gif'; 
  explosion.style.position = 'absolute';
  explosion.style.left = x + 'px';
  explosion.style.top = y + 'px';
  explosion.width = 64; // Możesz dostosować rozmiar eksplozji
  explosion.height = 64;
  container.appendChild(explosion);

  // Usuwamy GIF eksplozji po określonym czasie
  setTimeout(function () {
    if (container.contains(explosion)) {
      container.removeChild(explosion);
    }
  }, 1000); // Zakładamy, że animacja trwa 1000 ms (1 sekundę)
}

function spawnStar() {
  var star = document.createElement('div');
  star.className = 'star';
  star.style.position = 'absolute';
  star.style.left = Math.random() * container.offsetWidth + 'px';
  star.style.top = '-5px';
  star.style.width = '2px';
  star.style.height = '2px';
  star.style.backgroundColor = 'white';
  container.appendChild(star);

  moveStar(star);
}

function moveStar(star) {
  var moveDown = setInterval(function () {
    var currentTop = parseInt(star.style.top);
    star.style.top = currentTop + 2 + 'px';
    if (currentTop > container.offsetHeight) {
      clearInterval(moveDown);
      container.removeChild(star);
    }
  }, 50);
}

//start gry

document.getElementById('startScreen').addEventListener('click', startGame);

// Dodanie obsługi naciśnięcia klawisza Enter
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    startGame();
  }
});

function startGame() {
  // Sprawdzenie, czy element nie jest już ukryty
  var startScreen = document.getElementById('startScreen');
  if (startScreen.style.display !== 'none') {
    startScreen.style.display = 'none'; // Ukrywa ekran startowy
    initGame(); // Funkcja inicjująca grę
  }
}


