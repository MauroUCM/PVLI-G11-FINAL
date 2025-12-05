
export class Menu extends Phaser.Scene {
	constructor() {
		super({ key: 'menu' }); //seteamos el nobmre de la escena para el SceneManager
	}

	/**
	* Carga de los recursos que vamos a necesitar en la escena
	*/
	preload(){
		this.load.image('menufondo', 'assets/menufondo.jpg');
		this.load.image('boton', 'assets/boton.jpg');
		
	}
	
	/**
	* Creación de los elementos de la escena principal de juego
	*/
	create() {
		//Imagen de fondo
		this.add.image(100, 100, 'menufondo').setScale(1.9).setOrigin(0.15, 0.2);
		
	// Botón interactivo
		let boton = this.add.image(690, 500, 'boton') 
			.setInteractive()
			.setScale(0.25); 

		
		boton.on('pointerover', () => boton.setTint(0xaaaaaa));
		boton.on('pointerout', () => boton.clearTint());

		// Cambiar a otra escena al hacer clic
		boton.on('pointerdown', () => {
			// this.scene.start('Submarine_View');
			this.scene.start('GameScreen');
		});

	}

}
