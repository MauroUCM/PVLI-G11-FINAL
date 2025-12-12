/**
 * ZoneClosingSystem.js
 *
 * Sistema de cierre progresivo de zona según GDD 6.3
 * 
 * MECÁNICA:
 * - Empieza en turno 15 (configurable)
 * - Warning 3 turnos antes (turno 12)
 * - Cada 3 turnos cierra una fila/columna exterior
 * - Cierre simétrico (toda la fila exterior)
 * - Daño por turno si estás atrapado
 * - Tamaño mínimo: 4x4
 */

import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";

export class ZoneClosingSystem {
    constructor(board) {
        this.board = board;
        
        // CONFIGURACIÓN
        this.config = {
            startTurn: 15,          // Turno en que empieza a cerrarse
            warningTurns: 3,        // Turnos de advertencia antes
            interval: 3,            // Cada cuántos turnos cierra
            minSize: 4,             // Tamaño mínimo (4x4)
            damagePerTurn: 25,      // Daño por turno si estás atrapado
            borderColor: 0xff0000,  // Color de zona cerrada
            warningColor: 0xffaa00  // Color de advertencia
        };
        
        //  ESTADO 
        this.currentTurn = 0;
        this.isActive = false;
        this.hasWarned = false;
        this.closedRings = 0; // Número de anillos cerrados
        this.closedZones = []; // Array de zonas cerradas
        this.closedSprites = []; // Sprites visuales de zonas cerradas
        
        //  EVENTOS 
        this.setupEvents();
    }

    setupEvents() {
        // Escuchar actualizaciones de ronda
        EventDispatch.on(Event.UPDATE_ROUND, (round) => {
            this.currentTurn = round;
            this.checkClosing();
        });
        
        // Escuchar fin de turno para aplicar daño
        EventDispatch.on(Event.END_TURN, () => {
            if (this.isActive) {
                this.checkSubmarinesInClosedZone();
            }
        });
    }

    /**
     * Verifica si debe activarse el cierre de zona
     */
    checkClosing() {
        //  WARNING 
        if (this.currentTurn === this.config.startTurn - this.config.warningTurns && 
            !this.hasWarned) {
            this.showWarning();
            this.hasWarned = true;
            return;
        }
        
        // ACTIVAR CIERRE 
        if (this.currentTurn === this.config.startTurn && !this.isActive) {
            this.isActive = true;
            this.showActivationMessage();
            this.closeNextRing(); // Cerrar primer anillo inmediatamente
            return;
        }
        
        // CERRAR SIGUIENTE ANILLO
        if (this.isActive) {
            const turnsSinceStart = this.currentTurn - this.config.startTurn;
            
            if (turnsSinceStart > 0 && turnsSinceStart % this.config.interval === 0) {
                this.closeNextRing();
            }
        }
    }

    /**
     * Muestra advertencia de que el mapa se cerrará
     */
    showWarning() {
        const scene = this.board.scene;
        
        // Texto de advertencia
        const warning = scene.add.text(400, 300, 
            ` ADVERTENCIA \n\n` +
            `El mapa empezará a cerrarse\n` +
            `en ${this.config.warningTurns} turnos!\n\n` +
            `Muévete hacia el centro`, 
            {
                fontSize: '32px',
                fill: '#ffaa00',
                fontStyle: 'bold',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 30, y: 20 }
            }
        ).setOrigin(0.5).setDepth(3000);
        
        // Animación de parpadeo
        scene.tweens.add({
            targets: warning,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: 7,
            onComplete: () => {
                scene.tweens.add({
                    targets: warning,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => warning.destroy()
                });
            }
        });
        
