import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";
import { StateMachine } from "../StateMachine.js";

/**
 * @extends State
 * @class CheckState
 * Estado de comprobacion, aqui se puede hacer todas las cosas que hay que hacer despues de una ronda completa
 */
export class CheckState extends State{

    /**
     * @constructor
     * @param {StateMachine} stateMachine La maquina del estado al que pertenece este estado 
     */
    constructor(stateMachine){
        super(stateMachine);
        this._name = "Check State"
    }

    onStateEnter(){
        this.stateMachine.updateRound();
        EventDispatch.emit(Event.UPDATE_ROUND,this.stateMachine.round)
        console.log("Updating information")
        console.log(`Ronda ${this.stateMachine.round}`)
        this.stateMachine.transition(this.stateMachine.stateList.player1);
    }
    onStateExit(){
        
    }

    transition(){
        this.stateMachine.transition(this.stateMachine.stateList.player1)
    }
}