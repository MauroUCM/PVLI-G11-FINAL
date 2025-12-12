import LogicBoard from "../Board/LogicBoard.js"
import { GraphicVertex } from "../Board/GraphicVertex.js";
import { GraphicSquare } from "../Board/GraphicSquare.js";
import EventDispatch from "../Event/EventDispatch.js"
import { Orientation, SubmarineComplete} from "../Submarine/SubmarineComplete.js";
import Event from "../Event/Event.js";
import { ResourceManager_Complete } from "../Resources/ResourceManager.js";
import { SubmarineHUD } from "../Submarine/SubmarineHUD.js";
import { Dragon } from "../Dragon/Dragon.js";
import { ExitZoneSystem } from "../Systems/ExitZoneSystem.js";
import { ZoneClosingSystem } from "../Systems/ZoneClosingSystem.js";
import config from "./config.json" with {type:"json"}

/**
 * GameBoard - Sistema Central del Tablero de Juego
 * ==================================================
 * 
 * DESCRIPCIÓN:
 * Clase principal que coordina todos los elementos del juego en el tablero.
 * Gestiona la matriz lógica y gráfica, los submarinos, recursos, zonas de salida,
 * el dragón NPC y el sistema de cierre progresivo del mapa.
 * 
 * ESTRUCTURA DEL TABLERO:
 * - Matriz dual: lógica (datos) + gráfica (visual)
 * - Vértices (posiciones pares): donde se mueven los submarinos
 * - Casillas (posiciones impares): donde aparece el dragón
 * - Dimensiones configurables desde config.json
 * 
 * SISTEMAS GESTIONADOS:
 * 1. ResourceManager: Genera y gestiona recursos recogibles
 * 2. ExitZoneSystem: Crea y gestiona zonas de escape
 * 3. ZoneClosingSystem: Reduce el mapa progresivamente
 * 4. Dragon: NPC que se mueve aleatoriamente
 * 5. HUDs: Interfaces de cada jugador
 * 6. Turnos: Control del flujo de juego
 * 
 * EVENTOS ESCUCHADOS:
 * - GET_GAMEBOARD: Proporciona referencia al tablero
 * - END_TURN: Finaliza el turno actual
 * - UPDATE_MAP: Actualiza renderizado
 * 
 * @extends Phaser.GameObjects.Container
 */
