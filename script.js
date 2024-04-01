class Game {
  static get FIRE_DELAY() {
    return 300;
  } // opóźnienie wystrzału
  static get ENEMY_SPAWN_DELAY() {
    return 5000;
  } // opóźnienie pojawiania się wrogów
  static get STAR_SPAWN_DELAY() {
    return 200;
  } // opóźnienie pojawiania się gwiazd
  static get COLLISION_CHECK_DELAY() {
    return 10;
  } // opóźnienie sprawdzania kolizji
  static get EXPLOSION_DURATION() {
    return 1000;
  } // czas trwania animacji eksplozji

  constructor(container) {
    this.container = document.getElementById(container);
    this.player = new Player(this.container, this);
    this.enemies = [];
    this.projectiles = [];
    this.stars = [];
    this.isMusicPlaying = false;
    this.initEventListeners();
    this.lastFireTime = 0;
  }

  initGame() {
    this.player.setPosition();
    setInterval(() => this.checkCollisions(), Game.COLLISION_CHECK_DELAY);
    setInterval(() => this.spawnEnemy(), Game.ENEMY_SPAWN_DELAY);
    setInterval(() => this.spawnStar(), Game.STAR_SPAWN_DELAY);
  }

  movePlayer(e) {
    this.player.move(e);
  }

  fireProjectile() {
    const currentTime = new Date().getTime();
    if (currentTime - this.lastFireTime > Game.FIRE_DELAY) {
      // Użycie Game.FIRE_DELAY zamiast this.fireDelay
      const projectile = this.player.fire();
      this.projectiles.push(projectile);
      this.container.appendChild(projectile.element);
      this.lastFireTime = currentTime;
    }
  }

  spawnEnemy() {
    // Sprawdź, czy muzyka jest już odtwarzana
    if (!this.isMusicPlaying) {
      var audioElement = document.getElementById('backgroundMusic');
      if (audioElement.paused) {
        audioElement
          .play()
          .then(() => {
            this.isMusicPlaying = true; // Ustawienie flagi, że muzyka już gra
          })
          .catch((e) => {
            console.error('Playback failed:', e);
            // Możesz tu wyświetlić jakąś informację dla użytkownika, że wymagane jest interakcja
          });
      }
    }

    // Reszta logiki spawnEnemy
    const enemy = new Enemy(this.container);
    this.enemies.push(enemy);
    this.container.appendChild(enemy.element);
    enemy.move();
  }

  spawnStar() {
    const star = new Star(this.container);
    this.stars.push(star);
    this.container.appendChild(star.element);
    star.move();
  }

  checkCollisions() {
    this.projectiles.forEach((projectile, pIndex) => {
      this.enemies.forEach((enemy, eIndex) => {
        if (this.isColliding(projectile.element, enemy.element)) {
          this.handleCollision(projectile, enemy, pIndex, eIndex);
        }
      });
    });
  }

  isColliding(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return !(
      aRect.right < bRect.left ||
      aRect.left > bRect.right ||
      aRect.bottom < bRect.top ||
      aRect.top > bRect.bottom
    );
  }

  handleCollision(projectile, enemy, pIndex, eIndex) {
    projectile.hitEnemy = true;
    projectile.destroy(); // Zaktualizowane, aby użyć nowej metody
  
    // Usuń wroga
    enemy.element.remove();
    this.enemies.splice(eIndex, 1);
  
    // Odtwórz dźwięk eksplozji i pokaż animację
    this.playExplosionSound();
    const explosionX = parseInt(enemy.element.style.left, 10);
    const explosionY = parseInt(enemy.element.style.top, 10);
    this.showExplosion(explosionX, explosionY);
  }
  

  playExplosionSound() {
    var explosionSound = document.getElementById('explosionSound');
    if (explosionSound) {
      explosionSound.currentTime = 0; // Resetuj czas, jeśli dźwięk został już wcześniej odtworzony
      explosionSound.play().catch((e) => console.error('Playback failed:', e));
    }
  }

  showExplosion(x, y) {
    const explosion = document.createElement('img');
    explosion.src = 'explosion.gif'; // Ścieżka do animacji eksplozji
    explosion.style.position = 'absolute';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    explosion.width = 64; // Dostosuj rozmiar eksplozji
    explosion.height = 64;
    this.container.appendChild(explosion);

    // Usuń GIF eksplozji po określonym czasie
    setTimeout(() => {
      this.container.removeChild(explosion);
    }, 1000); // Zakładamy, że animacja trwa 1000 ms (1 sekundę)
  }

  initEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.movePlayer(e);
      if (e.keyCode === 32) {
        // space
        this.fireProjectile();
      }
    });
  }
}

class Player {
  static get SPEED() { return 10; }
  static get HEIGHT() { return 200; } // zmiana na wartość liczbową dla jednolitości
  static get WIDTH() { return 100; } // przykładowa szerokość, dopasuj wg potrzeb
  static get IMAGE_SRC() { return 'robot.png'; }
  static get FIRE_SOUND_SRC() { return 'lasershot.mp3'; }

  constructor(container, gameInstance) {
    this.container = container;
    this.game = gameInstance;
    this.element = document.createElement('img');
    this.element.src = Player.IMAGE_SRC;
    this.element.style.position = 'absolute';
    this.element.style.height = `${Player.HEIGHT}px`;
    // Można dodać ustawienie szerokości, jeśli jest potrzebne
    // this.element.style.width = `${Player.WIDTH}px`;
    this.container.appendChild(this.element);
  }

