/**
 * RepairMinigame
 *
 * Minijuego de reparación de fugas del submarino
 * 
 * Ahora incluye countdown de 3, 2, 1, ¡YA!
 * 
 * MECÁNICAS:
 * - El submarino tiene fugas por donde entran objetos flotantes
 * - El jugador debe hacer clic en las fugas para repararlas
 * - Los objetos flotan con física modificada (simulación bajo el agua)
 * - Si demasiados objetos entran, pierdes
 * - Si reparas todas las fugas a tiempo, ganas y curas el submarino
 */
export class RepairMinigame extends Phaser.Scene {
    constructor() {
        super({ key: 'RepairMinigame' });
    }

    init(data) {
        // Datos recibidos
        this.submarine = data.submarine;
        this.returnScene = data.returnScene || 'GameScreen';
        this.healAmount = data.healAmount || 30; // HP que se cura al completar
    }

    create() {
        // VARIABLES DEL JUEGO 
        this.gameOver = false;
        this.gameStarted = false; // El juego no empieza hasta después del countdown
        this.gameWon = false;
        this.timer = 45; // Segundos para completar
        this.objectsEntered = 0; // Objetos que entraron
        this.maxObjects = 15; // Máximo de objetos antes de perder
        
        // Sistema de fugas
        this.leaks = [];
        this.totalLeaks = 5; // Número de fugas a reparar
        this.leaksRepaired = 0;
        
        // FONDO (Interior del submarino)
        this.createSubmarineInterior();
        
        // CREAR FUGAS 
        this.createLeaks();
        
        // GRUPOS DE OBJETOS FLOTANTES 
        this.floatingObjects = this.physics.add.group();
        
        // INTERFAZ 
        this.createUI();
        
        // CONTROLES 
        this.input.on('pointerdown', (pointer) => {
            if (this.gameStarted && !this.gameOver) { // Solo funciona si el juego ha empezado
                this.checkLeakClick(pointer);
            }
        });
        
        // AÑADIR: Soporte de teclado ESC para salir
        this.escKey = this.input.keyboard.addKey('ESC');
        this.escKey.on('down', () => {
            if (!this.gameOver) {
                console.log("Jugador salió del minijuego con ESC");
                this.exitMinigame(false);
            }
        });
        
        // NO iniciar la generación ni el temporizador todavía
        // Se iniciarán después del countdown
        
        // FÍSICA MODIFICADA (flotación) 
        this.physics.world.gravity.y = -50; // Gravedad negativa para flotación
        
        // INICIAR COUNTDOWN
        this.startCountdown();
    }

