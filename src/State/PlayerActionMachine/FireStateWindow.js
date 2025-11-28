/**
 * Escena para mostrar el PopUp del disparo
 */
export class FireStateWindow extends Phaser.Scene{ 
    
    /**
     * @type {Number} Ancho de la canva del juego
     */
    screenWidth

    /**
     * @type {Number} Alto de la canva del juego
     */
    screenHeight


    /**
     * @constructor constructor de la escena
     */
    constructor(){
        super({key:"fireStateWindow"})
    }

    init(){
        //Asignar los valores de la dimension de canvas
        this.screenWidth = this.sys.game.canvas.width;
        this.screenHeight = this.sys.game.canvas.height;
    }

    preload(){

    }

    /**
     * @param {Object} data datos que utiliza esta escena, contiene la funcion callback a devolver;
     */
    create(data){
        this.data = data;
        
        //Fondo
        this.add.rectangle(this.screenWidth/2,this.screenHeight/2,this.screenWidth,this.screenHeight,0x000000,0.7);

        //PopUp
        this.createPopUp(data);
        
    }

    /**
     * Creacion de la ventana de PopUp
     */
    createPopUp(){
        this.popUp = this.add.container(this.screenWidth/2,this.screenHeight/2);

        let bg = new Phaser.GameObjects.Rectangle(this,0,0,400,200,0xe31e8d,1)
        let confirmText = new Phaser.GameObjects.Text(this,0,0,
            "A que distancia quieres disparar?",
            {fontFamily:"Inconsolata",fontSize:20})

        let confirmButton = [];
        if(this.data.currentPlayer == 1) confirmButton.push("A","D")
        else confirmButton.push("LEFT_ARROW","RIGHT_ARROW");
        let distance1 = new Phaser.GameObjects.Text(this,0,0,`Distancia 1 (${confirmButton[0]})`).setInteractive();
        let distance2 = new Phaser.GameObjects.Text(this,0,0,`Distancia 2 (${confirmButton[1]})`).setInteractive();


        confirmText.setPosition(-confirmText.displayWidth/2,-bg.displayHeight/2+(bg.displayHeight/6));
        distance1.setPosition(-distance1.displayWidth/2,distance1.displayHeight*1);
        distance2.setPosition(-distance2.displayWidth/2,distance2.displayHeight*3);
            
        this.input.keyboard.addKey(this.data.confirmButton[0]).on("down",()=>{
            this.parse(1);
        })

        this.input.keyboard.addKey(this.data.confirmButton[1]).on("down",()=>{
            this.parse(2);
        })

        distance1.on("pointerdown",()=>{
            this.parse(1);
        })

        distance2.on("pointerdown",()=>{
            this.parse(2)
        })

        this.popUp.add([bg,confirmText,distance1,distance2])
    }

    /**
     * Metodo que hace la llamada de callback con distance y volver al estado del disparo.
     * @param {Number} distance Distancia del disparo
     */
    parse(distance){
        this.data.distanceCallback(distance);
        this.scene.stop();
        this.scene.resume("GameScreen")
    }

}