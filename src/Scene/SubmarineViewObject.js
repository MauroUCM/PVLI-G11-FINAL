
//TODO:
//Vincular las vistas con el tablero y el submarino de verdad, pasandole a esto como parametros

export default class SubmarineView extends Phaser.GameObjects.Container{
/**
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {SubmarineComplete} redSubmarine  - El submarino rojo
     * @param {SubmarineComplete} blueSubmarine - El submarino azul
     * @param {Number} x - Posición X del HUD
     * @param {Number} y - Posición Y del HUD
     * @param {String} playerName - Nombre del jugador ("Jugador 1" o "Jugador 2")
     * @param {LogicBoard} board - Tablero del juego
     */
    constructor(scene,x,y, board, redSubmarine, blueSubmarine){
        super(scene,x,y)

        this.scene = scene;
        this.active = true;

        // imagen de fondo
        this.imId = "SubWindow";

        // pantalla
        this.screenWidth = scene.cameras.main.width;   // 800
        this.screenHeight = scene.cameras.main.height - 100; // 600
        this.setSize(this.screenWidth,this.screenHeight);
      
        // pasaer referencias
        this.tablero = board;
        this.redSubmarine = redSubmarine;
        this.blueSubmarine = blueSubmarine;

        
        // Posiciones temporales de los submarinos (estas vendran del sistema de movimiento)
        // Los submarinos estan en vertices (coordenadas pares)
        this.submarine1 = {
            x: 2,  // posicion en el tablero logico
            y: 2,
            direction: 'north'  // north, south, east, west
        };
        
        this.submarine2 = {
            x: 2,  // posicion en el tablero logico
            y: 6,  // 2 casillas al sur del submarino 1
            direction: 'south'
        };
        
        this.initialize();

    }

    initialize(){

        const enemySub = this.tablero.submarines[this.tablero.submarines.currentTurn];
        const mySub = this.tablero.submarines.currentTurn === "red" ? this.tablero.submarines.blue : this.tablero.submarines.red;

        //Crear las ventanas del submarino con espacio para el resto de cosas
        this.createPlayerViews(0, 50, this.screenWidth, this.screenHeight);
    }


    createPlayerViews(x, y, width, height) {
        const viewWidth = width / 3;
        
       
        this.createSingleView(
            x,
            y,
            viewWidth,
            height
        );
        
        // VISTA FRONTAL (Centro)
        this.createSingleView(
            x + viewWidth,
            y,
            viewWidth,
            height
        );
        
        // VISTA LATERAL DERECHA
        this.createSingleView(
            x + (viewWidth * 2),
            y,
            viewWidth,
            height
        );
    }

    //Crear una ventanas
    createSingleView(x, y, width, height) {

      // Cargar imagen de fondo
        const waterBg = this.scene.add.image(
            x + width / 2,
            y + height / 2, 
            this.imId
        );
        this.add(waterBg);
       
        waterBg.setDisplaySize(width, height - 20); 
    }

    //Esto sirve de render
    renderView(x, y, width, height) {
        
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        let attacker = this.tablero.submarines[this.tablero.currentTurn];
    
        let target =null;
       if ( this.tablero.currentTurn == "red") target = this.redSubmarine
       else target = this.blueSubmarine;
        
        if (this.onDistance(attacker, target)){this.drawSubmarine(centerX, centerY, 1)}
      
        let enemyDistance = null;
        // Dibujar segun si hay enemigo o no
        if (enemyDistance !== null) {
            // HAY ENEMIGO - Dibujar submarino
            this.drawSubmarine(centerX, centerY, 1);
        } else {
            // NO HAY ENEMIGO - Solo agua
            this.drawWater(centerX, centerY);
        }
    }

    /**
     * Dibuja el submarino enemigo con tamano segun distancia
     */
    drawSubmarine(centerX, centerY, distance) {
        
    }

    

    /**
     * Obtiene las coordenadas de las casillas visibles
     */
    getVisibleCells(mySub, direction) {
        const cells = [];
        const dirVector = this.getDirectionVector(direction);
        
        // Calcular las 2 casillas visibles
        for (let depth = 1; depth <= 2; depth++) {
            cells.push({
                x: mySub.x + (dirVector.x * depth * 2),
                y: mySub.y + (dirVector.y * depth * 2)
            });
        }
        
        return cells;
    }

    /**
     * Verifica si el submarino enemigo esta en una casilla especifica
     */
    isEnemyInCell(enemySub, cell) {
        return enemySub.x === cell.x && enemySub.y === cell.y;
    }

    /**
     * Obtiene el vector de direccion
     */
    getDirectionVector(direction) {
        const vectors = {
            'north': { x: 0, y: -1 },
            'south': { x: 0, y: 1 },
            'east': { x: 1, y: 0 },
            'west': { x: -1, y: 0 }
        };
        return vectors[direction] || { x: 0, y: 0 };
    }

    /**
     * Obtiene la direccion izquierda
     */
    getLeftDirection(direction) {
        const left = {
            'north': 'west',
            'west': 'south',
            'south': 'east',
            'east': 'north'
        };
        return left[direction];
    }

    /**
     * Obtiene la direccion derecha
     */
    getRightDirection(direction) {
        const right = {
            'north': 'east',
            'east': 'south',
            'south': 'west',
            'west': 'north'
        };
        return right[direction];
    }

    onDistance(attacker, target)
    {
        //Calcula si los submarinos estan en rango de verse - usar isTargetDIr para pintar la vista en especifica 
        let isTarget1 = attacker.isTarget(target.position.x, target.position.y, 1)
        let isTarget2 = attacker.isTarget(target.position.x, target.position.y, 2)
        

        // let isTargetDir1 = isTarget1 && 
        //     attacker.isTargetDir(target.position.x, target.position.y, 1, direction) && 
        //     attacker.canShoot(distance);
            
        // let isTargetDir2 = isTarget2 && 
        //     attacker.isTargetDir(target.position.x, target.position.y, 2, direction) && 
        //     attacker.canShoot(distance);

        let debug = isTarget1 || isTarget2;
        console.log("ON_DISTANCE", debug)

        return isTarget1 || isTarget2;
    }

    // pintar sub segun la vista
    // reiniciar


}