import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";

/**
 * MoveState
 * 
 * Estado de movimiento del jugador
 * 
 * CORRECCIÓN: Ahora registra la acción de movimiento
 * 
 * CONTROLES:
 * - Jugador 1: W (adelante), A (izquierda), D (derecha), S (no moverse)
 * - Jugador 2: Flechas
 * 
 * @class
 */
export class MoveState extends State{

    /**
     * Dirección del frente
     * @type {Phaser.Input.Keyboard.Key}
     */
    up;

    /**
     * No mover
     * @type {Phaser.Input.Keyboard.Key}
     */
    down;

    /**
     * Izquierda
     * @type {Phaser.Input.Keyboard.Key}
     */
    left;

    /**
     * Derecha
     * @type {Phaser.Input.Keyboard.Key}
     */
    right;

    constructor(stateMachine){
        super(stateMachine);
        this._name = "Move State";
    }
    
    /**
     * Método ejecutado al entrar en este estado
     */
    onStateEnter(){
        console.log(" MoveState - Esperando movimiento del jugador");
        
        // Actualizar UI para mostrar que estamos en fase de movimiento
        EventDispatch.emit(Event.UPDATE_PLAYER_ACTION_TEXT, "Move");

        // Obtener el ID del jugador actual
        let currentPlayer = this.stateMachine.context.currentState.id;

        // Configurar teclas según el jugador
        if(currentPlayer == 1){
            // Jugador 1 (Rojo/China) - Teclas WASD
            this.up = this.stateMachine.scene.input.keyboard.addKey("W");
            this.down = this.stateMachine.scene.input.keyboard.addKey('S');
            this.left = this.stateMachine.scene.input.keyboard.addKey('A');
            this.right = this.stateMachine.scene.input.keyboard.addKey('D');
        }
        else if(currentPlayer == 2){
            // Jugador 2 (Azul/Japón) - Flechas
            this.up = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
            this.down = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
            this.left = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
            this.right = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        }

        //  Configurar eventos de teclas
        this.up.on("down", () => {
            console.log(" Movimiento: Adelante");
            EventDispatch.emit(Event.MOVE, currentPlayer, 0);
            this.transition();
        });
        
        this.down.on("down", () => {
            console.log(" Movimiento: Permanecer quieto");
            EventDispatch.emit(Event.MOVE, currentPlayer, null);
            this.transition();
        });
        
        this.left.on("down", () => {
            console.log(" Movimiento: Izquierda");
            EventDispatch.emit(Event.MOVE, currentPlayer, -90);
            this.transition();
        });
        
        this.right.on("down", () => {
            console.log(" Movimiento: Derecha");
            EventDispatch.emit(Event.MOVE, currentPlayer, 90);
            this.transition();
        });
    }

    /**
     * Método ejecutado al salir de este estado
     */
    onStateExit(){
        // Emitir eventos de actualización
        EventDispatch.emit(Event.MOVE_DRAGON);
        EventDispatch.emit(Event.UPDATE_MAP);
        
        // Limpiar eventos de teclas
        this.up.off("down");
        this.down.off("down");
        this.left.off("down");
        this.right.off("down");
    }

    /**
     * Transición al siguiente estado (FireState)
     */
    transition(){
        // REGISTRAR que el jugador se movió
        this.stateMachine.recordAction('moved');
        console.log(" Movimiento registrado");
        
        // Transicionar al estado de disparo
        this.stateMachine.transition(this.stateMachine.stateList.fireState);
    }
}