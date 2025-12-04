// import GameBoard from "../Board/GameBoard.js";
// import { InputManager } from "../Input/InputManager.js";

export class Submarine_View extends Phaser.Scene {
    constructor() {
        super({ key: 'Submarine_View' });
        
        // Posiciones temporales de los submarinos (estas vendran del sistema de movimiento)
        // Los submarinos estan en vertices (coordenadas pares)
        this.submarine1 = {
            x: 2,  // posicion en el tablero logico
            y: 2,
            direction: 'north'  // north, south, east, west
        };
        
        this.submarine2 = {
            x: 2,  // posicion en el tablero logico
            y: 6,  // 2 casillas al sur del submarino 1
            direction: 'south'
        };
    }

    preload(){
        console.log("preload");
        
        this.load.image("Square","Page/img/Profile/Lappland.jpeg")
        this.load.image("BG","assets/GameBoard_BG.jpg")
        this.load.image("Submarine","assets/red.png")
    }

    create() {
        // let texturas = ["Square","BG", "Submarine"];
        // this.tablero = new GameBoard(this,11,11,200,0,texturas,40);
        // this.inputManager = new InputManager(this, this.tablero.submarines.blue, this.tablero.submarines.red);
        // this.tablero.setToTop();

        const screenWidth = this.cameras.main.width;   // 800
        const screenHeight = this.cameras.main.height; // 600
        
        // PANTALLA DIVIDIDA: mitad superior para Jugador 1, mitad inferior para Jugador 2
        const halfHeight = screenHeight / 2; // 300px por jugador
        
        //JUGADOR 1 (Parte Superior)
        this.createPlayerViews(0, 0, screenWidth, halfHeight, 'JUGADOR 1', this.submarine1, this.submarine2);
        
        // Linea divisoria
        const line = this.add.graphics();
        line.lineStyle(2, 0xffffff, 1);
        line.lineBetween(0, halfHeight, screenWidth, halfHeight);
        
        // JUGADOR 2 (Parte Inferior)
        this.createPlayerViews(0, halfHeight, screenWidth, halfHeight, 'JUGADOR 2', this.submarine2, this.submarine1);
    }

    /**
     * Crea las 3 vistas para un jugador
     */
    createPlayerViews(x, y, width, height, playerLabel, mySub, enemySub) {
        const viewWidth = width / 3;
        
        // VISTA LATERAL IZQUIERDA
        const leftDirection = this.getLeftDirection(mySub.direction);
        this.createSingleView(
            x,
            y,
            viewWidth,
            height,
            'LAT. IZQ',
            mySub,
            enemySub,
            leftDirection
        );
        
        // VISTA FRONTAL (Centro)
        this.createSingleView(
            x + viewWidth,
            y,
            viewWidth,
            height,
            'FRONTAL',
            mySub,
            enemySub,
            mySub.direction
        );
        
        // VISTA LATERAL DERECHA
        const rightDirection = this.getRightDirection(mySub.direction);
        this.createSingleView(
            x + (viewWidth * 2),
            y,
            viewWidth,
            height,
            'LAT. DER',
            mySub,
            enemySub,
            rightDirection
        );
        
        // Etiqueta del jugador
        this.add.text(x + 10, y + 10, playerLabel, {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
    }

    /**
     * Crea una vista individual
     */
    createSingleView(x, y, width, height, label, mySub, enemySub, viewDirection) {
        // Fondo azul oscuro (agua) - UNA SOLA PANTALLA
        const waterBg = this.add.rectangle(
            x + width / 2,
            y + height / 2,
            width - 10,
            height - 20,
            0x001a33,
            1
        );
        
        // Borde blanco de la vista
        const border = this.add.graphics();
        border.lineStyle(2, 0xffffff, 1);
        border.strokeRect(x + 5, y + 10, width - 10, height - 20);
        
        // Etiqueta de la vista
        this.add.text(x + width / 2, y + 15, label, {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 3 }
        }).setOrigin(0.5, 0);
        
        // Renderizar el contenido - UNA SOLA IMAGEN
        this.renderViewContent(x, y, width, height, mySub, enemySub, viewDirection);
    }

    /**
     * Renderiza el contenido de la vista - SOLO UNA IMAGEN del submarino si esta visible
     */
    renderViewContent(x, y, width, height, mySub, enemySub, viewDirection) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Calcular las coordenadas de las 2 casillas visibles
        const visibleCells = this.getVisibleCells(mySub, viewDirection);
        
        // Buscar en cual casilla esta el enemigo (si esta)
        let enemyDistance = null;
        
        visibleCells.forEach((cell, index) => {
            if (this.isEnemyInCell(enemySub, cell)) {
                enemyDistance = index + 1; // 1 = cerca, 2 = lejos
            }
        });
        
        // Dibujar segun si hay enemigo o no
        if (enemyDistance !== null) {
            // HAY ENEMIGO - Dibujar submarino
            this.drawSubmarine(centerX, centerY, enemyDistance);
        } else {
            // NO HAY ENEMIGO - Solo agua
            this.drawWater(centerX, centerY);
        }
    }

