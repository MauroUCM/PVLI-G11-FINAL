import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";

/**
 * Clase Dragon - NPC que se mueve aleatoriamente y activa minijuegos
 * Versión con geometría ( reemplazar con sprites cuando estén listos)
 */
export class Dragon extends Phaser.GameObjects.Container {

    board
    position;
    square;
    invisibleBG;
    
    // Componentes visuales
    visualComponents = {
        body: null,
        head: null,
        eyes: [],
        tail: null,
        wings: []
    };

    constructor(board, randomSpawn, position) {
        super(board.scene, 100, 100);
        this.board = board;

        // Crear visualización del dragón
        this.createDragonGeometry();

        // Posicionar aleatoriamente
        this.randomSpawn(randomSpawn, position);

        // this.invisibleBG = new Phaser.GameObjects.Image(board.scene,(this.position.x),(this.position.y),"Square").setAlpha(0.3);
        // this.invisibleBG.setDisplaySize(board.config.cellSize*2,board.config.cellSize*2)
        // this.invisibleBG.setOrigin(0.5,0.5);
        // console.log(`Dragon t: ${this.x} ${this.y}`)
        

        // Añadir al tablero
        this.setDepth(150); // Por encima de todo
        
        // Configurar eventos
        this.setupEvents();
        
        //El orden importa
        board.scene.add.existing(this);
        board.add(this);

    }

