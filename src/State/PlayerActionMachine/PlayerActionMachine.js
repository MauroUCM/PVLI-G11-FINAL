import {StateMachine} from "../StateMachine.js";
import { MoveState } from "./MoveState.js"
import { FireState } from "./FireState.js"
import { AirAttackState } from "./AirAttackState.js"
import { EndState } from "./EndState.js";
import { HealState } from "./HealState.js";

/**
 * La maquina de estado de las acciones del jugador en su turno
 * @class
 */
export class PlayerActionMachine extends StateMachine{

    constructor(scene,gameLoopMachine){
        super(scene);
        this._name = "PlayerAction Machine"
        this._context = gameLoopMachine;
        this._moveState = new MoveState(this);
        this._fireState = new FireState(this);
        this._airAttackState = new AirAttackState(this);
        this._endState = new EndState(this);
        this._healState = new HealState(this);

        this._currentState = this._moveState;
        this._currentState.onStateEnter();
    }

    get stateList(){
        let availableStates = Object.freeze({
            moveState: this._moveState,
            fireState: this._fireState,
            airAttackState: this._airAttackState,
            healState: this._healState,
            endState: this._endState,
        })
        return availableStates;
    }
}