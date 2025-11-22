export class FireStateWindow extends Phaser.Scene{
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
        this.add.rectangle(350,350,data.width,data.height,0xe31e8d,1);
        console.log("crated fire window")

        this.input.keyboard.addKey('F').on("down",()=>{
            console.log("pressed F")
            this.scene.stop();
            this.scene.resume("GameScreen");
            data.miCallback(true);
        })

        data.miCallback
    }

    update(){

    }
}