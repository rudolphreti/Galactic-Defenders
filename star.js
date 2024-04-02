export class Star {
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