    /**
     * Crea la visualización del dragón usando figuras geométricas
     *  Reemplazar con sprites cuando tengamos las imágenes
     */
    createDragonGeometry() {
        const cellSize = this.board.config.cellSize;
        const scene = this.board.scene;
        
        //  CUERPO PRINCIPAL (círculo verde brillante)
        this.visualComponents.body = scene.add.circle(
            0, 0, 
            cellSize * 0.4, 
            0x00ff88, 
            1
        );
        this.visualComponents.body.setStrokeStyle(2, 0x00cc66);
        
        //  CABEZA (círculo más pequeño adelante)
        this.visualComponents.head = scene.add.circle(
            cellSize * 0.35, 
            -cellSize * 0.15, 
            cellSize * 0.28, 
            0x00dd66, 
            1
        );
        this.visualComponents.head.setStrokeStyle(2, 0x00aa44);
        
        //  OJOS (dos círculos negros) 
        const eye1 = scene.add.circle(
            cellSize * 0.4, 
            -cellSize * 0.2, 
            cellSize * 0.08, 
            0x000000, 
            1
        );
        
        const eye2 = scene.add.circle(
            cellSize * 0.5, 
            -cellSize * 0.2, 
            cellSize * 0.08, 
            0x000000, 
            1
        );
        
        // Brillos en los ojos
        const shine1 = scene.add.circle(
            cellSize * 0.42, 
            -cellSize * 0.22, 
            cellSize * 0.03, 
            0xffffff, 
            1
        );
        
        const shine2 = scene.add.circle(
            cellSize * 0.52, 
            -cellSize * 0.22, 
            cellSize * 0.03, 
            0xffffff, 
            1
        );
        
        this.visualComponents.eyes = [eye1, eye2, shine1, shine2];
        
        // COLA (triángulo usando Graphics) 
        this.visualComponents.tail = scene.add.graphics();
        this.visualComponents.tail.fillStyle(0x00cc55, 1);
        this.visualComponents.tail.lineStyle(2, 0x009944);
        this.visualComponents.tail.fillTriangle(
            -cellSize * 0.3, -cellSize * 0.15,
            -cellSize * 0.7, 0,
            -cellSize * 0.3, cellSize * 0.15
        );
        this.visualComponents.tail.strokeTriangle(
            -cellSize * 0.3, -cellSize * 0.15,
            -cellSize * 0.7, 0,
            -cellSize * 0.3, cellSize * 0.15
        );
        
        // ALAS (elipses semitransparentes)
        const wing1 = scene.add.ellipse(
            -cellSize * 0.1, 
            -cellSize * 0.35, 
            cellSize * 0.35, 
            cellSize * 0.6, 
            0x00bb44, 
            0.6
        );
        wing1.setStrokeStyle(2, 0x008833, 0.8);
        
        const wing2 = scene.add.ellipse(
            -cellSize * 0.1, 
            cellSize * 0.35, 
            cellSize * 0.35, 
            cellSize * 0.6, 
            0x00bb44, 
            0.6
        );
        wing2.setStrokeStyle(2, 0x008833, 0.8);
        
        this.visualComponents.wings = [wing1, wing2];
        
        // DETALLES ADICIONALES 
        // Cuernos
        const horn1 = scene.add.triangle(
            cellSize * 0.3, -cellSize * 0.35,
            cellSize * 0.25, -cellSize * 0.35,
            cellSize * 0.275, -cellSize * 0.5,
            0xffaa00
        );
        
        const horn2 = scene.add.triangle(
            cellSize * 0.45, -cellSize * 0.35,
            cellSize * 0.4, -cellSize * 0.35,
            cellSize * 0.425, -cellSize * 0.5,
            0xffaa00
        );
        
        // Nariz/hocico
        const snout = scene.add.ellipse(
            cellSize * 0.5, 
            -cellSize * 0.05, 
            cellSize * 0.12, 
            cellSize * 0.08, 
            0x00bb44
        );
        
        // Añadir todo al container en orden correcto (atrás -> adelante)
        this.add([
            this.visualComponents.tail,      // Cola atrás
            ...this.visualComponents.wings,   // Alas
            this.visualComponents.body,       // Cuerpo
            this.visualComponents.head,       // Cabeza
            snout,                            // Hocico
            ...this.visualComponents.eyes,    // Ojos con brillos
            horn1, horn2                      // Cuernos arriba
        ]);
        
        // === ANIMACIONES ===
        // Flotación suave
        // scene.tweens.add({
        //     targets: this,
        //     y: '+=8',
        //     duration: 2000,
        //     yoyo: true,
        //     repeat: -1,
        //     ease: 'Sine.easeInOut'
        // });
        
        // Aleteo de alas
        scene.tweens.add({
            targets: this.visualComponents.wings,
            scaleY: 1.1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeInOut'
        });
        
        // Parpadeo ocasional
        scene.time.addEvent({
            delay: 3000,
            callback: () => this.blink(),
            loop: true
        });
        
        /* CUANDO TENGAMOS SPRITES, USAR ESTO:
        
        // Cargar sprite del dragón
        this.sprite = scene.add.sprite(0, 0, 'dragon_sprite');
        this.sprite.setScale(0.8);
        this.add(this.sprite);
        
        // Reproducir animación idle
        this.sprite.play('dragon_idle');
        
        // Animación de aleteo cuando se mueve
        this.sprite.on('dragon_move', () => {
            this.sprite.play('dragon_fly');
        });
        
        */
    }

    /**
     * Animación de parpadeo
     */
    blink() {
        // Hacer invisible los ojos brevemente
        this.visualComponents.eyes.forEach(eye => {
            this.board.scene.tweens.add({
                targets: eye,
                alpha: 0,
                duration: 100,
                yoyo: true
            });
        });
    }

    /**
     * Configura los eventos del dragón
     */
    setupEvents() {
        EventDispatch.on(Event.GET_DRAGON, (callback) => {
            callback.dragon = this;
        });

        EventDispatch.on(Event.MOVE_DRAGON, () => {
            this.randomMove();
        });
        
        // Evento para detectar colisión con submarino
        EventDispatch.on(Event.CHECK_DRAGON_COLLISION, (submarine, callback) => {
            if (this.isNearSubmarine(submarine)) {
                callback.collision = true;
                callback.dragonPosition = this.position;
            }
        });

        
    }

