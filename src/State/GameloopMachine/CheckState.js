import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";
import { StateMachine } from "../StateMachine.js";

/**
 * CheckState
 * 
 *  Estado que verifica condiciones de victoria/derrota al final de cada ronda
 * 
 * CORRECCIÓN: Ahora desbloquea los turnos al inicio de cada nueva ronda
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
        // 🆕 PASO 1: DESBLOQUEAR turnos para la nueva ronda
        const playerActionMachine = this.stateMachine.scene.playerActionMachine;
        if (playerActionMachine) {
            playerActionMachine.unlockTurn();
            console.log(" Nueva ronda - Turnos desbloqueados");
        }
        
        // PASO 2: RESOLVER ATAQUES AÉREOS PENDIENTES
        this.resolveAirAttacks();

        // PASO 3: Actualizar ronda
        this.stateMachine.updateRound();
        EventDispatch.emit(Event.UPDATE_ROUND, this.stateMachine.round);
        
        console.log(`=== RONDA ${this.stateMachine.round} ===`);
        
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
     * 🔄 Transición al siguiente estado (Player1)
     */
    transition() {
        this.stateMachine.transition(this.stateMachine.stateList.player1);
    }

    /**
     *  Verifica todas las condiciones de fin de juego
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
            console.warn(" No se pudo obtener el tablero para verificar victoria");
            return false;
        }
        
        const sub1 = board.submarines.red;
        const sub2 = board.submarines.blue;
        
        //  1. VICTORIA POR ELIMINACIÓN 
        if (sub1.isSunk()) {
            console.log(" ¡Submarino ROJO destruido!");
            this.endGame('blue', 'elimination', board);
            return true;
        }
        
        if (sub2.isSunk()) {
            console.log(" ¡Submarino AZUL destruido!");
            this.endGame('red', 'elimination', board);
            return true;
        }
        
        //  2. VICTORIA POR ESCAPE 
        if (board.exitZones) {
            if (this.checkEscapeZone(sub1, board.exitZones.red)) {
                console.log(" ¡Submarino ROJO alcanzó la zona de escape!");
                this.endGame('red', 'escape', board);
                return true;
            }
            
            if (this.checkEscapeZone(sub2, board.exitZones.blue)) {
                console.log(" ¡Submarino AZUL alcanzó la zona de escape!");
                this.endGame('blue', 'escape', board);
                return true;
            }
        }
        
        //  No hay victoria, el juego continúa
        return false;
    }

    /**
     *  Verifica si un submarino está en su zona de escape
     * 
     * @param {SubmarineComplete} submarine - El submarino a verificar
     * @param {Object} zone - La zona de escape
     * @returns {boolean} true si el submarino está en la zona
     */
    checkEscapeZone(submarine, zone) {
        if (!zone) return false;
        
        return submarine.position.x === zone.x && 
               submarine.position.y === zone.y;
    }

    /**
     *  Termina el juego y muestra la pantalla de victoria
     * 
     * @param {string} winner - 'red' o 'blue'
     * @param {string} reason - 'elimination' o 'escape'
     * @param {GameBoard} board - El tablero del juego
     */
    endGame(winner, reason, board) {
        console.log(`=== FIN DEL JUEGO ===`);
        console.log(`Ganador: ${winner}`);
        console.log(`Razón: ${reason}`);
        
        // Recopilar estadísticas
        const stats = this.collectStats(board);
        
        // Pausar la escena del juego
        this.stateMachine.scene.scene.pause('GameScreen');
        
        // Mostrar pantalla de Game Over
        this.stateMachine.scene.scene.launch('GameOver', {
            winner: winner,
            reason: reason,
            stats: stats
        });
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
                    console.log(` Bombardeo impactando en (${cell.position.x}, ${cell.position.y})`);
                    
                    // Explotar en los 4 vértices
                    cell.nextPoint.forEach(vertex => {
                        if (vertex && vertex.submarine) {
                            vertex.submarine.loseHealth(cell.pendingAirAttack.damage);
                            console.log(` ${vertex.submarine.name} recibió ${cell.pendingAirAttack.damage} de daño`);
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