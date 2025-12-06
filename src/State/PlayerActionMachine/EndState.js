import State from "../State.js";
import EventDispatch from "../../Event/EventDispatch.js";
import Event from "../../Event/Event.js";

/**
 * EndState
 * 
 * Estado de fin de turno
 * 
 * CORRECCIÓN: Ahora bloquea el turno para prevenir acciones adicionales
 * y verifica correctamente la colisión con el dragón
 * 
 * RESPONSABILIDADES:
 * 1. Verificar colisión con el dragón
 * 2. Bloquear el turno actual
 * 3. Pasar al siguiente jugador
 * 
 * @class
 */
export class EndState extends State {
    
    constructor(stateMachine) {
        super(stateMachine);
        this._name = "End State";
    }

    /**
     * Método ejecutado al entrar en este estado
     */
    onStateEnter() {
        console.log(" EndState - Finalizando turno");
        
        // PASO 1: Obtener el submarino del jugador actual
        const currentPlayer = this.stateMachine.context.currentState;
        let currentSubmarine = null;
        
        EventDispatch.emit(
            Event.GET_SUBMARINE, 
            currentPlayer.id === 1 ? "red" : "blue", 
            {
                callBack: (sub) => {
                    currentSubmarine = sub;
                }
            }
        );
        
        // PASO 2: Verificar colisión con el dragón
        if (currentSubmarine) {
            this.checkDragonCollision(currentSubmarine);
        }
        
        // PASO 3: BLOQUEAR el turno para prevenir más acciones
        this.stateMachine.lockTurn();
        console.log(" Turno finalizado y bloqueado");
        
        // PASO 4: Continuar con la transición al siguiente jugador
        this.transition();
    }
    
    /**
     *  Verifica si el submarino está cerca del dragón
     * 
     *  CORREGIDO: Ahora con logging detallado para debugging
     * 
     * @param {SubmarineComplete} submarine - El submarino a verificar
     */
    checkDragonCollision(submarine) {
        let collisionData = {
            collision: false,
            dragonPosition: null
        };
        
        console.log(`   Verificando colisión con dragón para submarino ${submarine.name}`);
        console.log(`   Submarino en posición: (${submarine.position.x}, ${submarine.position.y})`);
        
        // Preguntar al dragón si hay colisión
        EventDispatch.emit(Event.CHECK_DRAGON_COLLISION, submarine, collisionData);
        
        if (collisionData.collision) {
            console.log(`   ¡Colisión detectada! Submarino ${submarine.name} está cerca del dragón`);
            console.log(`   Dragón en posición: (${collisionData.dragonPosition.x}, ${collisionData.dragonPosition.y})`);
            
            // Pausar la escena actual
            this.stateMachine.scene.scene.pause();
            
            // Activar diálogo del minijuego
            this.stateMachine.scene.scene.launch('MinigameDialog', {
                submarine: submarine,
                dragonPosition: collisionData.dragonPosition,
                callingScene: 'GameScreen'
            });
        } else {
            console.log(` No hay colisión - Dragón no está cerca del submarino`);
        }
    }
    
    /**
     *  Método ejecutado al salir de este estado
     */
    onStateExit() {
        // Pasar al siguiente jugador (ejecutado por GameLoopMachine)
        this.stateMachine.context.currentState.transition();
    }
    
    /**
     *  Transición de vuelta al estado de movimiento
     */
    transition() {
        this.stateMachine.transition(this.stateMachine.stateList.moveState);
    }
}