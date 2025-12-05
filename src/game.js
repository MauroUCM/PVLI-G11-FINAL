import { GameScreen } from "./Scene/GameScreen.js";
import { Menu } from "./Scene/Menu.js";	
import { Menu2 } from "./Scene/MenuV2.js";
import { Submarine_View } from "./Scene/Submarine_View.js";
import { Flappy_Dragon } from "./Minigames/MGFlappyDragon.js";
import { TutorialScene } from "./Scene/TutorialScene.js";
import { FireStateWindow } from "./State/PlayerActionMachine/FireStateWindow.js";
import { MinigameDialogScene } from "./Scene/MinigameDialogScene.js";
import { RepairMinigame } from "./Minigames/RepairMinigame.js";

/**
 * Inicio del juego en Phaser. Creamos el archivo de configuración del juego y creamos
 * la clase Game de Phaser, encargada de crear e iniciar el juego.
 */
let config = {
	type: Phaser.AUTO,
    parent: "game",
	width: 800,
	height: 600,
	pixelArt: true,
    //backgroundColor: '#ebeb34',
	scale: {
		autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
	},
	// FÍSICA NECESARIA PARA EL MINIJUEGO
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: false // Cambiar a true para ver las físicas
		}
    },

	scene: [
		Menu2, 
		Submarine_View, 
		GameScreen, 
		Flappy_Dragon,          
		FireStateWindow,
        TutorialScene,       
		MinigameDialogScene,    
		RepairMinigame          
	],
};

// Crear el juego
const game = new Phaser.Game(config);

// Escuchar la tecla P para el minijuego del dragón (testing)
document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        console.log("Tecla P presionada - Iniciando minijuego del dragón");
        
        const activeScenes = game.scene.getScenes(true);
        
        if (activeScenes.length > 0) {
            const currentScene = activeScenes[0];
            
            if (currentScene.scene.key !== 'FlappyDragon') {
                currentScene.scene.start('FlappyDragon', {
                    submarine: null,
                    returnScene: currentScene.scene.key
                });
            }
        }
    }
    
    // Escuchar la tecla B para el minijuego de reparación (testing)
    if (event.key === 'b' || event.key === 'B') {
        console.log("Tecla R presionada - Iniciando minijuego de reparación");
        
        const activeScenes = game.scene.getScenes(true);
        
        if (activeScenes.length > 0) {
            const currentScene = activeScenes[0];
            
            if (currentScene.scene.key !== 'RepairMinigame') {
                currentScene.scene.start('RepairMinigame', {
                    submarine: null,
                    returnScene: currentScene.scene.key,
                    healAmount: 30
                });
            }
        }
    }
});