    /**
     * Genera posición aleatoria inicial
     */
    randomSpawn(random, position) {
        let x = null, y = null;
        
        if (!random) {
            this.position = position;
        }
        
        if (random) {
            // Buscar casilla impar disponible
            do {
                x = Phaser.Math.Between(0, (this.board.config.boardWidth - 1) * 2);
            } while (x % 2 === 0);

            do {
                y = Phaser.Math.Between(0, (this.board.config.boardHeight - 1) * 2);
            } while (y % 2 === 0);
            
            console.log('Dragon spawn at:', x, y);
            this.square = this.board.matrix.logic.matrix[x][y];
            this.position = this.square.position;
            this.square.dragonEnter(this);
            
            // Actualizar posición visual
            this.updateVisualPosition();
        }
    }

    /**
     * Actualiza la posición visual del dragón
     */
    updateVisualPosition() {
        const cellSize = this.board.config.cellSize;
        const targetX = this.position.x * cellSize;
        const targetY = this.position.y * cellSize;
        
        // Animación suave de movimiento
        this.board.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: 500,
            ease: 'Quad.easeInOut'
        });

        this.setPosition(targetX,targetY);
        console.log(`Dragon t: ${this.x} ${this.y}`)

    }

    /**
     * Movimiento aleatorio del dragón
     */
    randomMove() {
        let direction, sign, x, y;

        const checkPosition = (x, y) => {
            return x > 0 && 
                   x < ((this.board.config.boardWidth - 1) * 2) &&
                   y > 0 && 
                   y < ((this.board.config.boardHeight - 1) * 2);
        };

        // Encontrar posición válida
        do {
            sign = Math.sign(Phaser.Math.Between(-1, 1));
            direction = Phaser.Math.Between(0, 1);
    
            if (direction === 0) {
                x = this.position.x + (sign * 2);
                y = this.position.y;
            } else {
                x = this.position.x;
                y = this.position.y + (sign * 2);
            }
        } while (!checkPosition(x, y));

        // Actualizar posición lógica
        this.square.dragonExit();
        this.square = this.board.matrix.logic.matrix[x][y];
        this.square.dragonEnter(this);
        this.position = this.square.position;
        
        console.log(`Dragon moved to ${this.position.position}`);
        
        // Actualizar posición visual
        this.updateVisualPosition();
        
        // Efecto visual de movimiento
        this.playMoveEffect();
    }

    /**
     * Efecto visual cuando se mueve
     */
    playMoveEffect() {
        // Escala temporal
        this.board.scene.tweens.add({
            targets: this,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 250,
            yoyo: true,
            ease: 'Back.easeOut'
        });
        
        // Partículas verdes (simulación simple)
        const cellSize = this.board.config.cellSize;
        for (let i = 0; i < 5; i++) {
            const particle = this.board.scene.add.circle(
                this.x + Phaser.Math.Between(-cellSize/2, cellSize/2),
                this.y + Phaser.Math.Between(-cellSize/2, cellSize/2),
                3,
                0x00ff88,
                1
            );
            this.board.add(particle);
            
            this.board.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Verifica si el dragón está cerca de un submarino
     */
    isNearSubmarine(submarine) {
        const subX = submarine.position.x;
        const subY = submarine.position.y;
        const dragonX = this.position.x;
        const dragonY = this.position.y;
        
        // Verificar si el submarino está en un vértice adyacente a la casilla del dragón
        const adjacentVertices = this.square.nextPoint;
        
        return adjacentVertices.some(vertex => 
            vertex && vertex.position.x === subX && vertex.position.y === subY
        );
    }

    /**
     * Limpieza cuando se destruye el dragón
     */
    destroy(fromScene) {
        // Limpiar eventos
        EventDispatch.off(Event.GET_DRAGON);
        EventDispatch.off(Event.MOVE_DRAGON);
        EventDispatch.off(Event.CHECK_DRAGON_COLLISION);
        
        super.destroy(fromScene);
    }
}