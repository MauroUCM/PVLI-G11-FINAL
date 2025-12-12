/**
 * FireStateWindow
 * 
 *   Escena PopUp para seleccionar distancia de disparo
 * 
 *    CORRECCIÓN: Ahora usa el sistema unificado de estilos (UIStyles.js)
 *    y tiene soporte completo de teclado + ratón
 * 
 * CONTROLES:
 * - Jugador 1: A (distancia 1), D (distancia 2)
 * - Jugador 2: LEFT (distancia 1), RIGHT (distancia 2)
 * - Click en botones
 */

// IMPORTAR sistema de estilos unificado
import { 
    UIStyles, 
    createOverlay, 
    createStyledPanel, 
    createStyledText, 
    createStyledButton 
} from '../UIStyles.js';

export class FireStateWindow extends Phaser.Scene { 
    
    /**
     * @type {Number} Ancho del canvas del juego
     */
    screenWidth;

    /**
     * @type {Number} Alto del canvas del juego
     */
    screenHeight;

    /**
     * @type {Array} Referencias a los listeners de teclado para limpieza
     * Para que?
     */
    keyListeners = [];

    /**
     * @constructor Constructor de la escena
     */
    constructor(){
        super({ key: "fireStateWindow" });
    }

    /**
     * Inicialización
     */
    init(){
        // Asignar dimensiones del canvas
        this.screenWidth = this.sys.game.canvas.width;
        this.screenHeight = this.sys.game.canvas.height;
    }

    /**
     * Creación de la escena
     * 
     * @param {Object} data - Datos recibidos
     * @param {Array} data.confirmButton - Códigos de teclas para confirmar
     * @param {Function} data.distanceCallback - Callback para devolver distancia elegida
     * @param {Number} data.currentPlayer - ID del jugador actual (1 o 2)
     */
    create(data){
        this.data = data;
        // FONDO OSCURO usando estilos unificados
        const overlay = createOverlay(this, 0.7);
        // overlay.setDepth(1000);

        // CREAR PANEL PopUp
        this.createPopUp(data);
    }

    /**
     * Crea la ventana PopUp de selección de distancia
     * 
     * @param {Object} data - Datos de configuración
     */
    createPopUp(data){
        const screenWidth = this.screenWidth;
        const screenHeight = this.screenHeight;
        
        // Container principal del PopUp
        this.popUp = this.add.container(screenWidth/2, screenHeight/2);
        
        // PANEL de fondo
        let bg = createStyledPanel(this, 0, 0, 400, 220);
        
        // TEXTO de pregunta
        let confirmText = createStyledText(
            this, 0, -70,
            '¿A qué distancia quieres disparar?',
            'subtitle'
        );
        confirmText.setOrigin(0.5);
        
        // Determinar teclas según el jugador
        const buttonKeys = data.currentPlayer == 1 ? ['A', 'D'] : ['LEFT', 'RIGHT'];
        
        // BOTÓN DISTANCIA 1 con soporte de teclado
        let distance1Button = createStyledButton(
            this, 0, 0,
            `Distancia 1`,
            () => this.parse(1),
            true,           // Botón primario
            buttonKeys[0]   // Tecla asociada (A o LEFT)
        );
        
        // BOTÓN DISTANCIA 2 con soporte de teclado
        let distance2Button = createStyledButton(
            this, 0, 60,
            `Distancia 2`,
            () => this.parse(2),
            true,           // Botón primario
            buttonKeys[1]   // Tecla asociada (D o RIGHT)
        );
        
        // TEXTO DE AYUDA
        let helpText = createStyledText(
            this, 0, 95,
            `Presiona ${buttonKeys[0]} o ${buttonKeys[1]} | Click en botones`,
            'small'
        );
        helpText.setOrigin(0.5);
        
        // Añadir todo al container
        this.popUp.add([
            bg,
            confirmText,
            distance1Button.bg,
            distance1Button.label,
            distance2Button.bg,
            distance2Button.label,
            helpText
        ]);
        
        // Guardar referencias de listeners para limpieza
        this.keyListeners = [
            distance1Button.keyListener,
            distance2Button.keyListener
        ];
    }

    /**
     * Ejecuta el callback con la distancia elegida y cierra la ventana
     * 
     * @param {Number} distance - Distancia elegida (1 o 2)
     */
    parse(distance){
        
        // LIMPIAR todos los listeners de teclado
        this.keyListeners.forEach((listener, index) => {
            if (listener) {
                listener.off('down');
            }
        });
        
        // Ejecutar callback con la distancia
        this.data.distanceCallback(distance);
        
        // Cerrar esta escena
        this.scene.stop();
        
        // Reanudar escena principal
        this.scene.resume("GameScreen");
        
        console.log(" FireStateWindow cerrado");
    }
}