        // Efecto de pantalla (flash naranja)
        scene.cameras.main.flash(300, 255, 170, 0, false);
    }

    /**
     * Muestra mensaje de activación del cierre
     */
    showActivationMessage() {
        const scene = this.board.scene;
        
        const msg = scene.add.text(400, 300,
            `CIERRE DE ZONA ACTIVADO \n\n` +
            `El mapa se reduce cada ${this.config.interval} turnos\n` +
            `¡Evita las zonas rojas!`,
            {
                fontSize: '28px',
                fill: '#ff0000',
                fontStyle: 'bold',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 25, y: 15 }
            }
        ).setOrigin(0.5).setDepth(3000);
        
        // Desaparecer después de 3 segundos
        scene.tweens.add({
            targets: msg,
            alpha: 0,
            duration: 1000,
            delay: 2000,
            onComplete: () => msg.destroy()
        });
        
        // Flash rojo
        scene.cameras.main.flash(500, 255, 0, 0, false);
        
        console.log("CIERRE DE ZONA ACTIVADO");
    }

    /**
     * Cierra el siguiente anillo exterior
     */
    closeNextRing() {
        const currentSize = this.getCurrentMapSize();
        
        // No cerrar si se alcanzó el tamaño mínimo
        if (currentSize <= this.config.minSize) {
            return;
        }
        // Cerrar el borde
        const closedPositions = this.closeBorder();
        this.closedZones.push(closedPositions);
        this.closedRings++;
        
        // Visualizar zona cerrada
        this.visualizeClosedZone(closedPositions);
        
        // Reubicar zonas de salida si están en zona cerrada
        this.relocateExitZones();
        
        // Mostrar efecto
        this.showClosingEffect();
    }

    /**
     * Cierra el borde exterior del mapa
     */
    closeBorder() {
        const logic = this.board.matrix.logic.matrix;
        const offset = this.closedRings * 2; // Cada anillo son 2 unidades
        
        const positions = [];
        
        // Determinar límites del anillo a cerrar
        const minX = offset;
        const maxX = logic.length - 1 - offset;
        const minY = offset;
        const maxY = logic[0].length - 1 - offset;
        
        // Cerrar fila superior
        for (let x = minX; x <= maxX; x++) {
            if (logic[x] && logic[x][minY]) {
                logic[x][minY].closed = true;
                positions.push({ x, y: minY });
            }
        }
        
        // Cerrar fila inferior
        for (let x = minX; x <= maxX; x++) {
            if (logic[x] && logic[x][maxY]) {
                logic[x][maxY].closed = true;
                positions.push({ x, y: maxY });
            }
        }
        
        // Cerrar columna izquierda
        for (let y = minY; y <= maxY; y++) {
            if (logic[minX] && logic[minX][y]) {
                logic[minX][y].closed = true;
                if (!positions.some(p => p.x === minX && p.y === y)) {
                    positions.push({ x: minX, y });
                }
            }
        }
        
        // Cerrar columna derecha
        for (let y = minY; y <= maxY; y++) {
            if (logic[maxX] && logic[maxX][y]) {
                logic[maxX][y].closed = true;
                if (!positions.some(p => p.x === maxX && p.y === y)) {
                    positions.push({ x: maxX, y });
                }
            }
        }
        
        return positions;
    }

    /**
     * Visualiza las zonas cerradas
     */
    visualizeClosedZone(positions) {
        const cellSize = this.board.config.cellSize;
        
        positions.forEach(pos => {
            // Rectángulo rojo pulsante
            const rect = this.board.scene.add.rectangle(
                pos.x * cellSize,
                pos.y * cellSize,
                cellSize,
                cellSize,
                this.config.borderColor,
                0.6
            );
            rect.setStrokeStyle(2, 0xff6666);
            
            this.board.add(rect);
            rect.setDepth(60); // Por encima de recursos, debajo de submarinos
            
            // Animación pulsante
            this.board.scene.tweens.add({
                targets: rect,
                alpha: 0.3,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Guardar referencia
            this.closedSprites.push(rect);
        });
    }

    /**
     * Muestra efecto visual del cierre
     */
    showClosingEffect() {
        // Flash rojo en pantalla
        this.board.scene.cameras.main.flash(300, 255, 0, 0, false);
        
        // Shake de pantalla
        this.board.scene.cameras.main.shake(400, 0.01);
        
        // Sonido (si existe)
        // this.board.scene.sound.play('zone_close');
    }

    /**
     * Calcula el tamaño actual del mapa
     */
    getCurrentMapSize() {
        return this.board.config.boardWidth - (this.closedRings * 2);
    }

    /**
     * Verifica si una posición está en zona cerrada
     */
    isInClosedZone(x, y) {
        return this.closedZones.some(ring => 
            ring.some(pos => pos.x === x && pos.y === y)
        );
    }

    /**
     * Verifica submarinos en zonas cerradas y aplica daño
     */
    checkSubmarinesInClosedZone() {
        const subs = [this.board.submarines.red, this.board.submarines.blue];
        
        subs.forEach(sub => {
            if (this.isInClosedZone(sub.position.x, sub.position.y)) {
                // Aplicar daño
                sub.loseHealth(this.config.damagePerTurn);
                
                // Efecto visual de daño
                this.showDamageEffect(sub);
                
                // Actualizar HUD
                if (this.board.huds && this.board.huds[sub.name]) {
                    this.board.huds[sub.name].update();
                }
            }
        });
    }

    /**
     * Muestra efecto visual de daño por zona cerrada
     */
    showDamageEffect(submarine) {
        // Flash rojo
        this.board.scene.cameras.main.flash(200, 255, 0, 0, false);
        
        // Texto flotante
        const damageText = this.board.scene.add.text(
            submarine.x,
            submarine.y - 30,
            `-${this.config.damagePerTurn}`,
            {
                fontSize: '24px',
                fill: '#ff0000',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        this.board.add(damageText);
        damageText.setDepth(300);
        
        // Animar texto
        this.board.scene.tweens.add({
            targets: damageText,
            y: submarine.y - 60,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => damageText.destroy()
        });
    }

    /**
     * Reubica las zonas de salida cuando el perímetro se cierra
     */
    relocateExitZones() {
        // Verificación robusta de la estructura completa
        if (!this.board) {
            console.warn("Board no existe");
            return;
        }
        
        if (!this.board.exitZones) {
            console.warn("board.exitZones no existe");
            return;
        }
    
        // Verificar que las zonas individuales existen
        if (!this.board.exitZones.red || !this.board.exitZones.blue) {
            console.warn(" Zonas de salida individuales no existen");
            console.log("   exitZones.red:", this.board.exitZones.red);
            console.log("   exitZones.blue:", this.board.exitZones.blue);
            return;
        }
        
        // Verificar que las zonas tienen coordenadas
        if (typeof this.board.exitZones.red.x === 'undefined' || 
            typeof this.board.exitZones.red.y === 'undefined') {
            console.warn(" Zona roja no tiene coordenadas válidas");
            return;
        }
        
        if (typeof this.board.exitZones.blue.x === 'undefined' || 
            typeof this.board.exitZones.blue.y === 'undefined') {
            console.warn("Zona azul no tiene coordenadas válidas");
            return;
        }
        //Verificar y ELIMINAR zonas de salida si están en área cerrada
        if (this.board.exitZoneSystem) {
            this.board.exitZoneSystem.checkAndRemoveIfClosed('red', this.closedRings);
            this.board.exitZoneSystem.checkAndRemoveIfClosed('blue', this.closedRings);
        }
    }


    /**
     * Destruye el sistema
     */
    destroy() {
        this.closedSprites.forEach(sprite => sprite.destroy());
        this.closedSprites = [];
    }
}

