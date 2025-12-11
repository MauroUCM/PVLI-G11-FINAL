/**
 * MinigameDialogScene
 *
 * Escena de diálogo que aparece cuando el jugador se encuentra con el dragón
 * Permite elegir si jugar al minijuego o continuar
 */
export class MinigameDialogScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'MinigameDialog' });
    }

    init(data) {
        // Datos recibidos: submarino que activó el evento
        this.submarine = data.submarine;
        this.dragonPosition = data.dragonPosition;
        this.callingScene = data.callingScene || 'GameScreen';
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // FONDO OSCURO SEMITRANSPARENTE
        const overlay = this.add.rectangle(
            screenWidth / 2,
            screenHeight / 2,
            screenWidth,
            screenHeight,
            0x000000,
            0.75
        );
        overlay.setDepth(1000);
        
        // PANEL PRINCIPAL
        const panelWidth = 500;
        const panelHeight = 350;
        const panel = this.add.rectangle(
            screenWidth / 2,
            screenHeight / 2,
            panelWidth,
            panelHeight,
            0x2a4858,
            1
        );
        panel.setStrokeStyle(4, 0x00ff88);
        panel.setDepth(1001);
        
        // CABECERA CON ICONO DEL DRAGÓN 
        this.createDragonIcon(screenWidth / 2, screenHeight / 2 - 120);
        
        // TÍTULO 
        const title = this.add.text(
            screenWidth / 2,
            screenHeight / 2 - 80,
            '¡Has encontrado al Dragón Vegano!',
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#00ff88',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        title.setOrigin(0.5);
        title.setDepth(1002);
        
        // DESCRIPCIÓN 
        const description = this.add.text(
            screenWidth / 2,
            screenHeight / 2 - 20,
            'El dragón te ofrece ayudarte a limpiar\nel océano de basura contaminante.\n\n' +
            'Si aceptas el desafío, podrás ganar\nrecursos valiosos para tu submarino.\n\n' +
            '¿Quieres jugar al minijuego?',
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 5
            }
        );
        description.setOrigin(0.5);
        description.setDepth(1002);
        
        // BOTÓN "SÍ"
        const yesButton = this.createButton(
            screenWidth / 2 - 100,
            screenHeight / 2 + 110,
            '✓ SÍ, JUGAR',
            0x00ff88,
            () => this.startMinigame()
        );
        
        //  BOTÓN "NO" 
        const noButton = this.createButton(
            screenWidth / 2 + 100,
            screenHeight / 2 + 110,
            '✗ NO, GRACIAS',
            0xff4444,
            () => this.decline()
        );
        
        // TEXTO DE AYUDA 
        const helpText = this.add.text(
            screenWidth / 2,
            screenHeight / 2 + 150,
            'Presiona ESC para salir',
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#888888',
                align: 'center'
            }
        );
        helpText.setOrigin(0.5);
        helpText.setDepth(1002);
        
        // TECLA ESC PARA SALIR 
        this.input.keyboard.once('keydown-ESC', () => {
            this.decline();
        });
        
        // Animación de entrada del panel
        panel.setScale(0);
        this.tweens.add({
            targets: panel,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Crea un icono del dragón en miniatura
     */
    createDragonIcon(x, y) {
        const size = 30;
        
        // Cuerpo
        const body = this.add.circle(x, y, size * 0.4, 0x00ff88, 1);
        body.setDepth(1002);
        
        // Cabeza
        const head = this.add.circle(x + size * 0.3, y - size * 0.2, size * 0.25, 0x00dd66, 1);
        head.setDepth(1002);
        
        // Ojos
        const eye1 = this.add.circle(x + size * 0.35, y - size * 0.25, size * 0.08, 0x000000, 1);
        eye1.setDepth(1003);
        
        const eye2 = this.add.circle(x + size * 0.45, y - size * 0.25, size * 0.08, 0x000000, 1);
        eye2.setDepth(1003);
        
        // Animación de flotación
        this.tweens.add({
            targets: [body, head, eye1, eye2],
            y: '+=5',
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Crea un botón interactivo
     */
    createButton(x, y, text, color, onClick) {
        const buttonWidth = 150;
        const buttonHeight = 50;
        
        // Fondo del botón
        const bg = this.add.rectangle(x, y, buttonWidth, buttonHeight, color, 1);
        bg.setStrokeStyle(2, 0xffffff);
        bg.setDepth(1002);
        bg.setInteractive({ useHandCursor: true });
        
        // Texto del botón
        const label = this.add.text(x, y, text, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        });
        label.setOrigin(0.5);
        label.setDepth(1003);
        
        // Efectos hover
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: bg,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
            bg.setFillStyle(color, 0.8);
        });
        
        bg.on('pointerout', () => {
            this.tweens.add({
                targets: bg,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
            bg.setFillStyle(color, 1);
        });
        
        // Click
        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: [bg, label],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: onClick
            });
        });
        
        return { bg, label };
    }

    /**
     * Inicia el minijuego del dragón
     */
    startMinigame() {
        console.log('¡Iniciando minijuego del dragón!');
        
        // Cerrar este diálogo
        this.scene.stop();
        
        // Iniciar el minijuego con los datos del submarino
        this.scene.start('FlappyDragon', {
            submarine: this.submarine,
            returnScene: this.callingScene
        });
    }

    /**
     * Rechaza el minijuego
     */
    decline() {
        console.log('Minijuego rechazado');
        
        // Efecto de salida
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