import {GameScreen} from "./Scene/GameScreen.js";
import { Menu } from "./Scene/Menu.js";	
import { Submarine_View } from "./Scene/Submarine_View.js";
import Container_Scene from "./Container_test/Container_Scene.js";
import { Flappy_Dragon } from "./Minigames/MGFlappyDragon.js";
/**
 * Inicio del juego en Phaser. Creamos el archivo de configuración del juego y creamos
 * la clase Game de Phaser, encargada de crear e iniciar el juego.
 */
let config = {
	type: Phaser.AUTO,
    parent:"game",
	width:  800,
	height: 600,
	pixelArt: true,
	scale: {
		autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
	},
		physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
	scene: [Menu, Submarine_View, GameScreen, Flappy_Dragon],
};

new Phaser.Game(config);

// Escuchar la tecla P globalmente
document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        console.log("Tecla P presionada - Iniciando minijuego");
        
        // Obtener la escena activa actual
        const activeScenes = game.scene.getScenes(true);
        
        if (activeScenes.length > 0) {
            const currentScene = activeScenes[0];
            
            // Si NO estamos ya en el minijuego
            if (currentScene.scene.key !== 'FlappyDragon') {
                currentScene.scene.start('FlappyDragon');
            }
        }
    }
});