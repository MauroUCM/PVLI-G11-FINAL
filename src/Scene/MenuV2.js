/**
 * MenuV2
 * 
 * Menú principal del juego
 * 
 * CORRECCIÓN: Ahora usa el sistema unificado de estilos
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
        
        // Fondo (añadirlo si existe la imagen)
        // this.add.image(w/2, h/2, 'menufondo').setAlpha(0.5);
        
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
        
        // BOTÓN "Start Game"
        const startBtn = createStyledButton(
            this, w/2, 200,
            '▶ EMPEZAR PARTIDA',
            () => {
                console.log("Iniciando juego...");
                this.scene.start('GameScreen');
            },
            true,
            'ENTER'
        );
        
        // BOTÓN "Flappy Dragon" (testing)
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
        
        // TEXTO DE AYUDA
        const helpText = createStyledText(
            this, w/2, 450,
            'Presiona ENTER para jugar | T para tutorial | F para minijuego',
            'small'
        );
        helpText.setOrigin(0.5);
        
        console.log("Menú principal creado");
    }
}