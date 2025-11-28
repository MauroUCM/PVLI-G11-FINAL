
export class Flappy_Dragon extends Phaser.Scene {
    constructor() {
        super({ key: 'FlappyDragon' });
    }

    preload() {
		this.load.image('fondo1', 'assets/fondo_1.png');
        this.load.image('fondo2', 'assets/fondo_2.png');
        this.load.image('fondo3', 'assets/fondo_3.png');
		this.load.image('suelo', 'assets/suelo.png');
    }

    create() {
        // Variables básicas
        this.puntos = 0;
        this.gameOver = false;
        this.MaxBasuraRespawn = 3000;
         this.timer = 60; // poner aqui la duracion del minijuego en segundos
       
        // FONDO (Rectángulo azul simple)
        this.add.rectangle(400, 300, 800, 600, 0x003366);
        
        
        // PARALAX
        
        this.fondo1 = this.add.tileSprite(0, 100, 0, 0, 'fondo1')
            .setOrigin(0)
            .setScrollFactor(0, 1);

        this.fondo2 = this.add.tileSprite(0, 100, 0, 0, 'fondo2')
            .setOrigin(0)
            .setScrollFactor(0, 1);

        this.fondo3 = this.add.tileSprite(0, 100, 0, 0, 'fondo3')
            .setOrigin(0)
            .setScrollFactor(0, 1);


        this.add.image(0, 360, 'suelo');
        
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

        this.input.keyboard.once('keydown-ESC', () => { // VOLVER AL MENU
            this.scene.start('menu');
        });
        
        this.input.keyboard.once('keydown-R', () => {   // REINICIAR
            this.scene.restart();
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

        // GENERAR BASURA
        this.generarBasura();
        
        // Crear el temporizador en pantalla
        this.textoTimer = this.add.text(600, 16, '[PLACEHOLDER]', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        
        // Formatear el tiempo (minutos:segundos) 
        const minutos = Math.floor(this.timer / 60);
        const segundos = this.timer % 60;
        this.textoTimer.setText(`Tiempo: ${minutos}:${segundos < 10 ? '0' : ''}${segundos}`);

         // Iniciar el temporizador
        this.time.addEvent({
            delay: 1000,
            callback: this.decrementarTiempo,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * GENERA BASURA CADA X CANTIDAD DE TIEMPO RECURSIVAMENTE
     */
    generarBasura() {
        if (this.gameOver) return;
        
        // Posición aleatoria en Y
        const y = Phaser.Math.Between(50, 550);
        
        // Crear basura en el borde derecho
        const basura = this.basuras.create(850, y, 'basura');
        
        // Mover hacia la izquierda
        basura.setVelocityX(-200);
        
        // Llamada recursiva
        this.time.delayedCall(Phaser.Math.Between(500,this.MaxBasuraRespawn), this.generarBasura, [] ,this);
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
        if (this.dragon.y >= 588) {
            this.gameOver = true;
            this.physics.pause();
            
            this.add.text(400, 300, 'GAME OVER\nPuntos: ' + this.puntos + '\n\nPresiona R', {
                fontSize: '32px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

			// ESC para volver al menú
			this.input.keyboard.once('keydown-ESC', () => {
				this.scene.start('menu'); 
			});
        }

        // SCROLL PARALAX
        this.fondo1.setTilePosition(this.fondo1.tilePositionX + 1);
        this.fondo2.setTilePosition(this.fondo2.tilePositionX + 2);
        this.fondo3.setTilePosition(this.fondo3.tilePositionX + 3);


    }
}