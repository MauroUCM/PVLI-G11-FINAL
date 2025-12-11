/**
 * FlappyDragon - Minijuego
 * 
 * El dragón debe recoger basura limpia (verde) y esquivar basura tóxica (roja)
 * Cada X puntos, gana un recurso para su submarino
 */
export class Flappy_Dragon extends Phaser.Scene {
    constructor() {
        super({ key: 'FlappyDragon' });
    }

    init(data) {
        // Datos del submarino que activó el minijuego
        this.submarine = data.submarine || null;
        this.returnScene = data.returnScene || 'GameScreen';
    }

    preload() {
        this.load.image('fondo1', 'assets/fondo_1.png');
        this.load.image('fondo2', 'assets/fondo_2.png');
        this.load.image('fondo3', 'assets/fondo_3.png');
        this.load.image('suelo', 'assets/suelo.png');
    }

    create() {
        //VARIABLES DEL JUEGO
        this.puntos = 0;
        this.gameOver = false;
        this.timer = 60; // Duración en segundos
        this.resourcesEarned = 0; // Recursos ganados
        this.pointsPerResource = 50; // Puntos necesarios para ganar 1 recurso
        this.nextResourceThreshold = this.pointsPerResource;
        
        //FONDO AZUL
        this.add.rectangle(400, 300, 800, 600, 0x003366);
        
        // PARALLAX 
        this.fondo1 = this.add.tileSprite(0, 100, 800, 500, 'fondo1')
            .setOrigin(0)
            .setScrollFactor(0, 1);

        this.fondo2 = this.add.tileSprite(0, 100, 800, 500, 'fondo2')
            .setOrigin(0)
            .setScrollFactor(0, 1);

        this.fondo3 = this.add.tileSprite(0, 100, 800, 500, 'fondo3')
            .setOrigin(0)
            .setScrollFactor(0, 1);

        this.add.image(400, 580, 'suelo').setScale(1, 0.5);
        
        //  DRAGÓN (usando geometría) 
        this.createDragon();
        
        // GRUPOS DE OBJETOS
        this.basuraLimpia = this.physics.add.group(); // Basura verde (recoger)
        this.basuraToxica = this.physics.add.group(); // Basura roja (esquivar)
        
        // Crear texturas para basura
        this.createTrashTextures();
        
        // COLISIONES
        this.physics.add.overlap(
            this.dragon,
            this.basuraLimpia,
            this.recogerBasuraLimpia,
            null,
            this
        );
        
        this.physics.add.overlap(
            this.dragon,
            this.basuraToxica,
            this.colisionBasuraToxica,
            null,
            this
        );
        
        //  CONTROLES
        this.input.keyboard.on('keydown-L', () => {
            if (!this.gameOver) {
                this.dragon.setVelocityY(-350);
                this.playFlapAnimation();
            }
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.gameOver) {
                this.dragon.setVelocityY(-350);
                this.playFlapAnimation();
            }
        });

