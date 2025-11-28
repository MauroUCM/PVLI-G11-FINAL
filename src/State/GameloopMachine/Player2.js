import Event from "../../Event/Event.js";
import EventDispatch from "../../Event/EventDispatch.js";
import { StateMachine } from "../StateMachine.js";
import { PlayerState } from "./PlayerState.js";

/**
 * El "jugador" con submarino azul
 * @extends {PlayerState}
 * @class
 */
export class Player2 extends PlayerState{
    /**
     * 
     * @param {StateMachine} stateMachine
     * @param {Number} id El id del jugador 
     */
    constructor(stateMachine,id){
        super(stateMachine,id);
        this._name = "Player 2"
    }

    onStateEnter(){
        EventDispatch.emit(Event.UPDATE_PLAYER_TEXT,"azul")
    }
    onStateExit(){
        EventDispatch.emit(Event.END_TURN);
    }

    transition(){
        this.stateMachine.transition(this.stateMachine.stateList.checkState)
    }
}