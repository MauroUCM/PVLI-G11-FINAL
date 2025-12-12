import { Position } from "../Board/Position.js";
import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";

/**
 * Orientaciones posibles del submarino
 * 
 * VALORES:
 * - N (0°): Norte - Arriba
 * - E (90°): Este - Derecha
 * - S (180°): Sur - Abajo
 * - W (270°): Oeste - Izquierda
 * 
 * @enum {Number}
 * @readonly
 */
export const Orientation = Object.freeze({
    N: 0,
    E: 90,
    S: 180,
    W: 270,

    /**
     * Obtiene las direcciones disponibles desde una orientación
     * 
     * @param {Number} direction - Orientación actual
     * @returns {Array.<Number>} Array con dirección actual y ±90°
     * 
     * @example
     * // Si miras al Norte (0°):
     * getAvailableDirection(0) // [0, 90, 270] = N, E, W
     */
    getAvailableDirection(direction) {
        return [direction, (direction + 90) % 360, (direction - 90) % 360];
    }
});

/**
 * Submarine_Complete
 * 
 * Clase completa del submarino que integra:
 *  - Movimiento y orientación
 *  - Sistema de combate (munición y disparos)
 *  - Sistema de vida
 *  - Inventario de recursos
 */
export class SubmarineComplete extends Phaser.GameObjects.Image {
    /**
     * @param {Phaser.Scene} scene - Escena donde se dibuja el submarino
     * @param {Number} x - Coordenada X inicial en la matriz del tablero
     * @param {Number} y - Coordenada Y inicial en la matriz del tablero
     * @param {LogicBoard} board - Tablero del juego
     * @param {Phaser.GameObjects.Container} container - Contenedor del tablero
     */
    constructor(scene, x, y, board, container, name,id) {
        super(scene, 100, 100, "Submarine", 0);
        
        // Nombre(color) del submarino
        this.name = name
        this.id = id;

        // Referencias externas
        this.container = container;
        this.board = board;

        // Posición en la matriz del tablero
        this.position = this.board.matrix[x * 2][y * 2].position;
        this.board.matrix[this.position.x][this.position.y].enter(this);

        // Orientación inicial
        this.orientation = Orientation.E;

        // Sistema de vida
        this.maxHP = 100;
        this.currentHP = 100;
        this.hasLeaks = false;
        this.leakDamagePerTurn = 0;

        // Sistema de munición
        this.mun1 = 15; // Munición corta distancia (1 casilla)
        this.mun2 = 15; // Munición larga distancia (2 casillas)

        // Sistema de ataque aéreo
        this.aerialCooldown = 2; // Comienza con 2 turnos de cooldown
        this.maxAerialCooldown = 3;

        // Inventario de recursos
        this.inventory = {
            cooldownReducers: 0,
            movementLimiters: 0,
            repairKits: 0,
            ammunition: 0
        };

        // Restricciones de movimiento (por Movement Limiter)
        this.movementRestricted = false;
        this.restrictedTurnsRemaining = 0;
        this.allowedDirections = ['front', 'left', 'right'];

        // Configuración visual
        this.texture = "Submarine";
        container.add(this);
        this.setScale(0.2);
        this.setOrigin(0.5, 0.5);
        this.updateSprite();

        EventDispatch.on(Event.MOVE,(player,direction)=>{
            if(player == this.id){
                console.log(this.name);
                if(direction == 0) this.moveFront();
                if(direction == 90) this.moveRight();
                if(direction == -90) this.moveLeft();
                this.container.resourceManager.checkAndCollectResource(this);
                this.container.huds[this.container.currentTurn].update()
            }
        })

        //Devuelve el submarino si coincide el nombre o ID
        //Tony y Pablo no me mateis...
        EventDispatch.on(Event.GET_SUBMARINE,(name,callback)=>{
            if(this.name == name){
                callback.callBack(this);
            }
        })
    }

    // GETTERS 
    get X() {
        return this.position.x;
    }

    get Y() {
        return this.position.y;
    }

    get HP() {
        return this.currentHP;
    }

    get MaxHP() {
        return this.maxHP;
    }

    //ACTUALIZACIÓN VISUAL
    updateSprite() {
        const cellSize = this.container.config.cellSize;
        this.setPosition(this.position.x * cellSize, this.position.y * cellSize);
        this.setAngle(this.orientation -90); 
    }

    //MOVIMIENTO

