import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";
import { StateMachine } from "../StateMachine.js";
import { GameStats } from '../../Systems/GameStats.js';

/**
 * CheckState
 * 
 *  Estado que verifica condiciones de victoria/derrota al final de cada ronda
 * 
 * Ahora con sistema robusto de detección de zonas de escape
 * y debugging completo para identificar problemas
 * 
 * RESPONSABILIDADES:
 * 1. Resolver ataques aéreos pendientes
 * 2. Verificar condiciones de victoria
 * 3. Desbloquear turnos para la nueva ronda
 * 4. Actualizar contador de ronda
 * 
 * @class
 */
export class CheckState extends State {

    /**
     * @constructor
     * @param {StateMachine} stateMachine - La máquina del estado al que pertenece
     */
    constructor(stateMachine) {
        super(stateMachine);
        this._name = "Check State";
    }

    /**
     *  Método ejecutado al entrar en este estado
     */
    onStateEnter() {
        //  PASO 1: DESBLOQUEAR turnos para la nueva ronda
        // const playerActionMachine = this.stateMachine.scene.playerActionMachine;
        // if (playerActionMachine) {
        //     playerActionMachine.unlockTurn();
        //     console.log(" Nueva ronda - Turnos desbloqueados");
        // }
        
        // PASO 2: RESOLVER ATAQUES AÉREOS PENDIENTES
        this.resolveAirAttacks();

        // PASO 3: Actualizar ronda
        this.stateMachine.updateRound();
        EventDispatch.emit(Event.UPDATE_ROUND, this.stateMachine.round);
        
        console.log(`\n=== RONDA ${this.stateMachine.round} ===`);
        
        // PASO 4: VERIFICAR CONDICIONES DE VICTORIA/DERROTA 
        const gameEnded = this.checkGameEnd();
        
        if (gameEnded) {
            // El juego terminó, no continuar al siguiente jugador
            console.log(" Juego terminado");
            return;
        }
        
        // PASO 5: Continuar con el siguiente turno
        this.transition();
    }

    /**
     * Método ejecutado al salir de este estado
     */
    onStateExit() {
        // Nada especial al salir
    }

    /**
     * Transición al siguiente estado (Player1)
     */
    transition() {
        this.stateMachine.transition(this.stateMachine.stateList.player1);
    }

    /**
     * Verifica todas las condiciones de fin de juego
     * CON DEBUGGING COMPLETO Y MANEJO ROBUSTO DE ERRORES
     * 
     * @returns {boolean} true si el juego terminó
     */
    checkGameEnd() {
        let board = null;
        
        // Obtener el tablero
        EventDispatch.emit(Event.GET_GAMEBOARD, {
            boardCallback: (b) => { board = b; }
        });
        
        if (!board) {
            console.warn("No se pudo obtener el tablero para verificar victoria");
            return false;
        }
        
        const sub1 = board.submarines.red;
        const sub2 = board.submarines.blue;
        
        // Logging de posiciones actuales
        console.log(`\n === VERIFICACIÓN DE FIN DE JUEGO ===`);
        console.log(`   Submarino Rojo: (${sub1.position.x}, ${sub1.position.y})`);
        console.log(`   Submarino Azul: (${sub2.position.x}, ${sub2.position.y})`);
        
        //  1. VICTORIA POR ELIMINACIÓN 
        if (sub1.isSunk()) {
            console.log("¡Submarino ROJO destruido!");
            this.endGame('blue', 'elimination', board);
            return true;
        }
        
        if (sub2.isSunk()) {
            console.log("¡Submarino AZUL destruido!");
            this.endGame('red', 'elimination', board);
            return true;
        }
        
        //  2. VICTORIA POR ESCAPE 
        // Verificación robusta de la estructura de exitZones
        let redZone = null;
        let blueZone = null;
        
        if (board.exitZones) {
            // Intentar diferentes formas de acceso a las zonas
            if (board.exitZones.red && board.exitZones.blue) {
                // Acceso directo
                redZone = board.exitZones.red;
                blueZone = board.exitZones.blue;
                console.log(`  Zonas encontradas (acceso directo)`);
            } else if (board.exitZones.zones) {
                // Acceso a través de propiedad 'zones'
                redZone = board.exitZones.zones.red;
                blueZone = board.exitZones.zones.blue;
                console.log(`  Zonas encontradas (via .zones)`);
            } else if (board.exitZoneSystem && board.exitZoneSystem.zones) {
                // Acceso a través del sistema
                redZone = board.exitZoneSystem.zones.red;
                blueZone = board.exitZoneSystem.zones.blue;
                console.log(`  Zonas encontradas (via exitZoneSystem)`);
            }
            
            if (redZone && blueZone) {
                console.log(`   Zona Roja: (${redZone.x}, ${redZone.y})`);
                console.log(`   Zona Azul: (${blueZone.x}, ${blueZone.y})`);
            } else {
                console.warn(`  No se encontraron las zonas de escape`);
                console.log(`   Estructura de board.exitZones:`, board.exitZones);
            }
        } else {
            console.warn(`  board.exitZones no existe`);
        }
        
        // Verificar escape del submarino rojo
        if (redZone && this.checkEscapeZone(sub1, redZone)) {
            console.log("¡Submarino ROJO alcanzó la zona de escape!");
            this.endGame('red', 'escape', board);
            return true;
        }
        
        // Verificar escape del submarino azul
        if (blueZone && this.checkEscapeZone(sub2, blueZone)) {
            console.log("Submarino AZUL alcanzó la zona de escape!");
            this.endGame('blue', 'escape', board);
            return true;
        }
        
        console.log(`   No hay victoria todavía`);
        console.log(`===================================\n`);
        
        //  No hay victoria, el juego continúa
        return false;
    }

