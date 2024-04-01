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
      const audioElement = document.getElementById('backgroundMusic');
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

    // Nowa logika sprawdzająca kolizje wroga z graczem
    this.enemies.forEach((enemy, index) => {
      if (this.isColliding(enemy.element, this.player.element)) {
        this.handlePlayerCollision();
        this.enemies.splice(index, 1); // Usunięcie wroga po kolizji
      }
    });
  }

  handlePlayerCollision() {
    // Usunięcie gracza
    this.player.element.remove();

    // Odtworzenie animacji wybuchu
    const explosionX = parseInt(this.player.element.style.left, 10);
    const explosionY = parseInt(this.player.element.style.top, 10);
    this.showExplosion(explosionX, explosionY);

    // Odtworzenie dźwięku wybuchu
    this.playExplosionSound();

    // Opóźnienie wyświetlenia ekranu końca gry
    setTimeout(() => {
        const gameOverScreen = document.getElementById('gameOverScreen');
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.opacity = 0;
        gameOverScreen.style.transition = 'opacity 1s';
        // Animacja przejścia od transparencji 0 do 1
        setTimeout(() => {
            gameOverScreen.style.opacity = 1;
        }, 10); // Małe opóźnienie, aby zapewnić, że przejście jest widoczne
    }, 3000); // Czas opóźnienia przed pokazaniem ekranu końca gry
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
    const explosionSound = document.getElementById('explosionSound');
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
  static get SPEED() {
    return 10;
  }
  static get HEIGHT() {
    return 200;
  } // zmiana na wartość liczbową dla jednolitości
  static get WIDTH() {
    return 100;
  } // przykładowa szerokość, dopasuj wg potrzeb
  static get IMAGE_SRC() {
    return 'robot.png';
  }
  static get FIRE_SOUND_SRC() {
    return 'lasershot.mp3';
  }

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
    positionX = Math.max(
      0,
      Math.min(this.container.offsetWidth - Player.WIDTH, positionX)
    );
    positionY = Math.max(
      0,
      Math.min(this.container.offsetHeight - Player.HEIGHT, positionY)
    );

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
}

class Projectile {
  static get SPEED() {
    return 5;
  } // prędkość ruchu pocisku w pikselach
  static get MOVE_INTERVAL() {
    return 20;
  } // interwał ruchu pocisku w milisekundach
  static get WIDTH() {
    return 30;
  } // szerokość pocisku
  static get HEIGHT() {
    return 50;
  } // wysokość pocisku
  static get IMAGE_SRC() {
    return 'weapon.png';
  } // ścieżka do obrazka pocisku

  constructor(container, startX, startY, gameInstance) {
    this.container = container;
    this.game = gameInstance;
    this.element = document.createElement('img');
    this.element.src = Projectile.IMAGE_SRC;
    this.element.style.position = 'absolute';
    // Centrowanie pocisku względem pozycji wystrzału
    this.element.style.left = `${startX - Projectile.WIDTH - 10}px`;
    this.element.style.top = `${startY - 30}px`;
    this.element.style.width = `${Projectile.WIDTH}px`;
    this.element.style.height = `${Projectile.HEIGHT}px`;
    this.hitEnemy = false;
    this.move();
  }

  move() {
    const interval = setInterval(() => {
      let posY = parseInt(this.element.style.top) - Projectile.SPEED;
      if (posY < 0) {
        clearInterval(interval);
        this.destroy();
      } else {
        this.element.style.top = `${posY}px`;
      }
    }, Projectile.MOVE_INTERVAL);
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
  static get SPEED() {
    return 1;
  }
  static get MOVE_INTERVAL() {
    return 50;
  }
  static get WIDTH() {
    return 50;
  }
  static get HEIGHT() {
    return 50;
  }
  static get IMAGE_SRC() {
    return 'spider.png';
  }
  static get MOVE_AREA() {
    return 100;
  } // Nowa stała określająca maksymalny obszar ruchu

  constructor(container) {
    this.container = container;
    this.element = document.createElement('img');
    this.element.src = Enemy.IMAGE_SRC;
    this.element.className = 'enemy';
    this.element.style.position = 'absolute';
    this.initialX = Math.random() * (container.offsetWidth - Enemy.WIDTH);
    this.element.style.left = `${this.initialX}px`;
    this.element.style.top = '0px';
    this.element.style.width = `${Enemy.WIDTH}px`;
    this.element.style.height = `${Enemy.HEIGHT}px`;
    this.directionX = Math.random() < 0.5 ? -1 : 1; // Losowy kierunek ruchu w poziomie
    this.directionY = Math.random() < 0.5 ? -1 : 1; // Losowy kierunek ruchu w pionie
    this.move();
  }

  move() {
    const moveEnemy = setInterval(() => {
      let currentTop = parseInt(this.element.style.top, 10);
      let currentLeft = parseInt(this.element.style.left, 10);

      // Ruch w pionie
      currentTop += Enemy.SPEED * this.directionY;
      // Ruch w poziomie
      currentLeft += Enemy.SPEED * this.directionX;

      // Sprawdzenie, czy wróg nie wyszedł poza ustalony obszar ruchu
      if (
        currentTop <= 0 ||
        currentTop >= this.container.offsetHeight - Enemy.HEIGHT
      ) {
        this.directionY *= -1; // Zmiana kierunku na przeciwny
      }
      if (
        currentLeft <= this.initialX - Enemy.MOVE_AREA ||
        currentLeft >= this.initialX + Enemy.MOVE_AREA
      ) {
        this.directionX *= -1; // Zmiana kierunku na przeciwny
      }

      this.element.style.top = `${currentTop}px`;
      this.element.style.left = `${currentLeft}px`;
    }, Enemy.MOVE_INTERVAL);
  }
}

class Star {
  static get SPEED() {
    return 2;
  } // Prędkość, z jaką gwiazdy poruszają się w dół ekranu
  static get MOVE_INTERVAL() {
    return 50;
  } // Interwał aktualizacji pozycji gwiazd
  static get SIZE() {
    return 2;
  } // Rozmiar gwiazdy w pikselach
  static get COLOR() {
    return 'white';
  } // Kolor gwiazdy

  constructor(container) {
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = 'star';
    this.element.style.position = 'absolute';
    this.element.style.left = `${Math.random() * container.offsetWidth}px`; // Losowa pozycja X
    this.element.style.top = '-5px'; // Start z góry poza ekranem
    this.element.style.width = `${Star.SIZE}px`;
    this.element.style.height = `${Star.SIZE}px`;
    this.element.style.backgroundColor = Star.COLOR;
    this.move();
  }

  move() {
    const moveDown = setInterval(() => {
      let currentTop = parseInt(this.element.style.top);
      this.element.style.top = `${currentTop + Star.SPEED}px`;
      if (currentTop > this.container.offsetHeight) {
        clearInterval(moveDown);
        // Usuwanie gwiazdy, jeśli wyjdzie poza kontener
        if (this.element.parentNode === this.container) {
          this.container.removeChild(this.element);
        }
      }
    }, Star.MOVE_INTERVAL);
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
  const startScreen = document.getElementById('startScreen');
  if (startScreen.style.display !== 'none') {
    startScreen.style.display = 'none'; // Ukrywa ekran startowy
    game = new Game('container'); // Tworzy instancję gry, kiedy zaczynamy grę
    game.initGame(); // Rozpoczyna grę
  }
}
