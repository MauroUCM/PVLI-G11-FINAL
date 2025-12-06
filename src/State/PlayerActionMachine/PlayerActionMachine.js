import {StateMachine} from "../StateMachine.js";
import { MoveState } from "./MoveState.js"
import { FireState } from "./FireState.js"
import { AirAttackState } from "./AirAttackState.js"
import { EndState } from "./EndState.js";
import { HealState } from "./HealState.js";

/**
 * PlayerActionMachine
 * 
 *  Máquina de estado que controla las acciones del jugador en su turno
 * 
 *  CORRECCIÓN: Ahora incluye sistema de bloqueo de turno para prevenir
 *  que los jugadores realicen múltiples acciones en un mismo turno
 * 
 * FLUJO:
 * MoveState → FireState → HealState → EndState
 * 
 * @class
 */
export class PlayerActionMachine extends StateMachine{

    constructor(scene,gameLoopMachine){
        super(scene);
        this._name = "PlayerAction Machine"
        this._context = gameLoopMachine;

        // Sistema de bloqueo de turno
        // Este sistema previene que los jugadores realicen múltiples acciones
        this._turnLocked = false; // Cuando es true, no se permiten más transiciones
        
        // Registro de acciones realizadas en el turno actual
        this._actionsPerformed = {
            moved: false,      // Si el jugador se movió
            attacked: false,   // Si el jugador atacó
            healed: false      // Si el jugador se curó
        };
        
        // Estados disponibles
        this._moveState = new MoveState(this);
        this._fireState = new FireState(this);
        this._airAttackState = new AirAttackState(this);
        this._endState = new EndState(this);
        this._healState = new HealState(this);

        // Iniciar en MoveState
        this._currentState = this._moveState;
        this._currentState.onStateEnter();
    }

    /**
     *  Verifica si el turno está bloqueado
     * @returns {boolean} true si el turno está bloqueado
     */
    get isTurnLocked() {
        return this._turnLocked;
    }

    /**
     *  Bloquea el turno para prevenir más acciones
     * Se llama desde EndState cuando el turno termina
     */
    lockTurn() {
        this._turnLocked = true;
        console.log(" Turno bloqueado - No se permiten más acciones");
    }

    /**
     *  Desbloquea el turno para permitir nuevas acciones
     * Se llama desde CheckState al inicio de cada nueva ronda
     */
    unlockTurn() {
        this._turnLocked = false;
        
        // Resetear el registro de acciones
        this._actionsPerformed = {
            moved: false,
            attacked: false,
            healed: false
        };
        
        console.log(" Turno desbloqueado - Nuevo turno iniciado");
    }

    /**
     *  Registra que se realizó una acción en el turno actual
     * 
     * @param {string} actionType - Tipo de acción ('moved', 'attacked', 'healed')
     */
    recordAction(actionType) {
        if (this._actionsPerformed[actionType] !== undefined) {
            this._actionsPerformed[actionType] = true;
            console.log(` Acción registrada: ${actionType}`);
        } else {
            console.warn(` Tipo de acción desconocido: ${actionType}`);
        }
    }

    /**
     * Transición entre estados con verificación de bloqueo
     * 
     *  MODIFICADO: Ahora verifica si el turno está bloqueado antes de permitir transiciones
     * 
     * @param {State} state - Estado al que transicionar
     */
    transition(state){
        //  VERIFICAR si el turno está bloqueado
        if (this._turnLocked) {
            console.warn(" Transición bloqueada - El turno ya ha finalizado");
            return; // No permitir la transición
        }
        
        // Ejecutar salida del estado actual
        this._currentState.onStateExit();
        
        // Transicionar al nuevo estado
        let nextState = state;
        if(nextState){
            this.setState(nextState);
            this._currentState.onStateEnter();
        }
    }

    /**
     * Obtiene la lista de estados disponibles
     * @returns {Object} Objeto con todos los estados
     */
    get stateList(){
        let availableStates = Object.freeze({
            moveState: this._moveState,
            fireState: this._fireState,
            airAttackState: this._airAttackState,
            healState: this._healState,
            endState: this._endState,
        });
        return availableStates;
    }
}