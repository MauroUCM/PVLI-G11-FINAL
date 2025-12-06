import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";

/**
 * FireState
 * 
 * Estado de disparo
 * 
 * CORRECCIÓN: Ahora registra la acción de ataque
 * 
 * CONTROLES:
 * - Jugador 1: W (frente), A (izquierda), D (derecha), S (no disparar)
 * - Jugador 2: Flechas
 * 
 * @class
 */
export class FireState extends State{

    /**
     * Frente
     * @type {Phaser.Input.Keyboard.Key}
     */
    up;

    /**
     * No disparar
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

    /**
     * @type {Phaser.Scene}
     */
    scene;

    constructor(stateMachine){
        super(stateMachine);
        this._name = "Fire State";
        this.scene = this.stateMachine.scene;
    }

    /**
     * Método ejecutado al entrar en este estado
     */
    onStateEnter(){
        console.log(" FireState - Esperando decisión de disparo");
        
        // Actualizar UI
        EventDispatch.emit(Event.UPDATE_PLAYER_ACTION_TEXT, "Fire");

        // Obtener jugador actual
        let currentPlayer = this.stateMachine.context.currentState.id;
        
        // Configurar teclas según el jugador
        if(currentPlayer == 1){
            // Jugador 1 - WASD
            this.up = this.stateMachine.scene.input.keyboard.addKey("W");
            this.down = this.stateMachine.scene.input.keyboard.addKey('S');
            this.left = this.stateMachine.scene.input.keyboard.addKey('A');
            this.right = this.stateMachine.scene.input.keyboard.addKey('D');
        }
        else if(currentPlayer == 2){
            // Jugador 2 - Flechas
            this.up = this.stateMachine.scene.input.keyboard.addKey("UP");
            this.down = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
            this.left = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
            this.right = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        }

        // Teclas para confirmar distancia (pasadas a la ventana de disparo)
        this.confirmButton = [this.left.keyCode, this.right.keyCode];

        // Configurar eventos
        this.setEvent();

        //  Eventos de teclas
        this.up.on("down", () => {
            console.log(" Disparando hacia: Frente");
            EventDispatch.emit(Event.SHOOT, this.confirmButton, 0);
        });
        
        this.down.on("down", () => {
            console.log(" Sin disparo - Pasando a siguiente fase");
            this.transition();
        });
        
        this.left.on("down", () => {
            console.log(" Disparando hacia: Izquierda");
            EventDispatch.emit(Event.SHOOT, this.confirmButton, -90);
        });
        
        this.right.on("down", () => {
            console.log(" Disparando hacia: Derecha");
            EventDispatch.emit(Event.SHOOT, this.confirmButton, 90);
        });
    }

    /**
     * Método ejecutado al salir de este estado
     */
    onStateExit(){
        // Limpiar eventos de teclas
        this.up.off("down");
        this.down.off("down");
        this.left.off("down");
        this.right.off("down");
    }

    /**
     * Transición al siguiente estado (HealState)
     */
    transition(){
        // REGISTRAR que el jugador atacó
        this.stateMachine.recordAction('attacked');
        console.log(" Ataque registrado");
        
        // Transicionar al estado de curación
        this.stateMachine.transition(this.stateMachine.stateList.healState);
    }

    /**
     *  Configura el evento de disparo
     */
    setEvent(){
        EventDispatch.on(Event.SHOOT, (confirmButton, direction) => {
            // Pausar escena principal
            this.scene.scene.pause();
            
            // Lanzar ventana de selección de distancia
            this.scene.scene.launch("fireStateWindow", {
                confirmButton: confirmButton,
                distanceCallback: (distance) => {
                    let range = distance;
                    this.shoot(range, direction);
                },
                currentPlayer: this.stateMachine.context.currentState.id
            });
        });
    }

    /**
     *  Ejecuta el disparo
     * 
     * @param {number} distance - Distancia del disparo (1 o 2)
     * @param {number} direction - Dirección del disparo (0, -90, 90)
     */
    shoot(distance, direction){
        console.log(` Ejecutando disparo: distancia=${distance}, dirección=${direction}`);
        
        // Conversión para usar los métodos del submarino
        if(direction == 0) direction = "front";
        else if(direction == -90) direction = "left";
        else if(direction == 90) direction = "right";

        // Obtener tablero
        let board = null;
        EventDispatch.emit(Event.GET_GAMEBOARD, {
            boardCallback: (b) => { board = b; }
        });

        // Lógica del disparo
        const attacker = board.submarines[board.currentTurn];
        const target = board.currentTurn === "red" ? board.submarines.blue : board.submarines.red;

        // Verificar si el enemigo está en rango
        let isTarget1 = attacker.isTarget(target.position.x, target.position.y, 1);
        let isTarget2 = attacker.isTarget(target.position.x, target.position.y, 2);

        if (isTarget1 || isTarget2) {
            console.log(" Enemigo en rango!");
        }

        // Verificar si está en la dirección correcta y se puede disparar
        let isTargetDir1 = isTarget1 && 
            attacker.isTargetDir(target.position.x, target.position.y, 1, direction) && 
            attacker.canShoot(distance);
            
        let isTargetDir2 = isTarget2 && 
            attacker.isTargetDir(target.position.x, target.position.y, 2, direction) && 
            attacker.canShoot(distance);

        // Ejecutar disparo según distancia
        if (distance == 1) {
            attacker.shoot(distance);
            if (isTargetDir1) {
                target.loseHealth(5);
                console.log(" ¡Impacto directo! -5 HP");
            } else {
                console.log(" Disparo falló");
            }
        }
        if (distance == 2) {
            attacker.shoot(distance);
            if (isTargetDir2 || isTargetDir1) {
                target.loseHealth(2);
                console.log(" ¡Impacto! -2 HP");
            } else {
                console.log(" Disparo falló");
            }
        }

        // Actualizar ambos HUDs
        board.huds[board.currentTurn].update();
        const targetColor = board.currentTurn === "red" ? "blue" : "red";
        board.huds[targetColor].update();

        // Pasar al siguiente estado
        this.transition();
    }
}