import { Resource } from "./Resource.js";
import { SubmarineComplete } from "../Submarine/SubmarineComplete.js";

/**
 * Recurso que limita el movimiento del submarino enemigo
 * "El oponente solo puede moverse en dos direcciones durante su próximo turno 
 * (frontal + una lateral aleatoria)"
 * Uso: Manual desde el inventario
 */
export class MovementLimiter extends Resource {
    /**
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {Number} x - Posición X en el tablero lógico
     * @param {Number} y - Posición Y en el tablero lógico
     * @param {String} texture - Textura del recurso
     */
    constructor(scene, x, y, texture = "Resource") {
        super(scene, x, y, texture, "movement_limiter");
        
        this.duration = 1; // Número de turnos que dura el efecto
        this.usedFromInventory = false; // Se guarda en inventario para uso manual
    }

    /**
     * Añade el limitador al inventario del submarino
     * @param {SubmarineComplete} submarine - El submarino que recoge el recurso
     */
    applyEffect(submarine) {
        submarine.addMovementLimiter(1);
        console.log("Limitador de movimiento añadido al inventario");
    }

    /**
     * Usa el limitador sobre el submarino enemigo
     * Debe ser llamado manualmente desde el inventario
     * @param {SubmarineComplete} targetSubmarine - El submarino enemigo a afectar
     */
    use(targetSubmarine) {
        if (!this.usedFromInventory) {
            this.usedFromInventory = true;
            
            // Aplicar restricción al enemigo
            targetSubmarine.movementRestricted = true;
            targetSubmarine.restrictedTurnsRemaining = this.duration;
            targetSubmarine.allowedDirections = ['forward', this.getRandomLateral()];
            
            console.log("Limitador de movimiento activado sobre el enemigo");

        }
    }

    /**
     * Selecciona aleatoriamente un movimiento lateral
     * @returns {String} 'left' o 'right'
     */
    getRandomLateral() {
        return Math.random() < 0.5 ? 'left' : 'right';
    }
}