        this.input.keyboard.once('keydown-ESC', () => {
            this.exitMinigame();
        });
        
        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });

        // INTERFAZ 
        this.createUI();
        
        //  GENERACIÓN DE BASURA 
        this.generarBasura();
        
        //  TEMPORIZADOR 
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.decrementarTiempo,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Crea el dragón con geometría
     */
    createDragon() {
        // Crear sprite de física con forma circular
        this.dragon = this.physics.add.sprite(150, 300, null);
        this.dragon.setCircle(20); // Collider circular
        
        // Crear visualización geométrica
        const graphics = this.add.graphics();
        
        // Cuerpo
        graphics.fillStyle(0x00ff88, 1);
        graphics.fillCircle(0, 0, 20);
        
        // Cabeza
        graphics.fillStyle(0x00dd66, 1);
        graphics.fillCircle(15, -10, 12);
        
        // Ojos
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(18, -12, 3);
        graphics.fillCircle(23, -12, 3);
        
        // Alas (triángulos)
        graphics.fillStyle(0x00bb44, 0.7);
        graphics.fillTriangle(-10, -15, -25, -5, -10, 5);
        graphics.fillTriangle(-10, 5, -25, 15, -10, 15);
        
        graphics.generateTexture('dragon_mini', 50, 50);
        graphics.destroy();
        
        this.dragon.setTexture('dragon_mini');
        
        // Física del dragón
        this.dragon.body.gravity.y = 800;
        this.dragon.setCollideWorldBounds(true);
        this.dragon.setScale(0.8);
    }

    /**
     * Crea las texturas de basura
     */
    createTrashTextures() {
        // BASURA LIMPIA (verde - recoger)
        const gfxLimpia = this.add.graphics();
        gfxLimpia.fillStyle(0x00ff00, 1);
        gfxLimpia.fillRoundedRect(0, 0, 30, 30, 5);
        gfxLimpia.fillStyle(0xffffff, 0.5);
        gfxLimpia.fillCircle(10, 10, 5);
        gfxLimpia.generateTexture('basura_limpia', 30, 30);
        gfxLimpia.destroy();
        
        // BASURA TÓXICA (roja - esquivar)
        const gfxToxica = this.add.graphics();
        gfxToxica.fillStyle(0xff0000, 1);
        gfxToxica.fillRoundedRect(0, 0, 30, 30, 5);
        gfxToxica.lineStyle(2, 0xff4444);
        
        // Símbolo de peligro
        gfxToxica.strokeTriangle(15, 8, 8, 22, 22, 22);
        gfxToxica.fillStyle(0xffff00, 1);
        gfxToxica.fillCircle(15, 18, 2);
        
        gfxToxica.generateTexture('basura_toxica', 30, 30);
        gfxToxica.destroy();
    }

    /**
     * Crea la interfaz de usuario
     */
    createUI() {
        // Puntos
        this.textoPuntos = this.add.text(16, 16, 'Puntos: 0', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.textoPuntos.setDepth(1000);
        
        // Recursos ganados
        this.textoRecursos = this.add.text(16, 50, 'Recursos: 0', {
            fontSize: '18px',
            fill: '#00ff88',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.textoRecursos.setDepth(1000);
        
        // Próximo recurso
        this.textoProximoRecurso = this.add.text(16, 84, `Siguiente: ${this.nextResourceThreshold}pts`, {
            fontSize: '14px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 3 }
        });
        this.textoProximoRecurso.setDepth(1000);
        
        // Temporizador
        this.textoTimer = this.add.text(600, 16, 'Tiempo: 1:00', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.textoTimer.setDepth(1000);
        
        // Instrucciones
        this.add.text(400, 16, 'L/ESPACIO: Aletear | R: Reiniciar | ESC: Salir', {
            fontSize: '14px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(1000);
        
        // Leyenda de basura
        const legendY = 550;
        this.add.rectangle(30, legendY, 15, 15, 0x00ff00).setDepth(1000);
        this.add.text(50, legendY, 'Recoger (+10pts)', {
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(1000);
        
        this.add.rectangle(200, legendY, 15, 15, 0xff0000).setDepth(1000);
        this.add.text(220, legendY, 'Esquivar (-20pts, -5 seg)', {
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(1000);
    }

    /**
     * Genera basura aleatoriamente
     */
    generarBasura() {
        if (this.gameOver) return;
        
        const y = Phaser.Math.Between(50, 520);
        
        // 70% basura limpia, 30% basura tóxica
        if (Math.random() < 0.7) {
            const basura = this.basuraLimpia.create(850, y, 'basura_limpia');
            basura.setVelocityX(-200);
        } else {
            const basura = this.basuraToxica.create(850, y, 'basura_toxica');
            basura.setVelocityX(-180);
            
            // Efecto pulsante para basura tóxica
            this.tweens.add({
                targets: basura,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Siguiente basura
        this.time.delayedCall(
            Phaser.Math.Between(800, 2000), 
            this.generarBasura, 
            [], 
            this
        );
    }

    /**
     * Recoger basura limpia
     */
    recogerBasuraLimpia(dragon, basura) {
        basura.destroy();
        
        // Sumar puntos
        this.puntos += 10;
        this.textoPuntos.setText('Puntos: ' + this.puntos);
        
        // Verificar si ganó un recurso
        if (this.puntos >= this.nextResourceThreshold) {
            this.ganarRecurso();
        }
        
        // Efecto visual
        this.createCollectEffect(basura.x, basura.y, 0x00ff00);
        
        // Pequeño impulso
        dragon.setVelocityY(-100);
        
        // Sonido (opcional)
        // this.sound.play('collect');
    }

    /**
     * Colisión con basura tóxica
     */
    colisionBasuraToxica(dragon, basura) {
        basura.destroy();
        
        // Restar puntos
        this.puntos = Math.max(0, this.puntos - 20);
        this.textoPuntos.setText('Puntos: ' + this.puntos);
        
        // Restar tiempo
        this.timer = Math.max(0, this.timer - 5);
        this.actualizarTextoTimer();
        
        // Efecto visual negativo
        this.createCollectEffect(basura.x, basura.y, 0xff0000);
        
        // Sacudir pantalla
        this.cameras.main.shake(200, 0.005);
        
        // Flash rojo
        this.cameras.main.flash(200, 255, 0, 0, false);
        
        // Sonido (opcional)
        // this.sound.play('damage');
    }

    /**
     * Gana un recurso
     */
    ganarRecurso() {
        this.resourcesEarned++;
        this.textoRecursos.setText('Recursos: ' + this.resourcesEarned);
        
        // Actualizar próximo umbral
        this.nextResourceThreshold += this.pointsPerResource;
        this.textoProximoRecurso.setText(`Siguiente: ${this.nextResourceThreshold}pts`);
        
        // Efecto visual de recompensa
        const rewardText = this.add.text(400, 200, '+1 RECURSO!', {
            fontSize: '32px',
            fill: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        rewardText.setDepth(1001);
        
        this.tweens.add({
            targets: rewardText,
            y: 150,
            alpha: 0,
            scale: 1.5,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => rewardText.destroy()
        });
        
        // Sonido (opcional)
        // this.sound.play('reward');
    }

    /**
     * Efecto de partículas al recoger
     */
    createCollectEffect(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(
                x,
                y,
                Phaser.Math.Between(3, 6),
                color,
                1
            );
            
            const angle = (Math.PI * 2 * i) / 8;
            const velocity = 100;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * velocity,
                y: y + Math.sin(angle) * velocity,
                alpha: 0,
                duration: 500,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Animación de aleteo
     */
    playFlapAnimation() {
        this.tweens.add({
            targets: this.dragon,
            scaleY: 1.1,
            duration: 100,
            yoyo: true
        });
    }

    /**
     * Decrementar tiempo
     */
    decrementarTiempo() {
        if (this.gameOver) return;
        
        this.timer--;
        this.actualizarTextoTimer();

        if (this.timer <= 0) {
            this.finalizarJuego();
        }
    }

    /**
     * Actualizar texto del temporizador
     */
    actualizarTextoTimer() {
        const minutos = Math.floor(this.timer / 60);
        const segundos = this.timer % 60;
        this.textoTimer.setText(`Tiempo: ${minutos}:${segundos < 10 ? '0' : ''}${segundos}`);
        
        // Advertencia de tiempo
        if (this.timer <= 10 && this.timer > 0) {
            this.textoTimer.setColor('#ff0000');
            this.textoTimer.setFontStyle('bold');
        }
    }

    /**
     * Finalizar juego (tiempo agotado)
     */
    finalizarJuego() {
        this.gameOver = true;
        this.physics.pause();
        
        this.showGameOverScreen('¡TIEMPO AGOTADO!');
    }

    /**
     * Pantalla de Game Over
     */
    showGameOverScreen(reason) {
        const bg = this.add.rectangle(400, 300, 600, 400, 0x000000, 0.9);
        bg.setDepth(2000);
        
        this.add.text(400, 200, reason, {
            fontSize: '36px',
            fill: '#ff0000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        this.add.text(400, 260, `Puntos Finales: ${this.puntos}`, {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        this.add.text(400, 300, `Recursos Ganados: ${this.resourcesEarned}`, {
            fontSize: '24px',
            fill: '#00ff88',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        this.add.text(400, 360, 'Presiona R para reiniciar\nPresiona ESC para salir', {
            fontSize: '18px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        // Dar recursos al submarino
        if (this.submarine && this.resourcesEarned > 0) {
            this.giveResourcesToSubmarine();
        }
    }

    /**
     * Dar recursos al submarino
     */
    giveResourcesToSubmarine() {
        // Distribuir recursos aleatoriamente
        for (let i = 0; i < this.resourcesEarned; i++) {
            const rand = Math.random();
            
            if (rand < 0.3) {
                this.submarine.addRepairKit(1);
            } else if (rand < 0.6) {
                this.submarine.addAmmunition(2);
            } else if (rand < 0.85) {
                this.submarine.addCooldownReducer(1);
            } else {
                this.submarine.addMovementLimiter(1);
            }
        }
        
        console.log(`${this.resourcesEarned} recursos añadidos al submarino`);
    }

    /**
     * Salir del minijuego
     */
    exitMinigame() {
        // Dar recursos si hay
        if (this.submarine && this.resourcesEarned > 0) {
            this.giveResourcesToSubmarine();
        }
        
        this.scene.stop();
        this.scene.resume(this.returnScene);
    }

    /**
     * Update
     */
    update() {
        if (this.gameOver) return;
        
        // Destruir basura fuera de pantalla
        this.basuraLimpia.children.entries.forEach(basura => {
            if (basura.x < -50) basura.destroy();
        });
        
        this.basuraToxica.children.entries.forEach(basura => {
            if (basura.x < -50) basura.destroy();
        });

        // Game over si toca el suelo
        if (this.dragon.y >= 565) {
            this.gameOver = true;
            this.physics.pause();
            this.showGameOverScreen('¡CHOCASTE CON EL SUELO!');
        }

        // Parallax scroll
        this.fondo1.setTilePosition(this.fondo1.tilePositionX + 1);
        this.fondo2.setTilePosition(this.fondo2.tilePositionX + 2);
        this.fondo3.setTilePosition(this.fondo3.tilePositionX + 3);
    }
}