    /**
     * Dibuja el submarino enemigo con tamano segun distancia
     */
    drawSubmarine(centerX, centerY, distance) {
        let size;
        
        if (distance === 1) {
            // Enemigo CERCA (1 casilla) - MAS GRANDE
            size = 120;
        } else {
            // Enemigo LEJOS (2 casillas) - MAS PEQUENO
            size = 60;
        }
        
        // Cuerpo del submarino (circulo rojo)
        this.add.circle(centerX, centerY, size * 0.4, 0xff0000, 1);
        
        // Torre del submarino (rectangulo)
        this.add.rectangle(
            centerX,
            centerY - size * 0.25,
            size * 0.3,
            size * 0.5,
            0xcc0000,
            1
        );
        
        // Periscopio (linea)
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0x990000, 1);
        graphics.lineBetween(
            centerX, 
            centerY - size * 0.5, 
            centerX, 
            centerY - size * 0.8
        );
        
        // Texto de alerta
        this.add.text(centerX, centerY + size * 0.6, '! ENEMIGO !', {
            fontSize: distance === 1 ? '14px' : '11px',
            fill: '#ff0000',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 3, y: 2 }
        }).setOrigin(0.5);
        
        // Indicador de distancia
        this.add.text(centerX, centerY - size * 0.9, distance + ' casilla' + (distance === 1 ? '' : 's'), {
            fontSize: '10px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 3, y: 1 }
        }).setOrigin(0.5);
    }

    /**
     * Dibuja agua vacia (sin submarino)
     */
    drawWater(centerX, centerY) {
        // Efecto de agua con circulos concentricos
        this.add.circle(centerX, centerY, 80, 0x003366, 0.3);
        this.add.circle(centerX, centerY, 50, 0x004488, 0.4);
        this.add.circle(centerX, centerY, 25, 0x0055aa, 0.5);
        
        // Texto
        this.add.text(centerX, centerY, 'Agua oscura\n(sin enemigo)', {
            fontSize: '12px',
            fill: '#66ccff',
            align: 'center',
            alpha: 0.7
        }).setOrigin(0.5);
    }

    /**
     * Obtiene las coordenadas de las casillas visibles
     */
    getVisibleCells(mySub, direction) {
        const cells = [];
        const dirVector = this.getDirectionVector(direction);
        
        // Calcular las 2 casillas visibles
        for (let depth = 1; depth <= 2; depth++) {
            cells.push({
                x: mySub.x + (dirVector.x * depth * 2),
                y: mySub.y + (dirVector.y * depth * 2)
            });
        }
        
        return cells;
    }

    /**
     * Verifica si el submarino enemigo esta en una casilla especifica
     */
    isEnemyInCell(enemySub, cell) {
        return enemySub.x === cell.x && enemySub.y === cell.y;
    }

    /**
     * Obtiene el vector de direccion
     */
    getDirectionVector(direction) {
        const vectors = {
            'north': { x: 0, y: -1 },
            'south': { x: 0, y: 1 },
            'east': { x: 1, y: 0 },
            'west': { x: -1, y: 0 }
        };
        return vectors[direction] || { x: 0, y: 0 };
    }

    /**
     * Obtiene la direccion izquierda
     */
    getLeftDirection(direction) {
        const left = {
            'north': 'west',
            'west': 'south',
            'south': 'east',
            'east': 'north'
        };
        return left[direction];
    }

    /**
     * Obtiene la direccion derecha
     */
    getRightDirection(direction) {
        const right = {
            'north': 'east',
            'east': 'south',
            'south': 'west',
            'west': 'north'
        };
        return right[direction];
    }
}