import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";

/**
 * HealState - Estado para curación
 * 
 * Permite al jugador usar kits de reparación para curarse
 * Activa el minijuego de reparación
 */
export class HealState extends State {

    /**
     * Usar kit de reparación
     * @type {Phaser.Input.Keyboard.Key}
     */
    useKey;

    /**
     * Saltar curación
     * @type {Phaser.Input.Keyboard.Key}
     */
    skipKey;

    constructor(stateMachine) {
        super(stateMachine);
        this._name = "Heal State";
    }

    onStateEnter() {
        EventDispatch.emit(Event.UPDATE_PLAYER_ACTION_TEXT, "Heal (Optional)");

        const currentPlayer = this.stateMachine.context.currentState.id;
        
        // Obtener el submarino actual
        let currentSubmarine = null;
        EventDispatch.emit(Event.GET_SUBMARINE, 
            currentPlayer === 1 ? "red" : "blue", 
            {
                callBack: (sub) => {
                    currentSubmarine = sub;
                }
            }
        );
        
        // Configurar teclas según el jugador
        if (currentPlayer === 1) {
            this.useKey = this.stateMachine.scene.input.keyboard.addKey("H"); // H de Heal
            this.skipKey = this.stateMachine.scene.input.keyboard.addKey('S');
        } else if (currentPlayer === 2) {
            this.useKey = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO);
            this.skipKey = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        }

        // Mostrar información al jugador
        this.showHealInfo(currentSubmarine);

        // Evento para usar kit
        this.useKey.on("down", () => {
            if (currentSubmarine && currentSubmarine.inventory.repairKits > 0) {
                this.startRepairMinigame(currentSubmarine);
            } else {
                console.log("No hay kits de reparación disponibles");
                this.transition();
            }
        });

        // Evento para saltar
        this.skipKey.on("down", () => {
            console.log("Curación omitida");
            this.transition();
        });
    }

    /**
     * Muestra información sobre curación disponible
     */
    showHealInfo(submarine) {
        if (!submarine) return;
        
        const kits = submarine.inventory.repairKits;
        const currentHP = submarine.currentHP;
        const maxHP = submarine.maxHP;
        const needsHealing = currentHP < maxHP;
        
        if (needsHealing && kits > 0) {
            console.log(`=== CURACIÓN DISPONIBLE ===`);
            console.log(`Vida actual: ${currentHP}/${maxHP}`);
            console.log(`Kits disponibles: ${kits}`);
            console.log(`Presiona H (o NUMPAD_0) para usar kit`);
            console.log(`Presiona S (o DOWN) para omitir`);
            console.log(`===========================`);
        } else if (!needsHealing) {
            console.log("Vida completa - no necesita curación");
            // Saltar automáticamente
            this.transition();
        } else {
            console.log("Sin kits de reparación disponibles");
            // Saltar automáticamente
            this.transition();
        }
    }

  /**
     * Inicia el minijuego de reparación
     */
    startRepairMinigame(currentSubmarine) {
        console.log("Iniciando minijuego de reparación...");
        
        // Calcular curación potencial (30 HP por kit)
        const healAmount = 30;
        
        // Pausar la escena actual
        this.stateMachine.scene.scene.pause();
        
        // Iniciar minijuego de reparación
        this.stateMachine.scene.scene.launch('RepairMinigame', {
            submarine: currentSubmarine,
            returnScene: 'GameScreen',
            healAmount: healAmount
        });
        
        // Cuando termine el minigame, volver
        this.stateMachine.scene.events.once('wake', () => {
            this.transition();
        });
    }

    onStateExit() {
        // Limpiar eventos
        this.useKey.off("down");
        this.skipKey.off("down");
    }

    transition() {
        this.stateMachine.transition(this.stateMachine.stateList.endState);
    }
}