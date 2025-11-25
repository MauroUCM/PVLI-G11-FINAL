export class Flappy_Dragon extends Phaser.Scene{
	constructor() {
		super({ key: 'FlappyDragon' }); 
	}

    preload(){
        this.load.image("Dragon","assets/submarino.png")    // hay que cambiarlo

		
	}
}