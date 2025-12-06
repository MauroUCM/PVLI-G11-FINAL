/**
 * RepairMinigame
 *
 * Minijuego de reparación de fugas del submarino
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
            this.checkLeakClick(pointer);
        });
        
        // AÑADIR: Soporte de teclado ESC para salir
        this.escKey = this.input.keyboard.addKey('ESC');
        this.escKey.on('down', () => {
            if (!this.gameOver) {
                console.log("Jugador salió del minijuego con ESC");
                this.exitMinigame(false);
            }
        });
        
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
        
        // FÍSICA MODIFICADA (flotación) 
        this.physics.world.gravity.y = -50; // Gravedad negativa para flotación
        
        console.log("RepairMinigame iniciado correctamente");
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
        const waterLine = this.add.graphics();
        waterLine.lineStyle(3, 0x00aaff, 0.5);
        waterLine.lineBetween(0, waterLevel - h * 0.2, w, waterLevel - h * 0.2);
        
        // Animación de olas en la línea de agua
        this.tweens.add({
            targets: waterLine,
            y: '+=5',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Paredes del submarino
        const wallThickness = 20;
        this.add.rectangle(wallThickness/2, h/2, wallThickness, h, 0x555555, 1);
        this.add.rectangle(w - wallThickness/2, h/2, wallThickness, h, 0x555555, 1);
        this.add.rectangle(w/2, wallThickness/2, w, wallThickness, 0x555555, 1);
        this.add.rectangle(w/2, h - wallThickness/2, w, wallThickness, 0x555555, 1);
        
        // Ventanas/portillas (decoración)
        for (let i = 0; i < 3; i++) {
            const porthole = this.add.circle(
                150 + i * 250,
                80,
                30,
                0x003366,
                0.5
            );
            porthole.setStrokeStyle(4, 0x888888);
        }
        
        // Tuberías (decoración)
        const pipes = this.add.graphics();
        pipes.lineStyle(8, 0x666666, 1);
        pipes.lineBetween(50, 150, 750, 150);
        pipes.lineBetween(50, 200, 750, 200);
    }

    /**
     * Crea las fugas en posiciones aleatorias
     */
    createLeaks() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        for (let i = 0; i < this.totalLeaks; i++) {
            // Posición aleatoria en las paredes
            let x, y;
            const wall = Phaser.Math.Between(0, 3); // 0:izq, 1:der, 2:arriba, 3:abajo
            
            switch(wall) {
                case 0: // Izquierda
                    x = 30;
                    y = Phaser.Math.Between(300, h - 50);
                    break;
                case 1: // Derecha
                    x = w - 30;
                    y = Phaser.Math.Between(300, h - 50);
                    break;
                case 2: // Arriba (solo en zona sumergida)
                    x = Phaser.Math.Between(100, w - 100);
                    y = 250;
                    break;
                case 3: // Abajo
                    x = Phaser.Math.Between(100, w - 100);
                    y = h - 30;
                    break;
            }
            
            this.createLeak(x, y);
        }
    }

    /**
     * Crea una fuga individual
     */
    createLeak(x, y) {
        const leak = {
            x: x,
            y: y,
            active: true,
            size: 15,
            container: null
        };
        
        // Container para la fuga
        leak.container = this.add.container(x, y);
        
        // Círculo rojo (la fuga)
        const hole = this.add.circle(0, 0, leak.size, 0xff0000, 1);
        hole.setStrokeStyle(3, 0xff4444);
        leak.container.add(hole);
        
        // Botón de reparación (área clickeable más grande)
        const repairBtn = this.add.circle(0, 0, leak.size + 10, 0xffff00, 0);
        repairBtn.setInteractive({ useHandCursor: true });
        repairBtn.setStrokeStyle(2, 0xffff00);
        leak.container.add(repairBtn);
        
        // Hacer visible al pasar el ratón
        repairBtn.on('pointerover', () => {
            if (leak.active) {
                repairBtn.setAlpha(0.5);
            }
        });
        
        repairBtn.on('pointerout', () => {
            repairBtn.setAlpha(0);
        });
        
        // Animación pulsante
        this.tweens.add({
            targets: hole,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        leak.hole = hole;
        leak.repairBtn = repairBtn;
        this.leaks.push(leak);
    }

    /**
     * Crea la interfaz
     */
    createUI() {
        // Panel superior
        const panelBg = this.add.rectangle(400, 30, 760, 60, 0x000000, 0.7);
        panelBg.setDepth(1000);
        
        // Timer
        this.timerText = this.add.text(50, 30, 'Tiempo: 0:45', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5).setDepth(1001);
        
        // Fugas reparadas
        this.leaksText = this.add.text(250, 30, `Fugas: 0/${this.totalLeaks}`, {
            fontSize: '20px',
            fill: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5).setDepth(1001);
        
        // Objetos entrados
        this.objectsText = this.add.text(450, 30, `Objetos: 0/${this.maxObjects}`, {
            fontSize: '20px',
            fill: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5).setDepth(1001);
        
        // Instrucciones
        this.add.text(400, 580, 'HAZ CLIC EN LAS FUGAS ROJAS PARA REPARARLAS | ESC: Salir', {
            fontSize: '16px',
            fill: '#ffffff',
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(1001);
    }

    /**
     * Verifica si se hizo clic en una fuga
     */
    checkLeakClick(pointer) {
        if (this.gameOver) return;
        
        this.leaks.forEach(leak => {
            if (!leak.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                pointer.x, pointer.y,
                leak.x, leak.y
            );
            
            if (distance < leak.size + 15) { // Área clickeable más generosa
                this.repairLeak(leak);
            }
        });
    }

    /**
     * Repara una fuga
     */
    repairLeak(leak) {
        if (!leak.active) return;
        
        leak.active = false;
        this.leaksRepaired++;
        
        // Actualizar UI
        this.leaksText.setText(`Fugas: ${this.leaksRepaired}/${this.totalLeaks}`);
        
        // Efecto visual de reparación
        this.createRepairEffect(leak.x, leak.y);
        
        // Cambiar color a verde
        leak.hole.setFillStyle(0x00ff00);
        leak.hole.setStrokeStyle(3, 0x00aa00);
        
        // Animar desaparición
        this.tweens.add({
            targets: leak.container,
            alpha: 0,
            scale: 0,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
                leak.container.destroy();
            }
        });
        
        // Verificar victoria
        if (this.leaksRepaired >= this.totalLeaks) {
            this.winGame();
        }
    }

    /**
     * Efecto visual de reparación
     */
    createRepairEffect(x, y) {
        // Destello verde
        const flash = this.add.circle(x, y, 30, 0x00ff00, 1);
        flash.setDepth(500);
        
        this.tweens.add({
            targets: flash,
            scale: 3,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => flash.destroy()
        });
        
        // Chispas
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const spark = this.add.circle(x, y, 3, 0xffff00, 1);
            spark.setDepth(500);
            
            this.tweens.add({
                targets: spark,
                x: x + Math.cos(angle) * 60,
                y: y + Math.sin(angle) * 60,
                alpha: 0,
                duration: 600,
                ease: 'Cubic.easeOut',
                onComplete: () => spark.destroy()
            });
        }
    }

    /**
     * Genera objetos flotantes desde las fugas activas
     */
    spawnFloatingObject() {
        if (this.gameOver) return;
        
        // Encontrar fugas activas
        const activeLeaks = this.leaks.filter(l => l.active);
        if (activeLeaks.length === 0) return;
        
        // Elegir fuga aleatoria
        const leak = Phaser.Utils.Array.GetRandom(activeLeaks);
        
        // Crear objeto flotante
        this.createFloatingObject(leak.x, leak.y);
    }

    /**
     * Crea un objeto flotante individual
     */
    createFloatingObject(x, y) {
        // Crear círculo simple como objeto
        const size = Phaser.Math.Between(10, 20);
        const color = Phaser.Math.RND.pick([0x8B4513, 0x4169E1, 0x228B22, 0xFF6347]);
        
        const obj = this.add.circle(x, y, size, color, 1);
        obj.setStrokeStyle(2, 0x000000, 0.5);
        this.physics.add.existing(obj);
        
        // Física de flotación
        obj.body.setVelocity(
            Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(-80, -50) // Flotar hacia arriba
        );
        
        obj.body.setDrag(50); // Resistencia del agua
        obj.body.setBounce(0.7); // Rebote suave
        obj.body.setCollideWorldBounds(true);
        
        // Rotación lenta (efecto visual)
        this.tweens.add({
            targets: obj,
            angle: 360,
            duration: Phaser.Math.Between(2000, 4000),
            repeat: -1
        });
        
        this.floatingObjects.add(obj);
        obj.setData('checked', false);
    }

    /**
     * Decrementa el timer
     */
    decrementTimer() {
        if (this.gameOver) return;
        
        this.timer--;
        const mins = Math.floor(this.timer / 60);
        const secs = this.timer % 60;
        this.timerText.setText(`Tiempo: ${mins}:${secs < 10 ? '0' : ''}${secs}`);
        
        // Advertencia
        if (this.timer <= 10 && this.timer > 0) {
            this.timerText.setColor('#ff0000');
        }
        
        // Tiempo agotado
        if (this.timer <= 0) {
            this.loseGame('¡TIEMPO AGOTADO!');
        }
    }

    /**
     * Victoria
     */
    winGame() {
        this.gameOver = true;
        this.gameWon = true;
        this.physics.pause();
        
        // Curar submarino
        if (this.submarine) {
            this.submarine.heal(this.healAmount);
            console.log(`Submarino curado: +${this.healAmount} HP`);
        }
        
        this.showEndScreen(
            '¡TODAS LAS FUGAS REPARADAS!',
            `Submarino curado: +${this.healAmount} HP`,
            '#00ff88'
        );
    }

    /**
     * Derrota
     */
    loseGame(reason) {
        this.gameOver = true;
        this.gameWon = false;
        this.physics.pause();
        
        this.showEndScreen(reason, 'No se pudo completar la reparación', '#ff0000');
    }

    /**
     * Muestra pantalla final
     */
    showEndScreen(title, subtitle, color) {
        const bg = this.add.rectangle(400, 300, 600, 400, 0x000000, 0.9);
        bg.setDepth(2000);
        
        this.add.text(400, 220, title, {
            fontSize: '32px',
            fill: color,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        this.add.text(400, 280, subtitle, {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        this.add.text(400, 330, `Fugas reparadas: ${this.leaksRepaired}/${this.totalLeaks}`, {
            fontSize: '18px',
            fill: '#00ff88',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        this.add.text(400, 380, 'Presiona ESC para continuar', {
            fontSize: '18px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        this.input.keyboard.once('keydown-ESC', () => {
            this.exitMinigame(this.gameWon);
        });
    }

    /**
     * Salir del minijuego
     */
   exitMinigame(success) {
        console.log(`Saliendo del minigame. Éxito: ${success}`);
        
        // Limpiar listener de ESC
        if (this.escKey) {
            this.escKey.off('down');
        }
        
        this.scene.stop();
        this.scene.resume(this.returnScene);
    }

    /**
     * Update
     */
    update() {
        if (this.gameOver) return;
        
        // Verificar objetos que llegaron arriba
        this.floatingObjects.children.entries.forEach(obj => {
            if (obj && obj.body && !obj.getData('checked') && obj.y < 100) {
                obj.setData('checked', true);
                this.objectsEntered++;
                this.objectsText.setText(`Objetos: ${this.objectsEntered}/${this.maxObjects}`);
                
                // Advertencia si se acerca al límite
                if (this.objectsEntered >= this.maxObjects * 0.7) {
                    this.objectsText.setColor('#ff0000');
                }
                
                // Perder si se excede el límite
                if (this.objectsEntered >= this.maxObjects) {
                    this.loseGame('¡DEMASIADOS OBJETOS ENTRARON!');
                }
            }
            
            // Destruir objetos muy arriba
            if (obj && obj.y < 50) {
                obj.destroy();
            }
        });
    }
}