export default class GameBoard extends Phaser.GameObjects.Container {
     /**
     * Crea una nueva instancia del tablero de juego
     * 
     * PROCESO DE INICIALIZACIÓN:
     * 1. Crea matriz lógica y gráfica
     * 2. Instancia submarinos en posiciones iniciales
     * 3. Genera zonas de salida
     * 4. Crea dragón NPC
     * 5. Distribuye recursos aleatorios
     * 6. Crea HUDs para ambos jugadores
     * 7. Inicializa sistema de cierre de zona
     * 8. Configura eventos del sistema
     * 
     * @param {Phaser.Scene} scene - La escena de Phaser donde se renderiza
     * @param {Array.<string>} texture - Array de texturas (actualmente no usado)
     * 
     * @example
     * // En GameScreen.js:
     * this.tablero = new GameBoard(this);
     */
    constructor(scene,texture) {
         // Posicionar el container en coordenadas del config
        super(scene, config.x, config.y);

        // REFERENCIAS BÁSICAS
        this.scene = scene;
        this.active = true; // Controla si el tablero es visible
        
        this.texture = texture

          // Graphics para dibujar elementos (líneas, círculos, etc)
        this.GRAPHIC = scene.add.graphics({ lineStyle: { width: 1, color: 0x00ff00 } });
        this.add(this.GRAPHIC)

         // Tecla para toggle de visibilidad (debug)
        this.toggleKey = this.scene.input.keyboard.addKey('N');

         // Configuración del tablero (desde JSON)
        this.config = config;

        
        // MATRIZ LÓGICA Y GRÁFICA 
        /**
         * Matriz dual que contiene:
         * - logic: LogicBoard con Vertices y Squares (datos)
         * - graphic: Array con GraphicVertex y GraphicSquare (visual)
         * 
         * DIMENSIONES:
         * - Ancho/Alto real = (config.width/height * 2) - 1
         * - Ejemplo: config 5x5 → matriz 9x9
         * - Vértices en posiciones pares (0,0), (2,2), etc.
         * - Casillas en posiciones impares (1,1), (3,3), etc.
         */
        this.matrix = {
            logic: new LogicBoard(config.boardWidth*2-1, config.boardHeight*2-1),
            graphic: null
        }

           // Inicializar representación gráfica
        this.matrix.graphic = this.graphicMatrixInitialize(config.boardWidth*2-1, config.boardHeight*2-1, this.matrix.logic)

       
        // SUBMARINOS
        /**
         * Submarinos de ambos jugadores
         * - blue: Japón (jugador 2) - spawn inferior derecha
         * - red: China (jugador 1) - spawn superior izquierda
         */
        this.submarines = {
            blue: new SubmarineComplete(scene, 4, 3, this.matrix.logic, this,"blue",2),   
            red:  new SubmarineComplete(scene, 1, 5, this.matrix.logic, this,"red",1)  
        };

        this.submarines.red.orientation = Orientation.W;

        this.exitZoneSystem = new ExitZoneSystem(this);
        this.exitZones = this.exitZoneSystem.createExitZones();

         // DRAGÓN NPC 
        /**
         * Dragón que se mueve aleatoriamente por las casillas
         * - Aparece en casillas (posiciones impares)
         * - Se mueve cada ronda
         * - Activa minijuegos cuando está cerca de submarinos
         */
        this.dragon = new Dragon(this,true);// true = spawn aleatorio

        //CONFIGURACIÓN VISUAL DE SUBMARINOS 
        // Aplicar colores distintivos
        this.submarines.blue.setTint(0x00aaff); // Azul brillante
        this.submarines.red.setTint(0xff4444); // Rojo

        // Asegurar visibilidad y depth correcto
        this.submarines.blue.setAlpha(1);
        this.submarines.red.setAlpha(1);
        this.submarines.blue.setDepth(100);   // Por encima del tablero
        this.submarines.red.setDepth(100);

        this.submarines.blue.setVisible(false);
        this.submarines.red.setVisible(false);

        this.submarines.blue.active = false;
        this.submarines.red.active = false;

          // FONDO 
        this.initializeBackground(config.x, config.y, "BG");

        // SISTEMA DE RECURSOS
        /**
         * ResourceManager gestiona:
         * - Aparición de recursos en el mapa
         * - Recolección automática al pasar por encima
         * - Tipos: munición, kits de reparación, reductores de cooldown, limitadores de movimiento
         */
        this.resourceManager = new ResourceManager_Complete(scene, this);
        
        // Distribuir recursos en el mapa (8 recursos aleatorios)
        this.resourceManager.distributeRandomResources(8);

        
        // SISTEMA DE HUDs
        /**
         * HUDs para ambos jugadores
         * Muestran:
         * - Vida actual/máxima
         * - Munición (corta y larga distancia)
         * - Cooldown de ataque aéreo
         * - Inventario de recursos
         * - Estado (fugas, restricciones de movimiento)
         */
        this.huds = {
            blue: new SubmarineHUD(
                scene, 
                this.submarines.blue, 
                530, 425,              // Posición en pantalla
                "Japon"                // Nombre del jugador
            ),
            red: new SubmarineHUD(
                scene, 
                this.submarines.red, 
                530, 425, 
                "China"
            )
        };

         // SISTEMA DE CIERRE DE ZONA 
        /**
         * ZoneClosingSystem implementa el cierre progresivo del mapa:
         * - Comienza en turno 15 (configurable)
         * - Warning 3 turnos antes
         * - Cierra un anillo exterior cada 3 turnos
         * - Tamaño mínimo: 4x4
         * - Daño por turno si estás en zona cerrada: 25 HP
         */
        this.zoneClosing = new ZoneClosingSystem(this);

        
        // CONTROL DE TURNOS 
        /**
         * Turno actual del juego
         * Valores posibles: "red" o "blue"
         * El rojo (China) siempre empieza
         */
        this.currentTurn = "red"; 

        // Configurar eventos
        this.setupEvents();

        //renderizado inicial
        this.render();

        //añadir a la escena
        scene.add.existing(this);
    }

      /**
     * Configura los event listeners del tablero
     * 
     * EVENTOS REGISTRADOS:
     * 1. GET_GAMEBOARD: Callback para obtener referencia al tablero
     * 2. END_TURN: Finaliza el turno actual y actualiza estado
     * 3. UPDATE_MAP: Fuerza re-renderizado del mapa
     */
    setupEvents() {

        this.toggleKey.on("down",()=>{
            this.refresh();
        }) 

        // Proporcionar referencia al tablero cuando se solicita
        EventDispatch.on(Event.GET_GAMEBOARD,(callback)=>{
            callback.boardCallback(this);
        })

        // Manejar fin de turno
        EventDispatch.on(Event.END_TURN,()=>{
            this.endTurn();
        })

        // Forzar actualización del mapa
        EventDispatch.on(Event.UPDATE_MAP,()=>{
            this.render();
        }) 
    }

