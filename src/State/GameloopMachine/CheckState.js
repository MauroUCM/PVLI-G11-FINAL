import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";

export class CheckState extends State{
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
        // return this.stateMachine.stateList.player1;
    }
}