    /**
     * Recoloca el submarino en una nueva posición
     * 
     * USO:
     * - Spawn inicial
     * - Teletransporte (si se implementa)
     * - Debug/testing
     * 
     * NOTA: No verifica colisiones ni validez de la posición
     * 
     * @param {Number} newX - Nueva coordenada X (lógica)
     * @param {Number} newY - Nueva coordenada Y (lógica)
     */
    setNewPosition(newX, newY) {
        const cellSize = this.container.config.cellSize;
        this.position.x = newX;
        this.position.y = newY;
        this.setPosition(this.position.x * cellSize, this.position.y * cellSize);
        this.setAngle(this.orientation -90); 
    }

    /**
     * Verifica si el submarino puede moverse a una posición
     * 
     * CONDICIONES PARA MOVERSE:
     * 1. La posición debe estar dentro del tablero
     * 2. No debe haber otro submarino en esa posición
     * 
     * @param {Number} newX - Coordenada X destino
     * @param {Number} newY - Coordenada Y destino
     * @returns {Boolean} true si puede moverse
     */
    canMoveTo(newX, newY) {
        // if(this.board.matrix[newX][newY].submarine != null){
        //     console.log("No se puede mover a esa direccion!")
        //     return false;   
        // }

        return (
            newX >= 0 &&
            newY >= 0 &&
            newX <= this.board.matrix.length - 1 &&
            newY <= this.board.matrix[0].length - 1 &&
            this.board.matrix[newX][newY].submarine == null
        );
    }

    /**
     * Mueve el submarino hacia adelante (en la dirección que mira)
     * 
     * COMPORTAMIENTO:
     * - Avanza 2 casillas en la orientación actual
     * - Sale del vértice actual
     * - Entra en el nuevo vértice
     * - Actualiza visual
     * 
     * RESTRICCIÓN:
     * - Si movementRestricted = true y 'front' no está en allowedDirections,
     *   el movimiento se bloquea
     * 
     * @returns {Boolean} true si se movió exitosamente, false si no pudo
     */
    moveFront() {
        if (this.movementRestricted && !this.allowedDirections.includes('front')) {
            return false;
        }

        let newX = this.position.x;
        let newY = this.position.y;

        switch (this.orientation) {
            case Orientation.N:
                newY -= 2;
                break;
            case Orientation.S:
                newY += 2;
                break;
            case Orientation.E:
                newX += 2;
                break;
            case Orientation.W:
                newX -= 2;
                break;
        }

        if (this.canMoveTo(newX, newY)) {
            //Salir de la casilla actual
            this.board.matrix[this.position.x][this.position.y].exit();

            //Ir a la nueva
            this.position = this.board.matrix[newX][newY].position;

            //Actualizar la casilla
            this.board.matrix[newX][newY].enter(this);

            this.updateSprite();
            console.log("Moviéndose a", this.position);
            return true;
        } else {
            console.log("Fuera del tablero.");
            return false;
        }
    }

    /**
     * Gira el submarino 90° a la derecha y avanza 2 casillas
     * 
     * COMPORTAMIENTO:
     * - Gira: N→E, E→S, S→W, W→N
     * - Avanza 2 casillas en la nueva dirección
     * - Sale del vértice actual y entra en el nuevo
     * 
     * RESTRICCIÓN:
     * - Si movementRestricted = true y 'right' no está permitido, se bloquea
     * 
     * @returns {Boolean} true si se movió, false si no pudo
     */
    moveRight() {
        if (this.movementRestricted && !this.allowedDirections.includes('right')) {
            return false;
        }

        let newDirection = Orientation.N;
        let newX = this.position.x;
        let newY = this.position.y;

        switch (this.orientation) {
            case Orientation.N:
                newDirection = Orientation.E;
                newX += 2;
                break;
            case Orientation.S:
                newDirection = Orientation.W;
                newX -= 2;
                break;
            case Orientation.E:
                newDirection = Orientation.S;
                newY += 2;
                break;
            case Orientation.W:
                newDirection = Orientation.N;
                newY -= 2;
                break;
        }

        if (this.canMoveTo(newX, newY)) {
            //Salir de la casilla actual
            this.board.matrix[this.position.x][this.position.y].exit();

            //Ir a la nueva
            this.position = this.board.matrix[newX][newY].position;

            //Actualizar la casilla
            this.board.matrix[newX][newY].enter(this);
            this.orientation = newDirection;
            this.updateSprite();
            console.log("Moviéndose a", this.position);
            return true;
        } else {
            console.log("Fuera del tablero.");
            return false;
        }
    }

