import {GameScreen} from "./Scene/GameScreen.js";
import { Menu } from "./Scene/Menu.js";	
import { Submarine_View } from "./Scene/Submarine_View.js";
import Container_Scene from "./Container_test/Container_Scene.js";
import { StateMachineTest } from "./Test/StateMachineTest.js";
import { FireStateWindow } from "./State/PlayerActionMachine/FireStateWindow.js";
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
	scene: [GameScreen,FireStateWindow],
};

new Phaser.Game(config);
