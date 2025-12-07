import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";

/**
 * ExitZoneSystem
 * 
 * Sistema que gestiona las zonas de salida del mapa
 * 
 * - relocateZones() mantiene posición relativa en esquinas
 * - destroy() elimina tweens antes de destruir sprites
 * - animateZoneRelocation() con efectos visuales
 */
export class ExitZoneSystem {
    /**
     * @param {GameBoard} board - Referencia al tablero del juego
     */
    constructor(board) {
        this.board = board;
        
        // Zonas de salida (coordenadas en vértices)
        this.zones = {
            red: null,
            blue: null
        };
        
        // Sprites visuales de las zonas
        this.zoneSprites = {};
        
        console.log("ExitZoneSystem inicializado");
    }

    /**
     * Crea las zonas de salida basándose en las posiciones iniciales de los submarinos
     */
    createExitZones() {
        const w = this.board.config.boardWidth - 1;
        const h = this.board.config.boardHeight - 1;
        
        // Obtener posiciones iniciales de los submarinos
        const sub1Pos = this.board.submarines.red.position;
        const sub2Pos = this.board.submarines.blue.position;
        
        // Zona de salida ROJA (esquina opuesta a spawn de rojo)
        this.zones.red = {
            x: w * 2,
            y: h * 2,
            color: 0xff4444,
            label: 'SALIDA\nROJO'
        };
        
        // Zona de salida AZUL (esquina opuesta a spawn de azul)
        this.zones.blue = {
            x: 0,
            y: 0,
            color: 0x4444ff,
            label: 'SALIDA\nAZUL'
        };
        
        // Visualizar las zonas
        this.visualizeZone(this.zones.red, 'red');
        this.visualizeZone(this.zones.blue, 'blue');
        
        console.log(`Zonas de salida creadas:`);
        console.log(`- Rojo: (${this.zones.red.x}, ${this.zones.red.y})`);
        console.log(`- Azul: (${this.zones.blue.x}, ${this.zones.blue.y})`);
        
        return this.zones;
    }

