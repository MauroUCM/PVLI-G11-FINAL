import { CooldownReducer } from "./CooldownReducer.js";
import { MovementLimiter } from "./MovementLimiter.js";
import { RepairKit } from "../Resources/RepairKit.js";
import { AmunitionExtra } from "../Resources/AmunitionExtra.js";

/**
 * Gestor de recursos del juego
 * Facilita la creación, distribución y gestión de recursos en el mapa
 */
export class ResourceManager_Complete {
    /**
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {GameBoard} board - El tablero de juego
     */
    constructor(scene, board) {
        this.scene = scene;
        this.board = board;
        this.resources = []; // Array de todos los recursos activos en el mapa
        this.resourceSprites = []; // Array de sprites visuales
        
        // Color dorado para los recursos
        this.resourceColor = 0xFFD700;
        
        // Tipos de recursos disponibles
        this.resourceTypes = {
            COOLDOWN_REDUCER: "cooldown_reducer",
            MOVEMENT_LIMITER: "movement_limiter",
            REPAIR_KIT: "repair_kit",
            AMMUNITION_EXTRA: "ammunition_extra"
        };
    }

    /**
     * Crea un recurso específico en una posición del mapa
     * @param {String} type - Tipo de recurso (usar resourceTypes)
     * @param {Number} x - Posición X en el tablero lógico
     * @param {Number} y - Posición Y en el tablero lógico
     * @returns {Resource} El recurso creado
     */
    createResource(type, x, y) {
        let resource = null;

        switch(type) {
            case this.resourceTypes.COOLDOWN_REDUCER:
                resource = new CooldownReducer(this.scene, x, y, "Resource");
                break;
            
            case this.resourceTypes.MOVEMENT_LIMITER:
                resource = new MovementLimiter(this.scene, x, y, "Resource");
                break;
            
            case this.resourceTypes.REPAIR_KIT:
                resource = new RepairKit(this.scene, x, y, "Resource", 30);
                break;
            
            case this.resourceTypes.AMMUNITION_EXTRA:
                resource = new AmunitionExtra(this.scene, x, y, "Resource", 4);
                break;
            
            default:
                console.error(`Tipo de recurso desconocido: ${type}`);
                return null;
        }

        if (resource) {
            this.resources.push(resource);
            this.createResourceSprite(resource, x, y);
            console.log(`Recurso ${type} creado en (${x}, ${y})`);
        }

        return resource;
    }

