
export class Flappy_Dragon extends Phaser.Scene {
    constructor() {
        super({ key: 'FlappyDragon' });
    }

    preload() {
        // No necesitamos cargar nada
    }

    create() {
        // Variables básicas
        this.puntos = 0;
        this.gameOver = false;
         this.timer = 60; // poner aqui la duracion del minijuego en segundos
       
        // FONDO (Rectángulo azul simple)
        
        this.add.rectangle(400, 300, 800, 600, 0x003366);
        

        // DRAGÓN (Círculo naranja)
        // Crear sprite de física
        this.dragon = this.physics.add.sprite(150, 300);
        
        // Dibujar el dragón como círculo
        const graphics = this.add.graphics();
        graphics.fillStyle(0xff6600, 1);
        graphics.fillCircle(0, 0, 20);
        graphics.generateTexture('dragon', 40, 40);
        graphics.destroy();
        
        this.dragon.setTexture('dragon');
        
        // FÍSICA DEL DRAGÓN
        this.dragon.body.gravity.y = 800;        // Cae
        this.dragon.setCollideWorldBounds(true); // No sale de pantalla
        

        // GRUPO DE BASURA
        this.basuras = this.physics.add.group();
        
        // Crear textura para basura (cuadrado verde)
        const gfxBasura = this.add.graphics();
        gfxBasura.fillStyle(0x00ff00, 1);
        gfxBasura.fillRect(0, 0, 30, 30);
        gfxBasura.generateTexture('basura', 30, 30);
        gfxBasura.destroy();
        
        // Colisión dragón-basura
        this.physics.add.overlap(
            this.dragon,
            this.basuras,
            this.recogerBasura,
            null,
            this
        );
        
        // CONTROLES
        this.input.keyboard.on('keydown-L', () => {
            if (!this.gameOver) {
                // ALETEAR: Impulso hacia arriba
                this.dragon.setVelocityY(-350);
            }
        });
        

        // INTERFAZ
        this.textoPuntos = this.add.text(16, 16, 'Puntos: 0', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        
        this.add.text(400, 16, 'L para saltar \nR para restart \nESC para volver al menu', {
            fontSize: '18px',
            fill: '#ffff00'
        }).setOrigin(0.5, 0);


        
        // Crear el temporizador en pantalla
        this.textoTimer = this.add.text(600, 16, 'Tiempo: 02:00', {
            fontSize: '20px',
            fill: '#ffffff'
        });

        // GENERAR BASURA CADA 2 SEGUNDOS
        this.time.addEvent({
            delay: 2000,
            callback: this.generarBasura,
            callbackScope: this,
            loop: true
        });

         // Iniciar el temporizador
        this.time.addEvent({
            delay: 1000,
            callback: this.decrementarTiempo,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * GENERAR BASURA
     */
    generarBasura() {
        if (this.gameOver) return;
        
        // Posición aleatoria en Y
        const y = Phaser.Math.Between(50, 550);
        
        // Crear basura en el borde derecho
        const basura = this.basuras.create(850, y, 'basura');
        
        // Mover hacia la izquierda
        basura.setVelocityX(-200);
    }

    /**
     * RECOGER BASURA
     */
    recogerBasura(dragon, basura) {
        // Destruir basura
        basura.destroy();
        
        // Sumar puntos
        this.puntos += 10;
        this.textoPuntos.setText('Puntos: ' + this.puntos);
        
        // Pequeño impulso
        dragon.setVelocityY(-100);
    }

       decrementarTiempo() {
        if (this.gameOver) return;
        
        this.timer--; // Disminuir el tiempo

        // Formatear el tiempo (minutos:segundos)
        const minutos = Math.floor(this.timer / 60);
        const segundos = this.timer % 60;
        this.textoTimer.setText(`Tiempo: ${minutos}:${segundos < 10 ? '0' : ''}${segundos}`);

        // Si el tiempo se acaba, termina el juego
        if (this.timer <= 0) {
            this.gameOver = true;
            this.physics.pause();
            this.add.text(400, 300, `TIEMPO AGOTADO\nPuntos: ${this.puntos}\n\nPresiona R para reiniciar`, {
                fontSize: '32px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            this.input.keyboard.once('keydown-R', () => {
                this.scene.restart();
            });

            this.input.keyboard.once('keydown-ESC', () => {
                this.scene.start('menu');
            });
        }
    }

    /**
     * UPDATE
     */
    update() {
        if (this.gameOver) return;
        
        // Destruir basuras que salieron de pantalla
        this.basuras.children.entries.forEach(basura => {
            if (basura.x < -50) {
                basura.destroy();
            }
        });
        
        // Game over si toca el suelo
        if (this.dragon.y >= 590) {
            this.gameOver = true;
            this.physics.pause();
            
            this.add.text(400, 300, 'GAME OVER\nPuntos: ' + this.puntos + '\n\nPresiona R', {
                fontSize: '32px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            this.input.keyboard.once('keydown-R', () => {
                this.scene.restart();
            });

			// ESC para volver al menú
			this.input.keyboard.once('keydown-ESC', () => {
				this.scene.start('menu'); 
			});
        }

    }
}