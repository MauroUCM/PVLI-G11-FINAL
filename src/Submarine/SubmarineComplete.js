import { Position } from "../Board/Position.js";
import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";

// TODO
// - al crear submarino hacer "enter" a la casilla

/**
 * Orientaciones del submarino
 */
export const Orientation = Object.freeze({
    N: 0,
    E: 90,
    S: 180,
    W: 270,

    getAvailableDirection(direction) {
        return [direction, (direction + 90) % 360, (direction - 90) % 360];
    }
});

/**
 * Submarine_Complete
 * ---------------------------
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

        console.log("Submarine created at", this.position);

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

        EventDispatch.on(Event.GET_SUBMARINE,(name,callback)=>{
            if(this.name == name){
                callback.callBack(this);
            }
        })
    }

    // ========== GETTERS ==========
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
        // this.positionReferenceCheck();
    }

    //MOVIMIENTO
    setNewPosition(newX, newY) {
        const cellSize = this.container.config.cellSize;
        this.position.x = newX;
        this.position.y = newY;
        this.setPosition(this.position.x * cellSize, this.position.y * cellSize);
        this.setAngle(this.orientation -90); 

        console.log("submarino recolocado en X:" + newX + " Y:" + newY);
    }

    canMoveTo(newX, newY) {
        if(this.board.matrix[newX][newY].submarine != null){
            console.log("No se puede mover a esa direccion!")
            return false;   
        }

        else return (
            newX >= 0 &&
            newY >= 0 &&
            newX <= this.board.matrix.length - 1 &&
            newY <= this.board.matrix[0].length - 1
        );
    }

    moveFront() {
        if (this.movementRestricted && !this.allowedDirections.includes('front')) {
            console.log("Movimiento frontal bloqueado por Movement Limiter");
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

    moveRight() {
        if (this.movementRestricted && !this.allowedDirections.includes('right')) {
            console.log("Movimiento derecho bloqueado por Movement Limiter");
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

    moveLeft() {
        if (this.movementRestricted && !this.allowedDirections.includes('left')) {
            console.log("Movimiento izquierdo bloqueado por Movement Limiter");
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
                console.log("Disparo corta distancia. Munición restante:", this.mun1);
                return true;
            } else {
                console.log("No hay munición de corta distancia");
                return false;
            }
        }
        if (distance === 2) {
            if (this.canShoot(distance)) {
                this.mun2 -= 1;
                console.log("Disparo larga distancia. Munición restante:", this.mun2);
                return true;
            } else {
                console.log("No hay munición de larga distancia");
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
        console.log(`Submarino recibió ${damage} de daño. Vida restante: ${this.currentHP}`);
        
        // Si recibe daño, hay probabilidad de fugas
        if (Math.random() < 0.3) {
            this.hasLeaks = true;
            this.leakDamagePerTurn = 2;
            console.log("¡El submarino tiene fugas!");
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
        
        console.log(`Curando +${actualHeal}. Vida actual: ${this.currentHP}`);
        return actualHeal;
    }

    /**
     * Aplica daño por fugas al final del turno
     */
    applyLeakDamage() {
        if (this.hasLeaks) {
            this.loseHealth(this.leakDamagePerTurn);
            console.log(`Daño por fugas: -${this.leakDamagePerTurn} HP`);
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
            console.log("Ataque aéreo usado. Cooldown:", this.aerialCooldown);
            return true;
        }
        console.log("Ataque aéreo en cooldown:", this.aerialCooldown);
        return false;
    }

    /**
     * Reduce el cooldown del ataque aéreo
     */
    reduceCooldown(amount = 1) {
        this.aerialCooldown = Math.max(0, this.aerialCooldown - amount);
        console.log(`Cooldown reducido. Nuevo cooldown: ${this.aerialCooldown}`);
    }

    /**
     * Actualiza el cooldown al final del turno
     */
    updateCooldown() {
        if (this.aerialCooldown > 0) {
            this.aerialCooldown--;
            console.log("Cooldown actualizado:", this.aerialCooldown);
        }
    }

    //SISTEMA DE INVENTARIO
    /**
     * Añade munición al inventario
     */
    addAmmunition(amount = 2) {
        this.mun1 += Math.floor(amount / 2);
        this.mun2 += Math.ceil(amount / 2);
        console.log(`Munición añadida. Corta: ${this.mun1}, Larga: ${this.mun2}`);
    }

    /**
     * Añade un reductor de cooldown al inventario
     */
    addCooldownReducer(amount = 1) {
        this.inventory.cooldownReducers += amount;
        console.log(`Reductores de cooldown en inventario: ${this.inventory.cooldownReducers}`);
    }

    /**
     * Usa un reductor de cooldown del inventario
     */
    useCooldownReducer() {
        if (this.inventory.cooldownReducers > 0) {
            this.inventory.cooldownReducers--;
            this.reduceCooldown(1);
            console.log(`Reductor usado. Quedan ${this.inventory.cooldownReducers} en inventario`);
            return true;
        }
        console.log("No hay reductores de cooldown en el inventario");
        return false;
    }

    /**
     * Añade un limitador de movimiento al inventario
     */
    addMovementLimiter(amount = 1) {
        this.inventory.movementLimiters += amount;
        console.log(`Limitadores de movimiento en inventario: ${this.inventory.movementLimiters}`);
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
            
            console.log(`Limitador usado en enemigo. Quedan ${this.inventory.movementLimiters} en inventario`);
            console.log(`Enemigo solo puede moverse: ${targetSubmarine.allowedDirections.join(', ')}`);
            return true;
        }
        console.log("No hay limitadores de movimiento en el inventario");
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
                console.log("Restricciones de movimiento eliminadas");
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

    //UTILIDADES
    /**
     * Muestra el estado del inventario
     */
    showInventory() {
        console.log("=== Inventario del Submarino ===");
        console.log(`Reductores cooldown: ${this.inventory.cooldownReducers}`);
        console.log(`Limitadores movimiento: ${this.inventory.movementLimiters}`);
        console.log(`Kits reparación: ${this.inventory.repairKits}`);
        console.log(`Munición corta: ${this.mun1}`);
        console.log(`Munición larga: ${this.mun2}`);
        console.log("===============================");
    }

    /**
     * Muestra el estado completo del submarino
     */
    showStatus() {
        console.log("=== Estado del Submarino ===");
        console.log(`Posición: (${this.X}, ${this.Y})`);
        console.log(`Orientación: ${this.orientation}°`);
        console.log(`Vida: ${this.currentHP}/${this.maxHP}`);
        console.log(`Fugas: ${this.hasLeaks ? 'SÍ' : 'NO'}`);
        console.log(`Cooldown aéreo: ${this.aerialCooldown}`);
        console.log(`Movimiento restringido: ${this.movementRestricted ? 'SÍ' : 'NO'}`);
        this.showInventory();
        console.log("===========================");
    }

    // Métodos para debug
    positionReferenceCheck() {
        console.log(
            `Position has correct reference: ${this.position === this.board.matrix[this.X][this.Y].position}`
        );
    }
}