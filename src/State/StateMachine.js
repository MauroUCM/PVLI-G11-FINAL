import State from "./State.js";

/**
 * Clase abstracta de una maquina de estado
 * @class
 * @abstract
 */
export class StateMachine{

    /**
     * La escena en el que esta la maquina del estado
     * @private
     * @type {Phaser.Scene} 
     */
    _scene;

    /**
     * Nombre de la maquina del estado, undefined por defecto
     * @private
     * @type {String} 
     */
    _name;

    /**
     * El estado actual 
     * @private
     */
    _currentState;

    /**
     * El contexto de la maquina del estado, null por defecto
     * @private
     */
    _context;


    /**
     * @constructor
     * @param {Phaser.Scene} scene 
     */
    constructor(scene){
        this._scene = scene
        this._name;
        this._currentState = null;
        this._context = null;
    }

    /**
     * Cambiar el estado actual a un estado dado
     * @method
     * @param {State} state 
     */
    setState(state){
        this._currentState = state;
    }

    onStateEnter(){
        if(this._currentState){
            this._currentState.onStateEnter();
        }
    }

    onStateExit(){
        if(this._currentState){
            this._currentState.onStateExit()
        }
    }

    /**
     * Cambiar a un estado dado, realizando su metodo de entrada y salida
     * @method
     * @param {State} state  
     */
    transition(state){
        /**
         * @type {State}
         */
        this._currentState.onStateExit();
        let nextState = state;
        if(nextState){
            this.setState(nextState)
            this._currentState.onStateEnter();
        }
    }

    /**
     * El nombre de la maquina del estado
     * @property
     * @returns {String}
     */
    get name(){
        return this._name;
    }

    /**
     * El estado actual en la maquina
     * @property
     * @returns {State}
     */
    get currentState(){
        return this._currentState;
    }

    /**
     * La lista de estado que tiene la maquina
     * @property
     * @returns {Object}
     */
    get stateList(){}

    /**
     * El contexto de la maquina del estado
     * @property
     */
    get context(){
        return this._context;
    }

    /**
     * La escena al que pertenece este maquina del estado
     * @property
     * @returns {Phaser.Scene}
     */
    get scene(){
        return this._scene;
    }
}