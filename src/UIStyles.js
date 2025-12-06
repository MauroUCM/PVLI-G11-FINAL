/**
 * UIStyles.js
 * 
 * Sistema centralizado de estilos para mantener consistencia visual
 * en todos los paneles, botones y menús del juego
 * 
 * USO:
 * import { UIStyles, createStyledPanel, createStyledButton } from './UIStyles.js';
 */

export const UIStyles = {
    
    // COLORES PRINCIPALES
    colors: {
        // Paneles y fondos
        panelBg: 0x2a4858,           // Azul oscuro elegante
        panelBorder: 0x00ff88,        // Verde brillante
        overlayBg: 0x000000,          // Negro para overlay
        
        // Botones
        buttonPrimary: 0x00ff88,      // Verde (acción afirmativa)
        buttonSecondary: 0xff4444,    // Rojo (acción negativa)
        buttonHover: 0x00dd66,        // Verde más oscuro al hover
        buttonDisabled: 0x666666,     // Gris para botones deshabilitados
        
        // Texto
        textPrimary: 0xffffff,        // Blanco
        textSecondary: 0x00ff88,      // Verde
        textAccent: 0xffff00,         // Amarillo
        textError: 0xff0000,          // Rojo
        textSuccess: 0x00ff00         // Verde brillante
    },
    
    // ESTILOS DE TEXTO
    text: {
        // Títulos grandes
        title: {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#00ff88',
            fontStyle: 'bold',
            align: 'center'
        },
        
        // Subtítulos
        subtitle: {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center'
        },
        
        // Texto normal
        body: {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 5
        },
        
        // Texto pequeño (ayuda, hints)
        small: {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#888888',
            align: 'center'
        },
        
        // Botones
        button: {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }
    },
    
    // DIMENSIONES
    dimensions: {
        // Paneles
        panelBorderWidth: 4,
        panelPadding: 20,
        
        // Botones
        buttonWidth: 250,
        buttonHeight: 50,
        buttonBorderWidth: 2,
        buttonSpacing: 20
    },
    
    //  ANIMACIONES
    animations: {
        // Duración estándar
        fast: 100,
        normal: 300,
        slow: 500,
        
        // Easings comunes
        easeOut: 'Back.easeOut',
        easeInOut: 'Sine.easeInOut',
        bounce: 'Bounce.easeOut'
    }
};

/**
 *  Crea un panel estilizado estándar
 * 
 * @param {Phaser.Scene} scene - La escena donde crear el panel
 * @param {number} x - Posición X del centro
 * @param {number} y - Posición Y del centro
 * @param {number} width - Ancho del panel
 * @param {number} height - Alto del panel
 * @returns {Phaser.GameObjects.Rectangle} El panel creado
 */
export function createStyledPanel(scene, x, y, width, height) {
    const panel = scene.add.rectangle(x, y, width, height, UIStyles.colors.panelBg, 1);
    panel.setStrokeStyle(UIStyles.dimensions.panelBorderWidth, UIStyles.colors.panelBorder);
    return panel;
}

/**
 *  Crea un overlay oscuro de fondo
 * 
 * @param {Phaser.Scene} scene - La escena
 * @param {number} alpha - Transparencia (0-1)
 * @returns {Phaser.GameObjects.Rectangle} El overlay creado
 */
export function createOverlay(scene, alpha = 0.75) {
    const w = scene.cameras.main.width;
    const h = scene.cameras.main.height;
    return scene.add.rectangle(w/2, h/2, w, h, UIStyles.colors.overlayBg, alpha);
}

/**
 *  Crea texto estilizado
 * 
 * @param {Phaser.Scene} scene - La escena
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {string} text - Texto a mostrar
 * @param {string} styleType - Tipo de estilo ('title', 'subtitle', 'body', 'small', 'button')
 * @returns {Phaser.GameObjects.Text} El texto creado
 */
export function createStyledText(scene, x, y, text, styleType = 'body') {
    const style = UIStyles.text[styleType] || UIStyles.text.body;
    return scene.add.text(x, y, text, style);
}

