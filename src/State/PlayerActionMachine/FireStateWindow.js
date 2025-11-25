import Event from "../../Event/Event.js";
import EventDispatch from "../../Event/EventDispatch.js";

export class FireStateWindow extends Phaser.Scene{

    data
    
    constructor(){
        super({key:"fireStateWindow"})
    }

    init(){
        this.screenWidth = this.sys.game.canvas.width;
        this.screenHeight = this.sys.game.canvas.height;
    }

    preload(){

    }

    create(data){
        this.data = data;
        
        //Fondo
        this.add.rectangle(this.screenWidth/2,this.screenHeight/2,this.screenWidth,this.screenHeight,0x000000,0.7);

        //PopUp
        this.createPopUp();
        // this.add.rectangle(this.screenWidth/2,this.screenHeight/2,300,300,0xe31e8d,1);
        console.log("crated fire window")
        
    }

    createPopUp(){
        this.popUp = this.add.container(this.screenWidth/2,this.screenHeight/2);

        let bg = new Phaser.GameObjects.Rectangle(this,0,0,400,200,0xe31e8d,1)
        let confirmText = new Phaser.GameObjects.Text(this,0,0,
            "A que distancia quieres disparar?",
            {fontFamily:"Inconsolata",fontSize:20})

            
        let distance1 = new Phaser.GameObjects.Text(this,0,0,"Distancia 1").setInteractive();
        let distance2 = new Phaser.GameObjects.Text(this,0,0,"Distancia 2").setInteractive();


        confirmText.setPosition(-confirmText.displayWidth/2,-bg.displayHeight/2+(bg.displayHeight/6));
        distance1.setPosition(-distance1.displayWidth/2,distance1.displayHeight*1);
        distance2.setPosition(-distance2.displayWidth/2,distance2.displayHeight*3);

        distance1.on("pointerdown",()=>{
            this.data.distanceCallback(1)
            this.scene.stop();
            this.scene.resume("GameScreen");
        })

        distance2.on("pointerdown",()=>{
            this.data.distanceCallback(2)
            this.scene.stop();
            this.scene.resume("GameScreen");
        })

        this.popUp.add([bg,confirmText,distance1,distance2])
    }

    getSubmarine(sub){
        return sub;
    }

    // update(){

    // }
}