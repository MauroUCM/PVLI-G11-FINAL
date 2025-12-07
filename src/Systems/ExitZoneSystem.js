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
     * Crea las zonas de salida en las esquinas FIJAS del tablero
     */
    createExitZones() {
        // Obtener dimensiones del tablero en coordenadas de vértices
        const w = this.board.config.boardWidth - 1;
        const h = this.board.config.boardHeight - 1;
        
        console.log("=== CREANDO ZONAS DE SALIDA ===");
        console.log(`  Dimensiones tablero: ${w} x ${h} (en vértices)`);
        
        // SIMPLIFICADO: Salidas FIJAS en esquinas opuestas a spawns
        // Las 4 esquinas del tablero son:
        // Superior Izquierda: (0, 0)
        // Superior Derecha: (w*2, 0)
        // Inferior Izquierda: (0, h*2)
        // Inferior Derecha: (w*2, h*2)
        
        // ZONA ROJA: Esquina inferior derecha (opuesta a spawn rojo en superior izquierda)
        this.zones.red = {
            x: w * 2,
            y: h * 2,
            color: 0xff4444,
            label: 'SALIDA\nROJO'
        };
        
        // ZONA AZUL: Esquina superior izquierda (opuesta a spawn azul en inferior derecha)
        this.zones.blue = {
            x: 0,
            y: 0,
            color: 0x4444ff,
            label: 'SALIDA\nAZUL'
        };
        
        console.log(`  ✓ Zona ROJA creada en: (${this.zones.red.x}, ${this.zones.red.y})`);
        console.log(`  ✓ Zona AZUL creada en: (${this.zones.blue.x}, ${this.zones.blue.y})`);
        
        // Visualizar las zonas
        this.visualizeZone(this.zones.red, 'red');
        this.visualizeZone(this.zones.blue, 'blue');
        
        return this.zones;
    }

    /**
     * Visualiza una zona de salida en el tablero
     */
    visualizeZone(zone, playerColor) {
        const cellSize = this.board.config.cellSize;
        const x = zone.x * cellSize;
        const y = zone.y * cellSize;
        
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
     * Elimina una zona de salida completamente
     * 
     * @param {string} zoneName - 'red' o 'blue'
     */
    removeZone(zoneName) {
        console.log(` Eliminando zona de salida: ${zoneName}`);
        
        // 1. Detener tweens del sprite
        const sprite = this.zoneSprites[zoneName];
        if (sprite && this.board.scene) {
            this.board.scene.tweens.killTweensOf(sprite);
            
            // Si es un contenedor, detener tweens de sus hijos
            if (sprite.list && Array.isArray(sprite.list)) {
                sprite.list.forEach(child => {
                    this.board.scene.tweens.killTweensOf(child);
                });
            }
        }
        
        // 2. Destruir sprite
        if (sprite && sprite.destroy) {
            sprite.destroy();
        }
        
        // 3. Limpiar referencias
        delete this.zoneSprites[zoneName];
        this.zones[zoneName] = null;
        
        console.log(`  ✓ Zona ${zoneName} eliminada`);
    }

    /**
     *Verifica si una zona está en área cerrada y la elimina
     * 
     * @param {string} zoneName - 'red' o 'blue'
     * @param {number} closedRings - Número de anillos cerrados
     */
    checkAndRemoveIfClosed(zoneName, closedRings) {
        const zone = this.zones[zoneName];
        if (!zone) {
            return; // Ya eliminada
        }
        
        // Calcular si está en zona cerrada
        const offset = closedRings * 2;
        const logic = this.board.matrix.logic.matrix;
        const maxX = (logic.length - 1 - closedRings) * 2;
        const maxY = (logic[0].length - 1 - closedRings) * 2;
        const minX = offset * 2;
        const minY = offset * 2;
        
        // Si la zona está fuera del área válida, eliminarla
        if (zone.x < minX || zone.x > maxX || zone.y < minY || zone.y > maxY) {
            console.log(`   Zona ${zoneName} en área cerrada - ELIMINANDO`);
            this.removeZone(zoneName);
        }
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
     * Destruye las zonas de salida COMPLETAMENTE
     */
    destroy() {
        console.log(" Destruyendo ExitZoneSystem...");
        
        // 1. Detener TODOS los tweens primero
        if (this.board && this.board.scene) {
            const scene = this.board.scene;
            
            // Detener tweens de todos los sprites de zona
            for (const [key, sprite] of Object.entries(this.zoneSprites)) {
                if (sprite) {
                    // Detener tweens específicos de este sprite
                    scene.tweens.killTweensOf(sprite);
                    
                    // Si es un contenedor, detener tweens de sus hijos
                    if (sprite.list && Array.isArray(sprite.list)) {
                        sprite.list.forEach(child => {
                            scene.tweens.killTweensOf(child);
                        });
                    }
                }
            }
        }
        
        // 2. Destruir sprites después de detener tweens
        for (const [key, sprite] of Object.entries(this.zoneSprites)) {
            if (sprite && sprite.destroy) {
                console.log(`  Destruyendo sprite de zona ${key}`);
                try {
                    sprite.destroy();
                } catch (e) {
                    console.error(`  Error destruyendo sprite ${key}:`, e);
                }
            }
        }
        
        // 3. Limpiar referencias
        this.zoneSprites = {};
        this.zones = {
            red: null,
            blue: null
        };
        
        console.log("  ✓ ExitZoneSystem destruido completamente");
    }
}
