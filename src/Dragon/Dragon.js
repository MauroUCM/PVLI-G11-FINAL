/**
 * Orientaciones del dragon
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
 * Dragon
 * ---------------------------
 * Clase completa del dragon que integra:
 *  - Movimiento y orientación
 */
export class SubmarineComplete extends Phaser.GameObjects.Image {
    /**
     * @param {Phaser.Scene} scene - Escena donde se dibuja el submarino
     * @param {Number} x - Coordenada X inicial en la matriz del tablero
     * @param {Number} y - Coordenada Y inicial en la matriz del tablero
     * @param {LogicBoard} board - Tablero del juego
     * @param {Phaser.GameObjects.Container} container - Contenedor del tablero
     */
    constructor(scene, x, y, board, container) {
        super(scene, 100, 100, "Dragon", 0);

        // Referencias externas
        this.container = container;
        this.board = board;

        // Posición en la matriz del tablero
        this.position = this.board.matrix[x * 2][y * 2].position;

        // Orientación inicial
        this.orientation = Orientation.E;

        // Restricciones de movimiento (por Movement Limiter)
        this.movementRestricted = false;
        this.restrictedTurnsRemaining = 0;
        this.allowedDirections = ['front', 'left', 'right'];

        // Configuración visual
        this.texture = "Dragon";
        container.add(this);
        this.setScale(0.1);
        this.setOrigin(0.5, 0.5);
        this.updateSprite();

        console.log("Dragon created at", this.position);
    }

    // ========== GETTERS ==========
    get X() {
        return this.position.x;
    }

    get Y() {
        return this.position.y;
    }


    // ========== ACTUALIZACIÓN VISUAL ==========
    updateSprite() {
        const cellSize = this.container.data.cellSize;
        this.setPosition(this.position.x * cellSize, this.position.y * cellSize);
        this.setAngle(this.orientation -90); 
        this.positionReferenceCheck();
    }

    // ========== MOVIMIENTO ==========
    canMoveTo(newX, newY) {
        return (
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
            this.position = this.board.matrix[newX][newY].position;
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
            this.position = this.board.matrix[newX][newY].position;
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
            this.position = this.board.matrix[newX][newY].position;
            this.orientation = newDirection;
            this.updateSprite();
            console.log("Moviéndose a", this.position);
            return true;
        } else {
            console.log("Fuera del tablero.");
            return false;
        }
    }
}