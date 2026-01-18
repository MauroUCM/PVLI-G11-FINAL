/**
 * MenuV2
 * 
 * Menú principal del juego
 * 
 */

export class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'boot' });
    }

    preload(){
        //#region Pantalla carga
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        //Fondo oscuro para mejor contraste
        this.add.rectangle(w, h, w, h, 0x0a1f2e, 1).setOrigin(1,1);

        const title = this.add.text(w/2, h/2, 
            'CARGANDO...', 
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

        this.tweens.add({
            targets: title,
            y: '+=10',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        //#endregion

        //#region Imgs Main Game
        this.load.image("Square","Page/img/Profile/Lappland.jpeg")
        this.load.image("BG","assets/GameBoard_BG.jpg")
        this.load.image("Submarine","assets/submarino.png")
        this.load.image("SubWindow", "assets/SubWindow.png");
        this.load.image("sFront", "assets/Submarine/Submarine_front.png");
        this.load.image("sBack", "assets/Submarine/Submarine_back.png");
        this.load.image("sRight", "assets/Submarine/Submarine_right.png");
        this.load.image("sLeft", "assets/Submarine/Submarine_left.png");
        this.load.image("tutorialArrow", "assets/flecha.png")
        this.load.image("Panel", "assets/Panel.png");
        // #endregion

        //#region Flappy Dragon
        this.load.image('fondo1', 'assets/fondo_1.png');
        this.load.image('fondo2', 'assets/fondo_2.png');
        this.load.image('fondo3', 'assets/fondo_3.png');
        this.load.image('suelo', 'assets/suelo.png');
        //#endregion
    }
    
    create() {
        this.scene.start('menu')
    }
}
