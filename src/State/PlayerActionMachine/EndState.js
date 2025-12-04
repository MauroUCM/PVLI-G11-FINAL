import State from "../State.js";

/**
 * Fin de turno, actualiza aqui algunas informaciones tras finalizar el turno de un jugador
 */
export class EndState extends State{
    constructor(stateMachine){
        super(stateMachine);
        this._name = "End State"
    }

    onStateEnter(){
        this.transition();
    }
    
    onStateExit(){
        this.stateMachine.context.currentState.transition();
    }
    
    transition(){
        this.stateMachine.transition(this.stateMachine.stateList.moveState)
    }
}