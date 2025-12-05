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


	// Boton para empezar a jugar
    let start = this.add.text(400, 200, 'Start Game',{             
            fontFamily: 'Comic Sans MS',
            fontSize: '32px',
            color: '#00ab28',
            align: 'center',
        }).setOrigin(0.5).setInteractive();
		
		start.on('pointerover', () => start.setFontSize('34px'));
		start.on('pointerout', () => start.setFontSize('32px'));

		// Cambiar a otra escena al hacer clic
		start.on('pointerdown', () => {
			this.scene.start('GameScreen');
		});
		
		// Boton para jugar al Flappy Dragon
		let FlappyBT = this.add.text(400, 300, 'Flappy Dragon', {
            fontFamily: 'Comic Sans MS',
            fontSize: '32px',
            color: '#00ab28',
            align: 'center',
		}).setOrigin(0.5).setInteractive();

		FlappyBT.on('pointerover', () => FlappyBT.setFontSize('34px'));
		FlappyBT.on('pointerout', () => FlappyBT.setFontSize('32px'));

		FlappyBT.on('pointerdown', () => {
			this.scene.start('FlappyDragon');
		});

		// Boton para iniciar el tutorial
		let Tutorial = this.add.text(400, 400, 'Tutorial', {
            fontFamily: 'Comic Sans MS',
            fontSize: '32px',
            color: '#00ab28',
            align: 'center',
		}).setOrigin(0.5).setInteractive();

		Tutorial.on('pointerover', () => Tutorial.setFontSize('34px'));
		Tutorial.on('pointerout', () => Tutorial.setFontSize('32px'));

		Tutorial.on('pointerdown', () => {
			this.scene.start('tutorial');
		});


	}

}