    /**
     * Visualiza una zona de salida en el tablero
     */
    visualizeZone(zone, playerColor) {
        const cellSize = this.board.config.cellSize;
        const x = this.board.config.x + zone.x * cellSize;
        const y = this.board.config.y + zone.y * cellSize;
        
        // Crear container para la zona
        const container = this.board.scene.add.container(x, y);
        this.board.add(container);
        container.setDepth(50);
        
        // Círculo exterior (grande, transparente)
        const outerCircle = this.board.scene.add.circle(
            0, 0, 
            cellSize * 1.5, 
            zone.color, 
            0.2
        );
        container.add(outerCircle);
        
        // Círculo medio (pulsante)
        const midCircle = this.board.scene.add.circle(
            0, 0, 
            cellSize * 1.0, 
            zone.color, 
            0.4
        );
        container.add(midCircle);
        
        // Círculo interior (sólido)
        const innerCircle = this.board.scene.add.circle(
            0, 0, 
            cellSize * 0.6, 
            zone.color, 
            0.8
        );
        container.add(innerCircle);
        
        // Texto de la zona
        const text = this.board.scene.add.text(
            0, 0, 
            zone.label,
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        text.setOrigin(0.5);
        container.add(text);
        
        // Animación de pulsación del círculo medio
        this.board.scene.tweens.add({
            targets: midCircle,
            scale: 1.1,
            alpha: 0.5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 500
        });
        
        // Guardamos el sprite para futuras referencias
        this.zoneSprites[playerColor] = container;
    }

    /**
     * Verifica si un submarino está en una zona de salida
     */
    checkSubmarineInZone(submarine, zoneName) {
        const zone = this.zones[zoneName];
        if (!zone) return false;
        
        return submarine.position.x === zone.x && 
               submarine.position.y === zone.y;
    }

    /**
     * Reubica las zonas de salida manteniendo su posición relativa en las esquinas
     * 
     * @param {Object} newBounds - Nuevos límites del área válida
     * @param {number} newBounds.minX - Coordenada X mínima
     * @param {number} newBounds.maxX - Coordenada X máxima
     * @param {number} newBounds.minY - Coordenada Y mínima
     * @param {number} newBounds.maxY - Coordenada Y máxima
     */
    relocateZones(newBounds) {
        console.log("\n === REUBICANDO ZONAS DE SALIDA ===");
        console.log("   Posiciones anteriores:");
        console.log(`     Zona Roja: (${this.zones.red.x}, ${this.zones.red.y})`);
        console.log(`     Zona Azul: (${this.zones.blue.x}, ${this.zones.blue.y})`);
        console.log("   Nuevos límites:");
        console.log(`     X: ${newBounds.minX} a ${newBounds.maxX}`);
        console.log(`     Y: ${newBounds.minY} a ${newBounds.maxY}`);
        
        //  DETERMINAR ESQUINA DE CADA ZONA
        
        // Zona AZUL
        const oldBlueX = this.zones.blue.x;
        const oldBlueY = this.zones.blue.y;
        
        let newBlueX, newBlueY;
        
        if (oldBlueX === 0 && oldBlueY === 0) {
            // Esquina superior izquierda
            newBlueX = newBounds.minX;
            newBlueY = newBounds.minY;
            console.log("   Azul: Superior Izquierda");
        } else if (oldBlueY === 0) {
            // Esquina superior derecha
            newBlueX = newBounds.maxX;
            newBlueY = newBounds.minY;
            console.log("   Azul: Superior Derecha");
        } else if (oldBlueX === 0) {
            // Esquina inferior izquierda
            newBlueX = newBounds.minX;
            newBlueY = newBounds.maxY;
            console.log("   Azul: Inferior Izquierda");
        } else {
            // Esquina inferior derecha
            newBlueX = newBounds.maxX;
            newBlueY = newBounds.maxY;
            console.log("   Azul: Inferior Derecha");
        }
        
        // Zona ROJA (normalmente esquina opuesta a azul)
        const oldRedX = this.zones.red.x;
        const oldRedY = this.zones.red.y;
        
        let newRedX, newRedY;
        
        // La roja suele estar en la esquina opuesta
        // Si azul está en (0,0), roja está en (max, max)
        if (oldBlueX === 0 && oldBlueY === 0) {
            // Azul en superior izq → Roja en inferior der
            newRedX = newBounds.maxX;
            newRedY = newBounds.maxY;
            console.log("   Roja: Inferior Derecha (opuesta a azul)");
        } else if (oldBlueY === 0) {
            // Azul en superior → Roja en inferior (mismo lado X)
            newRedX = newBounds.maxX;
            newRedY = newBounds.maxY;
            console.log("   Roja: Inferior Derecha");
        } else {
            // Por defecto, esquina inferior derecha
            newRedX = newBounds.maxX;
            newRedY = newBounds.maxY;
            console.log("   Roja: Inferior Derecha (default)");
        }
        
        //  ACTUALIZAR coordenadas
        this.zones.blue.x = newBlueX;
        this.zones.blue.y = newBlueY;
        this.zones.red.x = newRedX;
        this.zones.red.y = newRedY;
        
        console.log("    Nuevas posiciones:");
        console.log(`     Zona Azul: (${newBlueX}, ${newBlueY})`);
        console.log(`     Zona Roja: (${newRedX}, ${newRedY})`);
        
        //  ANIMAR el movimiento
        this.animateZoneRelocation('blue', newBlueX, newBlueY);
        this.animateZoneRelocation('red', newRedX, newRedY);
        
        console.log("===================================\n");
    }

    /**
     * Anima el movimiento de una zona a su nueva posición
     */
    animateZoneRelocation(zoneName, newX, newY) {
        const sprite = this.zoneSprites[zoneName];
        if (!sprite) {
            console.warn(` No se encontró sprite para zona ${zoneName}`);
            return;
        }
        
        const cellSize = this.board.config.cellSize;
        const newPosX = this.board.config.x + newX * cellSize;
        const newPosY = this.board.config.y + newY * cellSize;
        
        // Efecto de "teletransporte"
        this.board.scene.tweens.add({
            targets: sprite,
            x: newPosX,
            y: newPosY,
            scale: { from: 1, to: 1.5, to: 1 },
            alpha: { from: 1, to: 0.3, to: 1 },
            duration: 800,
            ease: 'Back.easeInOut',
            onStart: () => {
                this.board.scene.cameras.main.flash(200, 255, 255, 0);
            },
            onComplete: () => {
                // Partículas al llegar
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 * i) / 12;
                    const particle = this.board.scene.add.circle(
                        newPosX, newPosY, 5,
                        zoneName === 'red' ? 0xff4444 : 0x4444ff, 1
                    );
                    this.board.add(particle);
                    particle.setDepth(300);
                    
                    this.board.scene.tweens.add({
                        targets: particle,
                        x: newPosX + Math.cos(angle) * 60,
                        y: newPosY + Math.sin(angle) * 60,
                        alpha: 0,
                        scale: 0,
                        duration: 600,
                        ease: 'Cubic.easeOut',
                        onComplete: () => particle.destroy()
                    });
                }
            }
        });
    }

    /**
     * Muestra un efecto cuando un submarino entra en su zona
     */
    showEnterEffect(zoneName) {
        const container = this.zoneSprites[zoneName];
        if (!container) return;
        
        // Efecto de éxito
        const flash = this.board.scene.add.circle(
            container.x, container.y,
            this.board.config.cellSize * 2,
            0xffff00, 0.8
        );
        this.board.add(flash);
        flash.setDepth(200);
        
        this.board.scene.tweens.add({
            targets: flash,
            scale: 3,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => flash.destroy()
        });
        
        // Partículas de celebración
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const particle = this.board.scene.add.star(
                container.x, container.y,
                5, 5, 10, 0xffff00, 1
            );
            this.board.add(particle);
            particle.setDepth(201);
            
            this.board.scene.tweens.add({
                targets: particle,
                x: container.x + Math.cos(angle) * 150,
                y: container.y + Math.sin(angle) * 150,
                alpha: 0,
                scale: 0,
                duration: 1500,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     *  Destruye las zonas de salida COMPLETAMENTE
     */
    destroy() {
        console.log(" Destruyendo ExitZoneSystem...");
        
        // 1. DETENER todos los tweens activos
        Object.values(this.zoneSprites).forEach(sprite => {
            if (sprite) {
                // Detener tweens del container
                this.board.scene.tweens.killTweensOf(sprite);
                
                // Detener tweens de los hijos (círculos, texto)
                if (sprite.list) {
                    sprite.list.forEach(child => {
                        this.board.scene.tweens.killTweensOf(child);
                    });
                }
                
                // Destruir el sprite
                sprite.destroy();
            }
        });
        
        // 2. Limpiar referencias
        this.zoneSprites = {};
        this.zones = { red: null, blue: null };
        
        console.log("   ExitZoneSystem destruido");
    }
}