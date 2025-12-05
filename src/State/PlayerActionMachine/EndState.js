import State from "../State.js";
import EventDispatch from "../../Event/EventDispatch.js";
import Event from "../../Event/Event.js";

/**
 * EndState - Fin de turno mejorado
 * 
 * Actualiza información tras finalizar el turno de un jugador
 * Ahora también verifica colisiones con el dragón
 */
export class EndState extends State {
    constructor(stateMachine) {
        super(stateMachine);
        this._name = "End State";
    }

    onStateEnter() {
        // Obtener el submarino actual
        const currentPlayer = this.stateMachine.context.currentState;
        let currentSubmarine = null;
        
        EventDispatch.emit(Event.GET_SUBMARINE, currentPlayer.id === 1 ? "red" : "blue", {
            callBack: (sub) => {
                currentSubmarine = sub;
            }
        });
        
        // Verificar colisión con dragón
        if (currentSubmarine) {
            this.checkDragonCollision(currentSubmarine);
        }
        
        // Continuar con la transición normal
        this.transition();
    }
    
    /**
     * Verifica si el submarino está cerca del dragón
     */
    checkDragonCollision(submarine) {
        let collisionData = {
            collision: false,
            dragonPosition: null
        };
        
        // Preguntar al dragón si hay colisión
        EventDispatch.emit(Event.CHECK_DRAGON_COLLISION, submarine, collisionData);
        
        if (collisionData.collision) {
            console.log('¡Submarino cerca del dragón!');
            
            // Pausar la escena actual
            this.stateMachine.scene.scene.pause();
            
            // Activar diálogo del minijuego
            this.stateMachine.scene.scene.launch('MinigameDialog', {
                submarine: submarine,
                dragonPosition: collisionData.dragonPosition,
                callingScene: 'GameScreen'
            });
        }
    }
    
    onStateExit() {
        // Pasar al siguiente jugador
        this.stateMachine.context.currentState.transition();
    }
    
    transition() {
        this.stateMachine.transition(this.stateMachine.stateList.moveState);
    }
}