/**
 * MenuV2
 * 
 * Menú principal del juego
 * 
 */

// IMPORTAR sistema de estilos
import { 
    UIStyles, 
    createStyledText, 
    createStyledButton 
} from '../UIStyles.js';

export class Menu2 extends Phaser.Scene {
    constructor() {
        super({ key: 'menu2' });
    }

    preload(){
        this.load.image('menufondo', 'assets/menufondo.jpg');
    }
    
    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        console.log("Creando menú principal...");
        
        // Fondo oscuro para mejor contraste
        this.add.rectangle(w/2, h/2, w, h, 0x0a1f2e, 1);
        
        // Fondo (añadirlo si existe la imagen)
        // this.add.image(w/2, h/2, 'menufondo').setAlpha(0.3);
        
        // TÍTULO del juego
        const title = this.add.text(w/2, 80, 
            'SUBMARINE TACTICS', 
            {
                fontSize: '48px',
                color: '#00ff88',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        );
        title.setOrigin(0.5);
        
        // Animación del título
        this.tweens.add({
            targets: title,
            y: '+=10',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // BOTÓN "Start Game" - Con configuración explícita
        const startBtn = createStyledButton(
            this, w/2, 200,
            '▶ EMPEZAR PARTIDA',
            () => {
                console.log("Iniciando juego...");
                this.scene.start('GameScreen');
            },
            true,    // Botón primario
            'ENTER'  // Tecla
        );
        
        // ASEGURAR que el texto sea visible
        startBtn.label.setDepth(1003);
        startBtn.label.setColor('#ffffff');
        startBtn.label.setVisible(true);
        startBtn.bg.setDepth(1002);
        
        // BOTÓN "Flappy Dragon"
        const flappyBtn = createStyledButton(
            this, w/2, 280,
            'FLAPPY DRAGON (Test)',
            () => {
                console.log("Iniciando Flappy Dragon...");
                this.scene.start('FlappyDragon');
            },
            true,
            'F'
        );
        
        flappyBtn.label.setDepth(1003);
        flappyBtn.label.setColor('#ffffff');
        flappyBtn.label.setVisible(true);
        flappyBtn.bg.setDepth(1002);
        
        // BOTÓN "Tutorial"
        const tutorialBtn = createStyledButton(
            this, w/2, 360,
            'TUTORIAL',
            () => {
                console.log("Iniciando tutorial...");
                this.scene.start('tutorial');
            },
            true,
            'T'
        );
        
        tutorialBtn.label.setDepth(1003);
        tutorialBtn.label.setColor('#ffffff');
        tutorialBtn.label.setVisible(true);
        tutorialBtn.bg.setDepth(1002);
        
        // TEXTO DE AYUDA
        const helpText = createStyledText(
            this, w/2, 450,
            'Presiona ENTER para jugar | T para tutorial | F para minijuego',
            'small'
        );
        helpText.setOrigin(0.5);
        helpText.setColor('#aaaaaa'); // Gris claro para mejor visibilidad
        
        console.log("Menú principal creado");
        
        // VERIFICACIÓN: Imprimir estado de los botones
        console.log("Estado de botones:");
        console.log(`  Start label visible: ${startBtn.label.visible}`);
        console.log(`  Start label color: ${startBtn.label.style.color}`);
    }
}
