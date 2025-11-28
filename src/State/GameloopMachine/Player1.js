import { PlayerState } from "./PlayerState.js";
import EventDispatch from "../../Event/EventDispatch.js";
import Event from "../../Event/Event.js";

/**
 * El "jugador" con submarino rojo
 * @extends {PlayerState}
 * @class
 */
export class Player1 extends PlayerState{

    /**
     * @constructor
     * @param {StateMachine} stateMachine
     * @param {Number} id El id del jugador 
     */
    constructor(stateMachine,id){
        super(stateMachine,id);
        this._name = "Player 1"
    }

    onStateEnter(){
        EventDispatch.emit(Event.UPDATE_PLAYER_TEXT,"rojo")
    }
    onStateExit(){
        EventDispatch.emit(Event.END_TURN);
    }
    

    transition(){
        this.stateMachine.transition(this.stateMachine.stateList.player2)
    }
}