    /**
     * Verifica si un submarino está en su zona de escape
     * CON DEBUGGING COMPLETO Y CONVERSIÓN DE TIPOS
     * 
     * @param {SubmarineComplete} submarine - El submarino a verificar
     * @param {Object} zone - La zona de escape
     * @returns {boolean} true si el submarino está en la zona
     */
    checkEscapeZone(submarine, zone) {
        // Verificación de null/undefined
        if (!zone) {
            console.error(`Zona de escape null para submarino ${submarine ? submarine.name : 'unknown'}`);
            return false;
        }
        
        if (!submarine || !submarine.position) {
            console.error(`Submarino o posición null`);
            return false;
        }
        
        // Convertir a números para asegurar comparación correcta
        const subX = Number(submarine.position.x);
        const subY = Number(submarine.position.y);
        const zoneX = Number(zone.x);
        const zoneY = Number(zone.y);
        
        // Verificar que las conversiones funcionaron
        if (isNaN(subX) || isNaN(subY) || isNaN(zoneX) || isNaN(zoneY)) {
            console.error(` Error al convertir coordenadas a números`);
            console.error(` Sub: (${submarine.position.x}, ${submarine.position.y})`);
            console.error(` Zone: (${zone.x}, ${zone.y})`);
            return false;
        }
        
        // Logging detallado
        console.log(`\n    Verificando zona de escape para ${submarine.name}:`);
        console.log(`      Posición Submarino: (${subX}, ${subY})`);
        console.log(`      Posición Zona: (${zoneX}, ${zoneY})`);
        
        // Verificación de coincidencia
        const xMatch = subX === zoneX;
        const yMatch = subY === zoneY;
        const isInZone = xMatch && yMatch;
        
        console.log(`      X coincide: ${xMatch} (${subX} === ${zoneX})`);
        console.log(`      Y coincide: ${yMatch} (${subY} === ${zoneY})`);
        
        if (isInZone) {
            console.log(` ¡${submarine.name.toUpperCase()} ESTÁ EN LA ZONA DE ESCAPE!`);
        } else {
            console.log(` No está en la zona de escape`);
        }
        
        return isInZone;
    }

