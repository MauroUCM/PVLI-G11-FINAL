import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";
import { StateMachine } from "../StateMachine.js";

/**
 * CheckState - Estado de verificación mejorado
 * 
 * Verifica condiciones de victoria/derrota al final de cada ronda
 * Actualiza información del juego
 */
export class CheckState extends State {

    /**
     * @constructor
     * @param {StateMachine} stateMachine La máquina del estado al que pertenece
     */
    constructor(stateMachine) {
        super(stateMachine);
        this._name = "Check State";
    }

    onStateEnter() {
        // RESOLVER ATAQUES AÉREOS PENDIENTES
        this.resolveAirAttacks();

        // Actualizar ronda
        this.stateMachine.updateRound();
        EventDispatch.emit(Event.UPDATE_ROUND, this.stateMachine.round);
        
        console.log(`=== RONDA ${this.stateMachine.round} ===`);
        
        //  VERIFICAR CONDICIONES DE VICTORIA/DERROTA 
        const gameEnded = this.checkGameEnd();
        
        if (gameEnded) {
            // El juego terminó, no continuar al siguiente jugador
            return;
        }
        
        // Continuar con el siguiente turno
        this.transition();
    }

    onStateExit() {
        // Nada especial al salir
    }

    transition() {
        this.stateMachine.transition(this.stateMachine.stateList.player1);
    }

    /**
     * Verifica todas las condiciones de fin de juego
     * @returns {Boolean} true si el juego terminó
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
        if (board.exitZones) {
            if (this.checkEscapeZone(sub1, board.exitZones.red)) {
                console.log("¡Submarino ROJO alcanzó la zona de escape!");
                this.endGame('red', 'escape', board);
                return true;
            }
            
            if (this.checkEscapeZone(sub2, board.exitZones.blue)) {
                console.log("¡Submarino AZUL alcanzó la zona de escape!");
                this.endGame('blue', 'escape', board);
                return true;
            }
        }
        
        // No hay victoria, el juego continúa
        return false;
    }

    /**
     * Verifica si un submarino está en su zona de escape
     */
    checkEscapeZone(submarine, zone) {
        if (!zone) return false;
        
        return submarine.position.x === zone.x && 
               submarine.position.y === zone.y;
    }

    /**
     * Termina el juego y muestra la pantalla de victoria
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
     * Recopila estadísticas de la partida
     */
    collectStats(board) {
        const stats = {
            totalTurns: this.stateMachine.round * 2, // 2 turnos por ronda
            hits: 0, // TODO: Implementar tracking de hits
            resourcesCollected: 0,
            duration: this.formatDuration()
        };
        
        // Contar recursos recogidos (los que quedan son los NO recogidos)
        if (board.resourceManager) {
            const remainingResources = board.resourceManager.getAvailableResources().length;
            const totalResources = board.resourceManager.resources.length;
            stats.resourcesCollected = totalResources - remainingResources;
        }
        
        return stats;
    }

    /**
     * Formatea la duración de la partida
     */
    formatDuration() {
        // Estimación simple: ~30 segundos por ronda
        const totalSeconds = this.stateMachine.round * 30;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    resolveAirAttacks() {
     let board = null;
      EventDispatch.emit(Event.GET_GAMEBOARD, {
          boardCallback: (b) => { board = b; }
      });
      
      if (!board) return;
      
      // Buscar casillas con ataques pendientes
     board.matrix.logic.matrix.forEach(row => {
         row.forEach(cell => {
              if (cell && cell.pendingAirAttack) {
                  console.log(`Resolviendo bombardeo en (${cell.position.x}, ${cell.position.y})`);
                 
                 // Explotar en los 4 vértices
                  cell.nextPoint.forEach(vertex => {
                     if (vertex && vertex.submarine) {
                          vertex.submarine.loseHealth(cell.pendingAirAttack.damage);
                         console.log(`${vertex.submarine.name} recibió ${cell.pendingAirAttack.damage} de daño`);
                      }
                 });
                  
                  // Efecto visual de explosión
                  this.showExplosionEffect(cell, board);
                 
                 // Limpiar
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
  
  showExplosionEffect(cell, board) {
      const cellSize = board.config.cellSize;
      const x = cell.position.x * cellSize;
      const y = cell.position.y * cellSize;
      
      // Explosión grande
      const explosion = this.stateMachine.scene.add.circle(x, y, cellSize * 2, 0xff0000, 0.8);
      board.add(explosion);
      explosion.setDepth(500);
      
     this.stateMachine.scene.tweens.add({
          targets: explosion,
          scale: 3,
          alpha: 0,
          duration: 1000,
          ease: 'Cubic.easeOut',
         onComplete: () => explosion.destroy()
      });
      
      // Shake y flash
      this.stateMachine.scene.cameras.main.shake(500, 0.02);
      this.stateMachine.scene.cameras.main.flash(300, 255, 0, 0);
  }
}