  setPosition() {
    // Ustawienie pozycji bazujące na zdefiniowanych wysokości i szerokości
    const positionX = (this.container.offsetWidth - Player.WIDTH) / 2;
    const positionY = this.container.offsetHeight - Player.HEIGHT;
    this.element.style.left = `${positionX}px`;
    this.element.style.top = `${positionY}px`;
  }

  move(e) {
    let positionX = parseInt(this.element.style.left, 10);
    let positionY = parseInt(this.element.style.top, 10);

    switch (e.keyCode) {
      case 37: // lewo
        positionX -= Player.SPEED;
        break;
      case 38: // góra
        positionY -= Player.SPEED;
        break;
      case 39: // prawo
        positionX += Player.SPEED;
        break;
      case 40: // dół
        positionY += Player.SPEED;
        break;
    }

    // Użycie Player.WIDTH i Player.HEIGHT zamiast bezpośredniego dostępu do element.style
    positionX = Math.max(0, Math.min(this.container.offsetWidth - Player.WIDTH, positionX));
    positionY = Math.max(0, Math.min(this.container.offsetHeight - Player.HEIGHT, positionY));

    this.element.style.left = `${positionX}px`;
    this.element.style.top = `${positionY}px`;
  }

  fire() {
    const projectile = new Projectile(
      this.container,
      parseInt(this.element.style.left, 10) + Player.WIDTH / 2, // Centrowanie pocisku
      parseInt(this.element.style.top, 10),
      this.game
    );

    this.playFireSound();

    return projectile;
  }

  playFireSound() {
    const fireSound = new Audio(Player.FIRE_SOUND_SRC);
    fireSound.play().catch((e) => console.error('Playback failed:', e));
    fireSound.onended = function () {
      fireSound.remove(); // Usuń element audio po zakończeniu odtwarzania
    };
  }
  
  // Reszta klasy Player...
}


class Projectile {
  constructor(container, startX, startY, gameInstance) {
    this.container = container;
    this.game = gameInstance;
    this.element = document.createElement('img');
    this.element.src = 'weapon.png';
    this.element.style.position = 'absolute';
    this.element.style.left = `${startX - 25}px`;
    this.element.style.top = `${startY}px`;
    this.element.style.height = '50px';
    this.hitEnemy = false;
    this.move();
  }

  move() {
    const interval = setInterval(() => {
      let posY = parseInt(this.element.style.top) - 5;
      if (posY < 0) {
        clearInterval(interval);
        this.destroy();
      } else {
        this.element.style.top = `${posY}px`;
      }
    }, 20);
  }

  destroy() {
    if (this.element.parentNode === this.container) {
      this.container.removeChild(this.element);
    }
    // Usuwamy pocisk z listy pocisków w instancji gry
    const index = this.game.projectiles.indexOf(this);
    if (index > -1) {
      this.game.projectiles.splice(index, 1);
    }
  }
}


class Enemy {
  constructor(container) {
    this.container = container;
    this.element = document.createElement('img');
    this.element.src = 'spider.png';
    this.element.className = 'enemy';
    this.element.style.position = 'absolute';
    this.element.style.left = `${
      Math.random() * (container.offsetWidth - 50)
    }px`; // Losowa pozycja X, zakładając szerokość wroga 50px
    this.element.style.top = '0px';
    this.element.style.width = '50px';
    this.element.style.height = '50px';
    this.move();
   }

   move() {
    const moveDown = setInterval(() => {
      let currentTop = parseInt(this.element.style.top);
      this.element.style.top = `${currentTop + 1}px`;
      if (currentTop > this.container.offsetHeight) {
        clearInterval(moveDown);
        // Sprawdź, czy element nadal jest dzieckiem kontenera przed usunięciem
        if (this.element.parentNode === this.container) {
          this.container.removeChild(this.element);
        }
      }
    }, 50);
  }
  
}

class Star {
  constructor(container) {
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = 'star';
    this.element.style.position = 'absolute';
    this.element.style.left = `${Math.random() * container.offsetWidth}px`;
    this.element.style.top = '-5px';
    this.element.style.width = '2px';
    this.element.style.height = '2px';
    this.element.style.backgroundColor = 'white';
    this.move();
  }

  move() {
    const moveDown = setInterval(() => {
      let currentTop = parseInt(this.element.style.top);
      this.element.style.top = `${currentTop + 2}px`;
      if (currentTop > this.container.offsetHeight) {
        clearInterval(moveDown);
        // Sprawdź, czy element jest dzieckiem kontenera przed usunięciem
        if (this.container.contains(this.element)) {
          this.container.removeChild(this.element);
        }
      }
    }, 50);
  }
}

// Przykład użycia
document.getElementById('startScreen').addEventListener('click', startGame);
document.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    startGame();
  }
});

let game; // Zmienna do przechowywania instancji gry

function startGame() {
  var startScreen = document.getElementById('startScreen');
  if (startScreen.style.display !== 'none') {
    startScreen.style.display = 'none'; // Ukrywa ekran startowy
    game = new Game('container'); // Tworzy instancję gry, kiedy zaczynamy grę
    game.initGame(); // Rozpoczyna grę
  }
}