    /**
     * Inicia el countdown de 3, 2, 1, ¡YA!
     */
    startCountdown() {
        let countdown = 3;
        
        // Texto grande en el centro
        const countdownText = this.add.text(400, 300, countdown.toString(), {
            fontSize: '120px',
            fontFamily: 'Arial',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(3000);
        
        // Animación de escala para cada número
        const animateNumber = () => {
            countdownText.setScale(0.5);
            this.tweens.add({
                targets: countdownText,
                scale: 1.2,
                alpha: { from: 1, to: 0 },
                duration: 900,
                ease: 'Cubic.easeOut'
            });
        };
        
        animateNumber();
        
        // Temporizador del countdown
        const countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                countdown--;
                
                if (countdown > 0) {
                    countdownText.setText(countdown.toString());
                    countdownText.setAlpha(1);
                    animateNumber();
                } else {
                    // ¡YA!
                    countdownText.setText('¡REPARA LAS FUGAS!');
                    countdownText.setStyle({
                        fontSize: '60px',
                        color: '#00ff00'
                    });
                    countdownText.setAlpha(1);
                    
                    this.tweens.add({
                        targets: countdownText,
                        scale: 1.5,
                        alpha: 0,
                        duration: 800,
                        ease: 'Back.easeOut',
                        onComplete: () => {
                            countdownText.destroy();
                            this.startGame();
                        }
                    });
                    
                    countdownTimer.destroy();
                }
            },
            loop: true
        });
    }

    /**
     * Inicia el juego después del countdown
     */
    startGame() {
        this.gameStarted = true;
        
        // GENERACIÓN DE OBJETOS
        this.objectSpawnTimer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnFloatingObject,
            callbackScope: this,
            loop: true
        });
        
        // TEMPORIZADOR
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.decrementTimer,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Crea el interior del submarino
     */
    createSubmarineInterior() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        // Fondo azul oscuro (agua dentro del submarino)
        const waterLevel = h * 0.6;
        this.add.rectangle(w/2, waterLevel, w, h * 0.8, 0x001a33, 1);
        
        // Parte seca (arriba)
        this.add.rectangle(w/2, h * 0.15, w, h * 0.3, 0x2a4858, 1);
        
        // Línea de agua
        const waterLine = this.add.line(0, 0, 0, h * 0.3, w, h * 0.3, 0x00ffff, 0.5);
        waterLine.setOrigin(0, 0);
        waterLine.setLineWidth(3);
        
        // Efecto de olas en la línea de agua
        this.tweens.add({
            targets: waterLine,
            y: '+=5',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Paredes del submarino
        const wallColor = 0x555555;
        this.add.rectangle(30, h/2, 60, h, wallColor, 1); // Izquierda
        this.add.rectangle(w - 30, h/2, 60, h, wallColor, 1); // Derecha
        
        // Detalles del interior (tuberías, etc)
        for (let i = 0; i < 5; i++) {
            const pipeY = 50 + i * 100;
            this.add.rectangle(60, pipeY, 20, 80, 0x888888, 1);
            this.add.rectangle(w - 60, pipeY, 20, 80, 0x888888, 1);
        }
    }

    /**
     * Crea las fugas en el submarino
     */
    createLeaks() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        // Posiciones de las fugas (distribuidas en las paredes)
        const leakPositions = [
            { x: 100, y: 150 },
            { x: w - 100, y: 200 },
            { x: 150, y: 350 },
            { x: w - 150, y: 400 },
            { x: w/2, y: 450 }
        ];
        
        leakPositions.forEach((pos, index) => {
            this.createLeak(pos.x, pos.y, index);
        });
    }

    /**
     * Crea una fuga individual
     */
    createLeak(x, y, id) {
        const leak = {
            id: id,
            x: x,
            y: y,
            repaired: false,
            sprite: null,
            particles: []
        };
        
        // Sprite de la fuga (círculo rojo con animación)
        const leakSprite = this.add.circle(x, y, 15, 0xff0000, 0.8);
        leakSprite.setInteractive({ useHandCursor: true });
        leakSprite.setDepth(100);
        
        // Animación de pulsación
        this.tweens.add({
            targets: leakSprite,
            scale: 1.3,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        leak.sprite = leakSprite;
        
        // Efecto de agua saliendo (partículas)
        this.createWaterParticles(leak);
        
        this.leaks.push(leak);
    }

    /**
     * Crea partículas de agua saliendo de una fuga
     */
    createWaterParticles(leak) {
        const particleTimer = this.time.addEvent({
            delay: 200,
            callback: () => {
                if (!leak.repaired && this.gameStarted) { // Solo si el juego ha empezado
                    const particle = this.add.circle(
                        leak.x,
                        leak.y,
                        Phaser.Math.Between(2, 5),
                        0x00aaff,
                        0.7
                    );
                    
                    this.tweens.add({
                        targets: particle,
                        x: leak.x + Phaser.Math.Between(-30, 30),
                        y: leak.y + 50,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => particle.destroy()
                    });
                }
            },
            loop: true
        });
        
        leak.particleTimer = particleTimer;
    }

    /**
     * Verifica si se hizo clic en una fuga
     */
    checkLeakClick(pointer) {
        this.leaks.forEach(leak => {
            if (leak.repaired) return;
            
            const distance = Phaser.Math.Distance.Between(
                pointer.x,
                pointer.y,
                leak.x,
                leak.y
            );
            
            if (distance < 20) {
                this.repairLeak(leak);
            }
        });
    }

    /**
     * Repara una fuga
     */
    repairLeak(leak) {
        if (leak.repaired) return;
        
        leak.repaired = true;
        this.leaksRepaired++;
        
        // Cambiar color a verde
        leak.sprite.setFillStyle(0x00ff00, 1);
        
        // Detener animación
        this.tweens.killTweensOf(leak.sprite);
        leak.sprite.setScale(1);
        leak.sprite.setAlpha(1);
        
        // Detener partículas
        if (leak.particleTimer) {
            leak.particleTimer.destroy();
        }
        
        // Efecto de reparación
        this.showRepairEffect(leak.x, leak.y);
        
        // Actualizar UI
        this.updateLeaksText();
        
        // Verificar victoria
        if (this.leaksRepaired >= this.totalLeaks) {
            this.winGame();
        }
    }

    /**
     * Muestra efecto visual al reparar
     */
    showRepairEffect(x, y) {
        // Partículas de éxito
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const particle = this.add.star(
                x, y,
                5, 5, 10,
                0x00ff00, 1
            );
            particle.setDepth(200);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 50,
                y: y + Math.sin(angle) * 50,
                alpha: 0,
                scale: 0,
                duration: 800,
                onComplete: () => particle.destroy()
            });
        }
        
        // Flash verde
        this.cameras.main.flash(200, 0, 255, 0, false);
    }

    /**
     * Genera un objeto flotante desde una fuga
     */
    spawnFloatingObject() {
        if (this.gameOver || !this.gameStarted) return; // No generar si no ha empezado
        
        // Elegir una fuga no reparada aleatoria
        const activeLeaks = this.leaks.filter(l => !l.repaired);
        if (activeLeaks.length === 0) return;
        
        const leak = Phaser.Utils.Array.GetRandom(activeLeaks);
        
        // Crear objeto flotante
        const obj = this.physics.add.sprite(leak.x, leak.y, null);
        
        // Crear geometría (puede ser un cubo, esfera, etc)
        const graphics = this.add.graphics();
        const objType = Phaser.Math.Between(0, 2);
        
        if (objType === 0) {
            // Cubo
            graphics.fillStyle(0xff6600, 1);
            graphics.fillRect(-10, -10, 20, 20);
        } else if (objType === 1) {
            // Círculo
            graphics.fillStyle(0x6600ff, 1);
            graphics.fillCircle(0, 0, 10);
        } else {
            // Triángulo
            graphics.fillStyle(0x00ffff, 1);
            graphics.fillTriangle(-10, 10, 0, -10, 10, 10);
        }
        
        graphics.generateTexture('debris' + objType, 20, 20);
        graphics.destroy();
        
        obj.setTexture('debris' + objType);
        obj.setScale(0.8);
        
        // Física: flotar hacia arriba con movimiento lateral
        obj.setVelocity(
            Phaser.Math.Between(-50, 50),  // Movimiento lateral
            Phaser.Math.Between(-80, -120)  // Flotar hacia arriba
        );
        
        // Rotación
        obj.setAngularVelocity(Phaser.Math.Between(-100, 100));
        
        this.floatingObjects.add(obj);
        
        // Destruir si sale de la pantalla arriba
        this.time.delayedCall(5000, () => {
            if (obj.active && obj.y < 0) {
                this.objectsEntered++;
                this.updateObjectsText();
                obj.destroy();
                
                // Verificar derrota
                if (this.objectsEntered >= this.maxObjects) {
                    this.loseGame();
                }
            }
        });
    }

    /**
     * Crea la interfaz de usuario
     */
    createUI() {
        // Temporizador
        this.timerText = this.add.text(16, 16, 'Tiempo: 0:45', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setDepth(1000);
        
        // Fugas reparadas
        this.leaksText = this.add.text(16, 50, 'Fugas: 0/5', {
            fontSize: '20px',
            fill: '#00ff88',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setDepth(1000);
        
        // Objetos que entraron
        this.objectsText = this.add.text(16, 84, 'Objetos: 0/15', {
            fontSize: '18px',
            fill: '#ffaa00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setDepth(1000);
        
        // Instrucciones
        this.add.text(400, 16, 'HAZ CLIC EN LAS FUGAS ROJAS | ESC para salir', {
            fontSize: '14px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(1000);
    }

    /**
     * Actualiza el texto de fugas
     */
    updateLeaksText() {
        this.leaksText.setText(`Fugas: ${this.leaksRepaired}/${this.totalLeaks}`);
        
        if (this.leaksRepaired >= this.totalLeaks * 0.8) {
            this.leaksText.setColor('#00ff00');
        }
    }

    /**
     * Actualiza el texto de objetos
     */
    updateObjectsText() {
        this.objectsText.setText(`Objetos: ${this.objectsEntered}/${this.maxObjects}`);
        
        if (this.objectsEntered >= this.maxObjects * 0.7) {
            this.objectsText.setColor('#ff0000');
        }
    }

    /**
     * Decrementa el temporizador
     */
    decrementTimer() {
        if (this.gameOver) return;
        
        this.timer--;
        const mins = Math.floor(this.timer / 60);
        const secs = this.timer % 60;
        this.timerText.setText(`Tiempo: ${mins}:${secs < 10 ? '0' : ''}${secs}`);
        
        if (this.timer <= 10) {
            this.timerText.setColor('#ff0000');
        }
        
        if (this.timer <= 0) {
            this.loseGame();
        }
    }

    /**
     * Victoria
     */
    winGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.gameWon = true;
        this.physics.pause();
        
        console.log("¡Victoria! Todas las fugas reparadas");
        
        // Detener temporizadores
        if (this.objectSpawnTimer) this.objectSpawnTimer.destroy();
        if (this.timerEvent) this.timerEvent.destroy();
        
        // Pantalla de victoria
        this.showEndScreen(true);
        
        // Curar submarino
        if (this.submarine) {
            this.submarine.heal(this.healAmount);
            console.log(`Submarino curado +${this.healAmount} HP`);
        }
    }

    /**
     * Derrota
     */
    loseGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.gameWon = false;
        this.physics.pause();
        
        console.log("Derrota - Demasiados objetos o tiempo agotado");
        
        // Detener temporizadores
        if (this.objectSpawnTimer) this.objectSpawnTimer.destroy();
        if (this.timerEvent) this.timerEvent.destroy();
        
        // Pantalla de derrota
        this.showEndScreen(false);
    }

    /**
     * Muestra pantalla de fin de juego
     */
    showEndScreen(won) {
        const bg = this.add.rectangle(400, 300, 600, 400, 0x000000, 0.9);
        bg.setDepth(2000);
        
        const resultText = won ? '¡REPARACIÓN COMPLETA!' : '¡FALLO EN LA REPARACIÓN!';
        const resultColor = won ? '#00ff00' : '#ff0000';
        
        this.add.text(400, 200, resultText, {
            fontSize: '36px',
            fill: resultColor,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        if (won) {
            this.add.text(400, 260, `Submarino curado: +${this.healAmount} HP`, {
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setDepth(2001);
        }
        
        this.add.text(400, 320, `Fugas reparadas: ${this.leaksRepaired}/${this.totalLeaks}`, {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        this.add.text(400, 380, 'Presiona ESC para continuar', {
            fontSize: '18px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
    }

    /**
     * Salir del minijuego
     */
    exitMinigame(won) {
        console.log(`Saliendo del minijuego (${won ? 'victoria' : 'sin completar'})`);
        
        this.scene.stop();
        this.scene.resume(this.returnScene);
    }

    /**
     * Update
     */
    update() {
        if (this.gameOver || !this.gameStarted) return; // No actualizar si no ha empezado
        
        // Destruir objetos que salieron de la pantalla superior
        this.floatingObjects.children.entries.forEach(obj => {
            if (obj.y < -50) {
                this.objectsEntered++;
                this.updateObjectsText();
                obj.destroy();
                
                if (this.objectsEntered >= this.maxObjects) {
                    this.loseGame();
                }
            }
        });
    }
}