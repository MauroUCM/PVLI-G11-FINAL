import { Position } from "../Board/Position.js";
import { SubmarineComplete } from "../Submarine/SubmarineComplete.js";

/**
 * Clase base para todos los recursos del juego que pueden ser recogidos en el mapa
 * Los recursos aparecen en casillas específicas y se recogen automáticamente al pasar por encima
 */
export class Resource extends Phaser.GameObjects.Sprite 
{
    /**
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {Number} x - Posición X en el tablero lógico
     * @param {Number} y - Posición Y en el tablero lógico
     * @param {String} texture - Textura del recurso (todos visualmente iguales según GDD)
     * @param {String} type - Tipo de recurso ('cooldown_reducer', 'movement_limiter', 'repair_kit')
     */
    constructor(scene, x, y, texture = "Resource", type) {
        super(scene, x, y, texture);
        
        this.position = new Position(x, y);
        this.type = type;
        this.collected = false; // Indica si ya fue recogido
        this.visible = true;
        
        scene.add.existing(this);
    }

    /**
     * Método que se ejecuta cuando el recurso es recogido por un submarino
     * @param {SubmarineComplete} submarine - El submarino que recoge el recurso
     */
    collect(submarine) {
        if (!this.collected) {
            this.collected = true;
            this.setVisible(false);
            this.applyEffect(submarine);
            // TODO: Añadir animación de recolección
            console.log(`Recurso ${this.type} recogido en (${this.position.x}, ${this.position.y})`);
        }
    }

    /**
     * Método abstracto - debe ser implementado por las subclases
     * Define el efecto específico de cada tipo de recurso
     * @param {SubmarineComplete} submarine - El submarino que recibe el efecto
     */
    applyEffect(submarine) {
        console.warn("applyEffect() debe ser implementado en la subclase");
    }

    /**
     * Verifica si el recurso está en una posición específica del tablero
     * @param {Number} x - Coordenada X
     * @param {Number} y - Coordenada Y
     * @returns {Boolean} true si el recurso está en esa posición
     */
    isAtPosition(x, y) {
        return this.position.x === x && this.position.y === y && !this.collected;
    }

    /**
     * Verifica si el recurso aún está disponible para ser recogido
     * @returns {Boolean}
     */
    isAvailable() {
        return !this.collected;
    }
}