export class Menu2 extends Phaser.Scene {
	constructor() {
		super({ key: 'menu2' }); //seteamos el nobmre de la escena para el SceneManager
	}

	/**
	* Carga de los recursos que vamos a necesitar en la escena
	*/
	preload(){
		this.load.image('menufondo', 'assets/menufondo.jpg');
		//this.load.image('boton', 'assets/boton.jpg');
		
	}
	
	/**
	* Creación de los elementos de la escena principal de juego
	*/
	create() {

        // ME RINDO CON ESTA MRDA
        //this.backgroundColor = '#ebeb34'
        //this.game.backgroundColor = '#ebeb34'
        //config.backgroundColor = '#ebeb34'
        //this.cameras.backgroundColor = '#ebeb34'
        //this.game.config.backgroundColor= '#ebeb34'
        //this.game.stage.backgroundColor = '#ebeb34'


    let boton = this.add.text(400, 300, 'Start Game',{             
            fontFamily: 'Comic Sans MS',
            fontSize: '32px',
            color: '#00ab28',
            align: 'center',
            //backgroundColor: '#2d2d2d'
        }).setOrigin(0.5).setInteractive();
		
		boton.on('pointerover', () => boton.setFontSize('34px'));
		boton.on('pointerout', () => boton.setFontSize('32px'));

		// Cambiar a otra escena al hacer clic
		boton.on('pointerdown', () => {
			this.scene.start('GameScreen');
		});
		
		// Boton para jugar al Flappy Dragon
		let FlappyBT = this.add.text(10, 10, 'Click aquí para Flappy Dragon', {
			fontSize: '16px',
			fill: '#ffff00',
			backgroundColor: '#000000',
			padding: { x: 5, y: 3 }
		}).setInteractive();

		FlappyBT.on('pointerdown', () => {
			this.scene.start('FlappyDragon');
		});
	}

}