/**
 *  Crea un botón interactivo estilizado con soporte completo de teclado
 * 
 * @param {Phaser.Scene} scene - La escena
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {string} text - Texto del botón
 * @param {function} onClick - Callback al hacer clic
 * @param {boolean} isPrimary - Si es botón primario (verde) o secundario (rojo)
 * @param {string|null} keyboardKey - Tecla opcional del teclado (ej: 'ENTER', 'ESC', 'A', 'D')
 * @returns {Object} { bg, label, keyListener } - Componentes del botón
 */
export function createStyledButton(scene, x, y, text, onClick, isPrimary = true, keyboardKey = null) {
    const buttonWidth = UIStyles.dimensions.buttonWidth;
    const buttonHeight = UIStyles.dimensions.buttonHeight;
    const color = isPrimary ? UIStyles.colors.buttonPrimary : UIStyles.colors.buttonSecondary;
    
    //  Fondo del botón
    const bg = scene.add.rectangle(x, y, buttonWidth, buttonHeight, color, 1);
    bg.setStrokeStyle(UIStyles.dimensions.buttonBorderWidth, 0xffffff);
    bg.setInteractive({ useHandCursor: true });
    
    //  Texto del botón (con tecla si se especifica)
    const buttonText = keyboardKey ? `${text} [${keyboardKey}]` : text;
    const label = scene.add.text(x, y, buttonText, UIStyles.text.button);
    label.setOrigin(0.5);
    
    //  SOPORTE DE TECLADO
    let keyListener = null;
    if (keyboardKey) {
        keyListener = scene.input.keyboard.addKey(keyboardKey);
        keyListener.on('down', () => {
            // Solo ejecutar si el botón está activo y visible
            if (bg.active && bg.visible) {
                animateClick(scene, bg, label, onClick);
            }
        });
    }
    
    //  Efectos hover (mouse sobre el botón)
    bg.on('pointerover', () => {
        scene.tweens.add({
            targets: [bg, label],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: UIStyles.animations.fast,
            ease: UIStyles.animations.easeOut
        });
        bg.setFillStyle(color, 0.8);
    });
    
    //  Mouse sale del botón
    bg.on('pointerout', () => {
        scene.tweens.add({
            targets: [bg, label],
            scaleX: 1,
            scaleY: 1,
            duration: UIStyles.animations.fast
        });
        bg.setFillStyle(color, 1);
    });
    
    //  Click con mouse
    bg.on('pointerdown', () => {
        animateClick(scene, bg, label, onClick);
    });
    
    return { bg, label, keyListener };
}

/**
 *  Anima el clic de un botón (efecto de presionar)
 * 
 * @param {Phaser.Scene} scene - La escena
 * @param {Phaser.GameObjects.Rectangle} bg - Fondo del botón
 * @param {Phaser.GameObjects.Text} label - Texto del botón
 * @param {function} onClick - Callback a ejecutar
 */
function animateClick(scene, bg, label, onClick) {
    scene.tweens.add({
        targets: [bg, label],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: onClick
    });
}

/**
 *  Crea un icono del dragón (versión pequeña para UI)
 * 
 * @param {Phaser.Scene} scene - La escena
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} size - Tamaño del icono (default: 30)
 * @returns {Phaser.GameObjects.Container} Container con el icono del dragón
 */
export function createDragonIcon(scene, x, y, size = 30) {
    const container = scene.add.container(x, y);
    
    // Cuerpo
    const body = scene.add.circle(0, 0, size * 0.4, 0x00ff88, 1);
    body.setDepth(1002);
    
    // Cabeza
    const head = scene.add.circle(size * 0.3, -size * 0.2, size * 0.25, 0x00dd66, 1);
    head.setDepth(1002);
    
    // Ojos
    const eye1 = scene.add.circle(size * 0.35, -size * 0.25, size * 0.08, 0x000000, 1);
    eye1.setDepth(1003);
    
    const eye2 = scene.add.circle(size * 0.45, -size * 0.25, size * 0.08, 0x000000, 1);
    eye2.setDepth(1003);
    
    container.add([body, head, eye1, eye2]);
    
    //  Animación de flotación
    scene.tweens.add({
        targets: container,
        y: '+=5',
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    return container;
}