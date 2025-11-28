import {StateMachine} from "../StateMachine.js";
import { Player1 } from "./Player1.js";
import { Player2 } from "./Player2.js";
import { CheckState } from "./CheckState.js";

/**
 * La maquina del estado que controla el bucle del juego principal
 */
export class GameLoopMachine extends StateMachine{

    constructor(scene){
        super(scene);
        this._round = 0;
        this._name = "Gameloop Machine"
        this._player1 = new Player1(this,1);
        this._player2 = new Player2(this,2);
        this._checkState = new CheckState(this);

        this._currentState = this._checkState;
        this._currentState.onStateEnter();
    }

    get stateList(){
        let availableStates = Object.freeze({
            player1: this._player1,
            player2: this._player2,
            checkState: this._checkState,
        })
        return availableStates;
    }

    /**
     * Metodo que suma uno al numero de ronda
     * @method
     */
    updateRound(){
        ++this._round;
    }

    /**
     * Devuelve la ronda actual
     * @property
     * @returns {Number}
     */
    get round(){
        return this._round;
    }
}