    /**
     * Gira el submarino 90° a la izquierda y avanza 2 casillas
     * 
     * COMPORTAMIENTO:
     * - Gira: N→W, W→S, S→E, E→N
     * - Avanza 2 casillas en la nueva dirección
     * 
     * RESTRICCIÓN:
     * - Si movementRestricted = true y 'left' no está permitido, se bloquea
     * 
     * @returns {Boolean} true si se movió, false si no pudo
     */
    moveLeft() {
        if (this.movementRestricted && !this.allowedDirections.includes('left')) {
            return false;
        }

        let newDirection = Orientation.N;
        let newX = this.position.x;
        let newY = this.position.y;

        switch (this.orientation) {
            case Orientation.N:
                newDirection = Orientation.W;
                newX -= 2;
                break;
            case Orientation.S:
                newDirection = Orientation.E;
                newX += 2;
                break;
            case Orientation.E:
                newDirection = Orientation.N;
                newY -= 2;
                break;
            case Orientation.W:
                newDirection = Orientation.S;
                newY += 2;
                break;
        }

        if (this.canMoveTo(newX, newY)) {
            //Salir de la casilla actual
            this.board.matrix[this.position.x][this.position.y].exit();

            //Ir a la nueva
            this.position = this.board.matrix[newX][newY].position;

            //Actualizar la casilla
            this.board.matrix[newX][newY].enter(this);

            this.orientation = newDirection;
            this.updateSprite();
            console.log("Moviéndose a", this.position);
            return true;
        } else {
            console.log("Fuera del tablero.");
            return false;
        }
    }

    //SISTEMA DE COMBATE 
    /**
     * Verifica si hay munición disponible
     */
    canShoot(distance) {
        if (distance === 1) {
            return this.mun1 > 0;
        } else if (distance === 2) {
            return this.mun2 > 0;
        }
        return false;
    }

