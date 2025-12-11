import { StateMachine } from "./StateMachine.js";

/**
 * @class
 * @abstract
 * Clase abstracta de un estado base
 */
export default class State{

    /**
     * La maquina de estado que pertenece este estado
     * @type {StateMachine}
     * @private
     */
    _stateMachine

    /**
     * El nombre del estado
     * @type {String}
     * @private
     */
    _name

    constructor(stateMachine){
        this._stateMachine = stateMachine
        this._name;
    }

    /**
     * Metodo que se llama cuando entra en este estado
     * @abstract
     */
    onStateEnter(){

    }

    /**
     * Metodo que se llama cuando se va a salir de este estado
     * @abstract
     */
    onStateExit(){

    }

    /**
     * @property
     * @returns {string} devuelve el nombre del estado
     */
    get name(){
        return this._name;
    }

    /**
     * @property
     * @returns {StateMachine} devuelve la maquina del estado al que pertenece
     */
    get stateMachine(){
        return this._stateMachine;
    }
}