    /**
     * Termina el juego y muestra la pantalla de victoria
     * 
     * @param {string} winner - 'red' o 'blue'
     * @param {string} reason - 'elimination' o 'escape'
     * @param {GameBoard} board - El tablero del juego
     */
    endGame(winner, reason, board) {
        console.log(`\n=== FIN DEL JUEGO ===`);
        console.log(`   Ganador: ${winner.toUpperCase()}`);
        console.log(`   Razón: ${reason === 'escape' ? 'Llegó a la salida' : 'Eliminó al enemigo'}`);
        console.log(`====================\n`);
        
        const stats = this.collectStats(board);
        
        const phaserScene = this.stateMachine.scene;
        
        if (!phaserScene) {
            console.error(" ERROR: No se pudo acceder a la escena de Phaser");
            return;
        }
        
        if (!phaserScene.scene) {
            console.error(" ERROR: phaserScene no tiene propiedad 'scene'");
            return;
        }
        
        console.log(" Lanzando pantalla de Game Over");
        
        try {
            //Desubscribir todos los eventos
            EventDispatch.shutdown()
            phaserScene.scene.stop(phaserScene.scene);
            
            phaserScene.scene.launch('GameOver', {
                winner: winner,
                reason: reason,
                stats: stats
            });
            
            console.log(" Game Over lanzado correctamente");
        } catch (error) {
            console.error("ERROR al lanzar Game Over:", error);
        }
    }

    /**
     *  Recopila estadísticas de la partida
     * 
     * @param {GameBoard} board - El tablero del juego
     * @returns {Object} Objeto con las estadísticas
     */
    collectStats(board) {
        const stats = {
            totalTurns: this.stateMachine.round * 2, // 2 turnos por ronda
            hits: 0, // TODO: Implementar tracking de hits
            resourcesCollected: 0,
            duration: this.formatDuration()
        };
        
        // Contar recursos recogidos
        if (board.resourceManager) {
            const remainingResources = board.resourceManager.getAvailableResources().length;
            const totalResources = board.resourceManager.resources.length;
            stats.resourcesCollected = totalResources - remainingResources;
        }
        
        return stats;
    }

    /**
     *  Formatea la duración de la partida
     * 
     * @returns {string} Duración en formato MM:SS
     */
    formatDuration() {
        // Estimación simple: ~30 segundos por ronda
        const totalSeconds = this.stateMachine.round * 30;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    /**
     *  Resuelve los ataques aéreos pendientes
     */
    resolveAirAttacks() {
        let board = null;
        EventDispatch.emit(Event.GET_GAMEBOARD, {
            boardCallback: (b) => { board = b; }
        });
        
        if (!board) return;
        
        console.log("Resolviendo ataques aéreos pendientes...");
        
        // Buscar casillas con ataques pendientes
        board.matrix.logic.matrix.forEach(row => {
            row.forEach(cell => {
                if (cell && cell.pendingAirAttack) {
                    console.log(`Bombardeo impactando en (${cell.position.x}, ${cell.position.y})`);
                    
                    // Explotar en los 4 vértices
                    cell.nextPoint.forEach(vertex => {
                        if (vertex && vertex.submarine) {
                            vertex.submarine.loseHealth(cell.pendingAirAttack.damage);
                            console.log(`${vertex.submarine.name} recibió ${cell.pendingAirAttack.damage} de daño`);
                        }
                    });
                    
                    // Efecto visual de explosión
                    this.showExplosionEffect(cell, board);
                    
                    // Limpiar ataque pendiente
                    delete cell.pendingAirAttack;
                }
            });
        });
        
        // Actualizar HUDs
        if (board.huds) {
            board.huds.red.update();
            board.huds.blue.update();
        }
    }

    /**
     * Muestra efecto visual de explosión
     * 
     * @param {Square} cell - La casilla donde explotó
     * @param {GameBoard} board - El tablero del juego
     */
    showExplosionEffect(cell, board) {
        const cellSize = board.config.cellSize;
        const x = cell.position.x * cellSize;
        const y = cell.position.y * cellSize;
        
        // Explosión grande
        const explosion = this.stateMachine.scene.add.circle(x, y, cellSize * 2, 0xff0000, 0.8);
        board.add(explosion);
        explosion.setDepth(500);
        
        // Animar explosión
        this.stateMachine.scene.tweens.add({
            targets: explosion,
            scale: 3,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => explosion.destroy()
        });
        
        // Shake y flash de cámara
        this.stateMachine.scene.cameras.main.shake(500, 0.02);
        this.stateMachine.scene.cameras.main.flash(300, 255, 0, 0);
    }
}