    /**
     * Renderiza todos los elementos gráficos del tablero
     * 
     * PROCESO:
     * 1. Recorre la matriz gráfica
     * 2. Llama a render() de cada GraphicSquare y GraphicVertex
     * 3. Actualiza visibilidad de HUDs según turno
     * 
     * ELEMENTOS RENDERIZADOS:
     * - Vértices (puntos donde se mueven submarinos)
     * - Casillas (donde aparece el dragón)
     * - HUD del jugador actual
     * 
     * Se llama automáticamente cuando:
     * - Se actualiza el mapa (Event.UPDATE_MAP)
     * - Cambia el turno
     * - Se construye el tablero
     */
    render() {
        // Solo renderizar si el tablero está activo
        if (this.active) {
            // Recorrer matriz gráfica
            this.matrix.graphic.forEach((row) => {
                row.forEach(point => {
                    // Renderizar casillas (donde va el dragón)
                    if (point instanceof GraphicSquare) {
                        point.render();
                    }
                     // Renderizar vértices (donde van los submarinos)
                    if (point instanceof GraphicVertex) {
                        point.render();
                    }
                })
            })
        }

        // Actualizar visibilidad de HUDs
        this.swapHUDS();
        
    }

     /**
     * Inicializa la matriz gráfica basándose en la matriz lógica
     * 
     * FUNCIONAMIENTO:
     * - Crea GraphicVertex para posiciones pares (vértices)
     * - Crea GraphicSquare para posiciones impares (casillas)
     * - Deja null en posiciones que no son ni vértice ni casilla
     * 
     * PATRÓN DE LA MATRIZ:
     * ```
     * V - V - V    V = Vértice (submarine)
     * | S | S |    S = Square (dragón)
     * V - V - V    - = null
     * | S | S |
     * V - V - V
     * ```
     * 
     * @param {Number} boardWidth - Ancho de la matriz (incluye posiciones null)
     * @param {Number} boardHeight - Alto de la matriz (incluye posiciones null)
     * @param {LogicBoard} logic - Tablero lógico de referencia
     * @returns {Array.<Array>} Matriz 2D con GraphicVertex, GraphicSquare y null
     */
    graphicMatrixInitialize(boardWidth, boardHeight, logic) {
        let aux = []
         // Iterar por cada posición de la matriz
        for (let i = 0; i < boardWidth; ++i) {
            aux[i] = [];
            for (let j = 0; j < boardHeight; ++j) {
                // Crear el elemento gráfico correspondiente
                this.createGraphicPoint(aux, i, j, logic);
            }
        }
        return aux;
    }

    /**
    * Inicializa el fondo visual del tablero
    * 
    * CARACTERÍSTICAS:
    * - Imagen semitransparente (alpha: 0.2)
    * - Centrada en el tablero
    * - Escala adaptada a las dimensiones del tablero
    * - Se coloca en el fondo (moveDown)
    * 
    * @param {Number} x - Posición X del tablero
    * @param {Number} y - Posición Y del tablero
    * @param {String} image - Key de la imagen precargada
    */
    initializeBackground(x, y, image) {
        // Calcular centro del tablero
        let centerX = (((this.config.boardWidth*2-2) ) * this.config.cellSize) / 2
        let centerY = (((this.config.boardHeight*2-2) ) * this.config.cellSize) / 2  

        // Crear imagen de fondo
        this.background_image = new Phaser.GameObjects.Image(this.scene, 0, 0, image);
        this.background_image.setPosition(centerX, centerY)

        // Escalar al tamaño del tablero
        let width = ((this.config.boardWidth*2 -2) * this.config.cellSize);
        let height = ((this.config.boardHeight*2 -2) * this.config.cellSize);
        this.background_image.setDisplaySize(width, height)

        // Configurar visibilidad
        this.scene.add.existing(this.background_image);
        this.background_image.setAlpha(0.2);

        // Añadir al container y mover al fondo
        this.add(this.background_image)
        this.moveDown(this.background_image)
    }

    /**
    * Crea un elemento gráfico en una posición específica de la matriz
    * 
    * LÓGICA DE CREACIÓN:
    * - (i par, j par) → GraphicVertex (donde se mueven submarinos)
    * - (i impar, j impar) → GraphicSquare (donde se mueve el dragón)
    * - Cualquier otra combinación → null (espacio vacío)
    * 
    * @param {Array.<Array>} m - Matriz donde se insertará el elemento
    * @param {Number} i - Índice X en la matriz
    * @param {Number} j - Índice Y en la matriz
    * @param {LogicBoard} logic - Referencia al tablero lógico
    */
    createGraphicPoint(m, i, j, logic) {
         // Vértice: coordenadas pares
        if ((i % 2 === 0) && (j % 2 === 0)) {
            m[i][j] = new GraphicVertex(this.scene, this.GRAPHIC, this.config.cellSize, logic.matrix[i][j], this.config.x, this.config.y);
        }
        // Casilla: coordenadas impares
        else if ((i % 2 === 1) && (j % 2 === 1)) {
            m[i][j] = new GraphicSquare(this.scene, logic.matrix[i][j], "Square", this.config.cellSize, this.config.x, this.config.y);
            this.add(m[i][j]) // Añadir al container
        }
        // Espacio vacío
        else {
            m[i][j] = null;
        }
    }

