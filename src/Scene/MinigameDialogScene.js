/**
 * MinigameDialogScene
 *
 * Escena de diálogo que aparece cuando el jugador se encuentra con el dragón
 * 
 * CONTROLES:
 * - ENTER: Aceptar jugar al minijuego
 * - ESC: Rechazar y continuar
 * - Click en botones
 */

//IMPORTAR sistema de estilos unificado
import { 
    UIStyles, 
    createOverlay, 
    createStyledPanel, 
    createStyledText, 
    createStyledButton, 
    createDragonIcon 
} from '../UIStyles.js';

export class MinigameDialogScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'MinigameDialog' });
    }

    /**
     * Inicialización - Recibe datos de la escena anterior
     * 
     * @param {Object} data - Datos recibidos
     * @param {SubmarineComplete} data.submarine - Submarino que activó el evento
     * @param {Position} data.dragonPosition - Posición del dragón
     * @param {string} data.callingScene - Escena desde donde se llamó
     */
    init(data) {
        this.submarine = data.submarine;
        this.dragonPosition = data.dragonPosition;
        this.callingScene = data.callingScene || 'GameScreen';
        
        console.log("  MinigameDialogScene iniciado");
        console.log(`   Submarino: ${this.submarine ? this.submarine.name : 'null'}`);
        console.log(`   Escena origen: ${this.callingScene}`);
    }

    /**
     * Creación de la escena
     */
    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // PASO 1: FONDO OSCURO SEMITRANSPARENTE
        const overlay = createOverlay(this, 0.75);
        overlay.setDepth(1000);
        
        // PASO 2: PANEL PRINCIPAL
        const panelWidth = 500;
        const panelHeight = 350;
        const panel = createStyledPanel(
            this, 
            screenWidth/2, 
            screenHeight/2, 
            panelWidth, 
            panelHeight
        );
        panel.setDepth(1001);
        
        // PASO 3: ICONO DEL DRAGÓN (animado)
        const dragonIcon = createDragonIcon(
            this, 
            screenWidth/2, 
            screenHeight/2 - 120,
            30
        );
        dragonIcon.setDepth(1002);
        
        // PASO 4: TÍTULO
        const title = createStyledText(
            this,
            screenWidth/2,
            screenHeight/2 - 80,
            '¡Has encontrado al Dragón Vegano!',
            'title'
        );
        title.setOrigin(0.5);
        title.setDepth(1002);
        
        // PASO 5: DESCRIPCIÓN
        const description = createStyledText(
            this,
            screenWidth/2,
            screenHeight/2 - 20,
            'El dragón te ofrece ayudarte a limpiar\n' +
            'el océano de basura contaminante.\n\n' +
            'Si aceptas el desafío, podrás ganar\n' +
            'recursos valiosos para tu submarino.\n\n' +
            '¿Quieres jugar al minijuego?',
            'body'
        );
        description.setOrigin(0.5);
        description.setDepth(1002);
        
        // PASO 6: BOTÓN "SÍ" - Ahora se adapta al texto
        // El botón será pequeño porque "SÍ" es texto corto
        const yesButton = createStyledButton(
            this,
            screenWidth/2 - 80,  // Reducir separación
            screenHeight/2 + 110,
            'SÍ',  // Texto más corto
            () => this.startMinigame(),
            true,      // Botón primario (verde)
            'ENTER'    // Tecla asociada
        );
        yesButton.bg.setDepth(1002);
        yesButton.label.setDepth(1003);
        
        // PASO 7: BOTÓN "NO" - También adaptado
        const noButton = createStyledButton(
            this,
            screenWidth/2 + 80,  // Reducir separación
            screenHeight/2 + 110,
            'NO',  // Texto más corto
            () => this.decline(),
            false,     // Botón secundario (rojo)
            'ESC'      // Tecla asociada
        );
        noButton.bg.setDepth(1002);
        noButton.label.setDepth(1003);
        
        // PASO 8: TEXTO DE AYUDA
        const helpText = createStyledText(
            this,
            screenWidth/2,
            screenHeight/2 + 150,
            'Presiona ENTER para aceptar | ESC para rechazar',
            'small'
        );
        helpText.setOrigin(0.5);
        helpText.setDepth(1002);
        
        // Guardar referencias para limpieza posterior
        this.uiElements = {
            overlay,
            panel,
            dragonIcon,
            title,
            description,
            yesButton,
            noButton,
            helpText
        };
    }

    /**
     * Inicia el minijuego del dragón
     */
    startMinigame() {
        // LIMPIAR listeners de teclado antes de cerrar
        if (this.uiElements.yesButton.keyListener) {
            this.uiElements.yesButton.keyListener.off('down');
        }
        if (this.uiElements.noButton.keyListener) {
            this.uiElements.noButton.keyListener.off('down');
        }
        
        // Cerrar este diálogo
        this.scene.stop();
        
        // Iniciar el minijuego con los datos del submarino
        this.scene.start('FlappyDragon', {
            submarine: this.submarine,
            returnScene: this.callingScene
        });
    }

    /**
     * Rechaza el minijuego y vuelve al juego
     */
    decline() {
        
        // 🔧 LIMPIAR listeners de teclado
        if (this.uiElements.yesButton.keyListener) {
            this.uiElements.yesButton.keyListener.off('down');
            console.log("   Listener ENTER limpiado");
        }
        if (this.uiElements.noButton.keyListener) {
            this.uiElements.noButton.keyListener.off('down');
            console.log("   Listener ESC limpiado");
        }
        
        // Efecto de salida (fade out)
        const allObjects = this.children.list;
        this.tweens.add({
            targets: allObjects,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.scene.stop();
                this.scene.resume(this.callingScene);
            }
        });
    }
}