    /**
     * Crea el sprite visual del recurso
     * @param {Resource} resource - El recurso lógico
     * @param {Number} x - Posición X
     * @param {Number} y - Posición Y
     */
    createResourceSprite(resource, x, y) {
        const cellSize = this.board.config.cellSize;
        
        // Crear un círculo dorado para representar el recurso
        const sprite = this.scene.add.circle(
            x * cellSize,
            y * cellSize,
            cellSize * 0.3,
            this.resourceColor,
            1
        );
        
        // Añadir al container del board
        this.board.add(sprite);
        
        // Efecto de brillo/pulsación
        this.scene.tweens.add({
            targets: sprite,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Guardar referencia
        this.resourceSprites.push({
            sprite: sprite,
            resource: resource
        });
        
        sprite.setDepth(50); // Por encima del tablero pero debajo de los submarinos
    }

    /**
     * Crea un recurso aleatorio en una posición del mapa
     * @param {Number} x - Posición X en el tablero lógico
     * @param {Number} y - Posición Y en el tablero lógico
     * @returns {Resource} El recurso creado
     */
    createRandomResource(x, y) {
        const types = Object.values(this.resourceTypes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        return this.createResource(randomType, x, y);
    }

    /**
     * Distribuye recursos de forma aleatoria en el mapa
     * @param {Number} count - Cantidad de recursos a distribuir
     */
    distributeRandomResources(count) {
        const availablePositions = this.getAvailablePositions();
        
        if (availablePositions.length < count) {
            console.warn(`No hay suficientes posiciones disponibles. Solicitados: ${count}, Disponibles: ${availablePositions.length}`);
            count = availablePositions.length;
        }

        // Mezclar posiciones aleatoriamente
        this.shuffleArray(availablePositions);

        // Crear recursos en las primeras 'count' posiciones
        for (let i = 0; i < count; i++) {
            const pos = availablePositions[i];
            this.createRandomResource(pos.x, pos.y);
        }

        console.log(`${count} recursos distribuidos aleatoriamente en el mapa`);
    }

    /**
     * Distribuye una cantidad específica de cada tipo de recurso
     * @param {Object} distribution - Objeto con la cantidad de cada tipo
     * Ejemplo: { cooldown_reducer: 2, repair_kit: 3, movement_limiter: 1, ammunition_extra: 2 }
     */
    distributeResourcesByType(distribution) {
        const availablePositions = this.getAvailablePositions();
        let positionIndex = 0;

        // Mezclar posiciones aleatoriamente
        this.shuffleArray(availablePositions);

        for (const [type, count] of Object.entries(distribution)) {
            for (let i = 0; i < count; i++) {
                if (positionIndex >= availablePositions.length) {
                    console.warn("No hay más posiciones disponibles para recursos");
                    return;
                }

                const pos = availablePositions[positionIndex];
                this.createResource(type, pos.x, pos.y);
                positionIndex++;
            }
        }

        console.log("Recursos distribuidos por tipo en el mapa");
    }

    /**
     * Obtiene todas las posiciones válidas para colocar recursos
     * @returns {Array} Array de objetos {x, y} con posiciones disponibles
     */
    getAvailablePositions() {
        const positions = [];
        const matrix = this.board.matrix.logic.matrix;

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                // Los recursos se colocan en vértices (posiciones pares)
                if (i % 2 === 0 && j % 2 === 0) {
                    // Verificar que no esté ocupado
                    if (this.isPositionAvailable(i, j)) {
                        positions.push({ x: i, y: j });
                    }
                }
            }
        }

        return positions;
    }

    /**
     * Verifica si una posición está disponible para colocar un recurso
     * @param {Number} x - Coordenada X
     * @param {Number} y - Coordenada Y
     * @returns {Boolean} true si está disponible
     */
    isPositionAvailable(x, y) {
        // Verificar que no haya otro recurso
        const hasResource = this.resources.some(resource => 
            resource.position.x === x && resource.position.y === y && resource.isAvailable()
        );
        
        if (hasResource) return false;
        
        // Verificar que no sea la posición inicial de los submarinos
        const sub1Pos = this.board.submarines.blue.position;
        const sub2Pos = this.board.submarines.red.position;
        
        if ((sub1Pos.x === x && sub1Pos.y === y) || (sub2Pos.x === x && sub2Pos.y === y)) {
            return false;
        }
        
        return true;
    }

    /**
     * Verifica si hay un recurso en una posición específica
     * @param {Number} x - Coordenada X
     * @param {Number} y - Coordenada Y
     * @returns {Resource|null} El recurso en esa posición o null
     */
    getResourceAt(x, y) {
        return this.resources.find(resource => 
            resource.isAtPosition(x, y)
        ) || null;
    }

    /**
     * Intenta recoger un recurso en una posición específica
     * @param {Number} x - Coordenada X
     * @param {Number} y - Coordenada Y
     * @param {SubmarineComplete} submarine - El submarino que recoge el recurso
     * @returns {Boolean} true si se recogió un recurso
     */
    collectResourceAt(x, y, submarine) {
        const resource = this.getResourceAt(x, y);
        
        if (resource) {
            console.log(`Recogiendo recurso en (${x}, ${y})`);
            
            // Aplicar efecto del recurso
            resource.collect(submarine);
            
            // Ocultar el sprite del recurso
            this.hideResourceSprite(resource);
            
            // Efecto visual de recolección
            this.createCollectionEffect(x, y);

            return true;
        }
        
        return false;
    }

    /**
     * Oculta el sprite de un recurso recogido
     * @param {Resource} resource - El recurso recogido
     */
    hideResourceSprite(resource) {
        const spriteData = this.resourceSprites.find(data => data.resource === resource);
        
        if (spriteData) {
            // Animación de desaparición
            this.scene.tweens.add({
                targets: spriteData.sprite,
                scale: 0,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    spriteData.sprite.destroy();
                }
            });
        }
    }

    /**
     * Crea un efecto visual cuando se recoge un recurso
     * @param {Number} x - Posición X
     * @param {Number} y - Posición Y
     */
    createCollectionEffect(x, y) {
        const cellSize = this.board.config.cellSize;
        
        // Crear círculo expansivo
        const effect = this.scene.add.circle(
            x * cellSize,
            y * cellSize,
            cellSize * 0.2,
            0xFFFFFF,
            0.8
        );
        
        this.board.add(effect);
        effect.setDepth(60);
        
        // Animación de expansión y desvanecimiento
        this.scene.tweens.add({
            targets: effect,
            scale: 3,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    /**
     * Verifica y recoge recursos para un submarino después de moverse
     * @param {SubmarineComplete} submarine - El submarino que se movió
     */
    checkAndCollectResource(submarine) {
        const x = submarine.position.x;
        const y = submarine.position.y;
        
        this.collectResourceAt(x, y, submarine);
    }

    /**
     * Obtiene todos los recursos disponibles (no recogidos)
     * @returns {Array} Array de recursos disponibles
     */
    getAvailableResources() {
        return this.resources.filter(resource => resource.isAvailable());
    }

    /**
     * Elimina todos los recursos recogidos de la lista
     */
    cleanupCollectedResources() {
        this.resources = this.resources.filter(resource => resource.isAvailable());
        this.resourceSprites = this.resourceSprites.filter(data => data.resource.isAvailable());
    }

    /**
     * Mezcla un array aleatoriamente (algoritmo Fisher-Yates)
     * @param {Array} array - Array a mezclar
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Limpia todos los recursos del gestor
     */
    clear() {
        this.resources.forEach(resource => resource.destroy());
        this.resourceSprites.forEach(data => data.sprite.destroy());
        this.resources = [];
        this.resourceSprites = [];
    }

    /**
     * Actualiza la visualización de recursos (llamar en update)
     */
    update() {
        // Por si necesitamos animaciones adicionales
    }
}