    /**
    * Alterna la visibilidad del tablero
    * 
    * USO:
    * - Útil para debug
    * - Permite ver elementos detrás del tablero
    * - Se activa con la tecla 'M'
    */
    refresh() {
        this.submarines.red.active = !this.submarines.red.active;
        this.submarines.blue.active = !this.submarines.blue.active;
        if (this.submarines.red.active) {
            this.submarines.red.setVisible(true);
        }
        else this.submarines.red.setVisible(false);
         if (this.submarines.blue.active) {
            this.submarines.blue.setVisible(true);
        }
        else this.submarines.blue.setVisible(false);
         
        this.render()
    }

    /**
    * Verifica si el tablero está activo (visible)
    * 
    * @returns {Boolean} true si el tablero es visible y activo
    */
    isActive(){
        return this.active;
    }

    /**
    * Alterna la visibilidad de los HUDs según el turno actual
    * 
    * COMPORTAMIENTO:
    * - Turno rojo: Muestra HUD rojo, oculta HUD azul
    * - Turno azul: Muestra HUD azul, oculta HUD rojo
    * 
    * Esto evita confusión visual y mantiene la interfaz limpia.
    */
    swapHUDS() {
    
        if (this.currentTurn === "red") {
            this.huds.blue.container.setVisible(false);
            this.huds.red.container.setVisible(true);
        } else if (this.currentTurn === "blue") {
          this.huds.red.container.setVisible(false);
          this.huds.blue.container.setVisible(true);
        }
    }

    /**
     * Finaliza el turno del jugador actual
     * 
     * PROCESO:
     * 1. Obtiene el submarino del turno actual
     * 2. Aplica efectos de fin de turno:
     *    - Actualiza cooldowns
     *    - Aplica daño por fugas
     *    - Actualiza restricciones de movimiento
     * 3. Actualiza el HUD del jugador
     * 4. Cambia al siguiente jugador
     * 5. Actualiza visibilidad de HUDs
     * 
     * NOTA:
     * Este método es llamado automáticamente por el Event.END_TURN
     * cuando PlayerActionMachine finaliza todas las acciones del turno.
     */
    endTurn() {
        // Obtener submarino del turno actual
        const currentSubmarine = this.submarines[this.currentTurn];
        
        // Aplicar efectos de fin de turno
        currentSubmarine.endTurn();
        
        // Actualizar HUD
        this.huds[this.currentTurn].update();
        
        // Cambiar turno
        this.currentTurn = this.currentTurn === "red" ? "blue" : "red";
        console.log(`Turno de: ${this.currentTurn}`);

        // Actualizar visibilidad de HUDs
        this.swapHUDS();
    }
    
    /**
     * Actualiza el estado del tablero cada frame
     * 
     * TAREAS:
     * - Actualiza HUDs de ambos jugadores
     * - Actualiza visibilidad según turno
     * - Actualiza sistema de recursos
     * 
     * NOTA:
     * Este método debe ser llamado desde GameScreen.update()
     * para mantener la interfaz sincronizada.
     */
    update() {
        // Actualizar HUDs
        this.huds.blue.update();
        this.huds.red.update();
        this.swapHUDS();
        
        // Actualizar recursos
        this.resourceManager.update();
    }

    /**
     * Getter para el submarino del jugador 1 (rojo/China)
     * 
     * @returns {SubmarineComplete} Submarino rojo
     */
    get player1(){
        return this.submarines.red;
    }

    /**
     * Getter para el submarino del jugador 2 (azul/Japón)
     * 
     * @returns {SubmarineComplete} Submarino azul
     */
    get player2(){
        return this.submarines.blue;
    }

    onRange()
    {
         //Logica del disparo (traslado tal cual de lo que habia en GameBoard)

         const attacker = this.submarines[this.currentTurn];
         const target = this.currentTurn === "red" ? this.submarines.blue : this.submarines.red;
 
 
         let isTarget1 = attacker.isTarget(target.position.x, target.position.y, 1)
         let isTarget2 = attacker.isTarget(target.position.x, target.position.y, 2)
 
        
 
         let isTargetDir1 = isTarget1 && 
             attacker.isTargetDir(target.position.x, target.position.y, 1, direction) && 
             attacker.canShoot(distance);
             
         let isTargetDir2 = isTarget2 && 
             attacker.isTargetDir(target.position.x, target.position.y, 2, direction) && 
             attacker.canShoot(distance);
        
         return isTargetDir1 && isTargetDir2;
    }
   
}