    /**
     * Dispara y reduce munición
     */
    shoot(distance) {
        if (distance === 1) {
            if (this.canShoot(distance)) {
                this.mun1 -= 1;
                return true;
            } else {
                return false;
            }
        }
        if (distance === 2) {
            if (this.canShoot(distance)) {
                this.mun2 -= 1;
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    /**
     * Verifica si una posición es objetivo válido (sin dirección)
     */
    isTarget(x, y, distance) {
        distance = distance * 2;
        let mismaX = this.position.x === x;
        let mismaY = this.position.y === y;
        return (
            (mismaY && (this.position.x - distance === x || this.position.x + distance === x)) ||
            (mismaX && (this.position.y - distance === y || this.position.y + distance === y))
        );
    }

    /**
     * Verifica si una posición es objetivo válido en una dirección específica
     */
    isTargetDir(x, y, distance, direction) {
        distance = distance * 2;
        let mismaX = this.position.x === x;
        let mismaY = this.position.y === y;

        switch (direction) {
            case "front":
                if (this.orientation === Orientation.N) return mismaX && this.position.y - distance === y;
                if (this.orientation === Orientation.S) return mismaX && this.position.y + distance === y;
                if (this.orientation === Orientation.E) return mismaY && this.position.x + distance === x;
                if (this.orientation === Orientation.W) return mismaY && this.position.x - distance === x;
                break;
            case "right":
                if (this.orientation === Orientation.N) return mismaY && this.position.x + distance === x;
                if (this.orientation === Orientation.S) return mismaY && this.position.x - distance === x;
                if (this.orientation === Orientation.E) return mismaX && this.position.y + distance === y;
                if (this.orientation === Orientation.W) return mismaX && this.position.y - distance === y;
                break;
            case "left":
                if (this.orientation === Orientation.N) return mismaY && this.position.x - distance === x;
                if (this.orientation === Orientation.S) return mismaY && this.position.x + distance === x;
                if (this.orientation === Orientation.E) return mismaX && this.position.y - distance === y;
                if (this.orientation === Orientation.W) return mismaX && this.position.y + distance === y;
                break;
        }

        return false;
    }

    //SISTEMA DE VIDA
    /**
     * Recibe daño
     */
    loseHealth(damage) {
        this.currentHP -= damage;
        if (this.currentHP < 0) this.currentHP = 0;
        
        // Si recibe daño, hay probabilidad de fugas
        if (Math.random() < 0.3) {
            this.hasLeaks = true;
            this.leakDamagePerTurn = 2;
        }
    }

    /**
     * Verifica si el submarino está hundido
     */
    isSunk() {
        return this.currentHP <= 0;
    }

    /**
     * Cura al submarino
     */
    heal(amount) {
        const oldHP = this.currentHP;
        this.currentHP = Math.min(this.currentHP + amount, this.maxHP);
        const actualHeal = this.currentHP - oldHP;
        
        // Las fugas se reparan
        if (this.hasLeaks) {
            this.hasLeaks = false;
            this.leakDamagePerTurn = 0;
            console.log("Fugas reparadas");
        }
        return actualHeal;
    }

    /**
     * Aplica daño por fugas al final del turno
     */
    applyLeakDamage() {
        if (this.hasLeaks) {
            this.loseHealth(this.leakDamagePerTurn);
        }
    }

    //SISTEMA DE ATAQUE AÉREO 
    /**
     * Verifica si el ataque aéreo está disponible
     */
    canUseAerialAttack() {
        return this.aerialCooldown <= 0;
    }

    /**
     * Usa el ataque aéreo y activa el cooldown
     */
    useAerialAttack() {
        if (this.canUseAerialAttack()) {
            this.aerialCooldown = this.maxAerialCooldown;
            return true;
        }
        return false;
    }

    /**
     * Reduce el cooldown del ataque aéreo
     */
    reduceCooldown(amount = 1) {
        this.aerialCooldown = Math.max(0, this.aerialCooldown - amount);
    }

    /**
     * Actualiza el cooldown al final del turno
     */
    updateCooldown() {
        if (this.aerialCooldown > 0) {
            this.aerialCooldown--;
        }
    }

    //SISTEMA DE INVENTARIO
    /**
     * Añade munición al inventario
     */
    addAmmunition(amount = 2) {
        this.mun1 += Math.floor(amount / 2);
        this.mun2 += Math.ceil(amount / 2);
    }

    /**
     * Añade un reductor de cooldown al inventario
     */
    addCooldownReducer(amount = 1) {
        this.inventory.cooldownReducers += amount;
    }

    /**
     * Usa un reductor de cooldown del inventario
     */
    useCooldownReducer() {
        if (this.inventory.cooldownReducers > 0) {
            this.inventory.cooldownReducers--;
            this.reduceCooldown(1);
            return true;
        }
        return false;
    }

    /**
     * Añade un limitador de movimiento al inventario
     */
    addMovementLimiter(amount = 1) {
        this.inventory.movementLimiters += amount;
    }

    /**
     * Usa un limitador de movimiento (debe aplicarse al enemigo)
     */
    useMovementLimiter(targetSubmarine) {
        if (this.inventory.movementLimiters > 0) {
            this.inventory.movementLimiters--;
            
            // Aplicar restricción al enemigo
            targetSubmarine.movementRestricted = true;
            targetSubmarine.restrictedTurnsRemaining = 1;
            
            // Elegir una dirección lateral aleatoria
            const randomLateral = Math.random() < 0.5 ? 'left' : 'right';
            targetSubmarine.allowedDirections = ['front', randomLateral];
            return true;
        }
        return false;
    }

    /**
     * Añade un kit de reparación al inventario
     */
    addRepairKit(amount = 1) {
        this.inventory.repairKits += amount;
        console.log(`Kits de reparación en inventario: ${this.inventory.repairKits}`);
    }

    /**
     * Usa un kit de reparación del inventario
     */
    useRepairKit(healAmount = 30) {
        if (this.inventory.repairKits <= 0) {
            console.log("No hay kits de reparación.");
            return false;
        }

        this.inventory.repairKits--;
        this.heal(healAmount);
        console.log(`Kit usado. Quedan ${this.inventory.repairKits} en inventario`);
        return true;
    }

    /**
     * Recoge un recurso (llamado por el ResourceManager)
     */
    collectResource(resource) {
        console.log(`Recogiendo recurso de tipo: ${resource.type}`);
        resource.applyEffect(this);
    }

    /**
     * Actualiza las restricciones de movimiento
     */
    updateMovementRestrictions() {
        if (this.movementRestricted) {
            this.restrictedTurnsRemaining--;
            if (this.restrictedTurnsRemaining <= 0) {
                this.movementRestricted = false;
                this.allowedDirections = ['front', 'left', 'right'];
            }
        }
    }

    //ACTUALIZACIÓN DE TURNO 
    /**
     * Método llamado al final de cada turno
     */
    endTurn() {
        this.updateCooldown();
        this.applyLeakDamage();
        this.updateMovementRestrictions();
    }
}