
export class Container_image extends Phaser.GameObjects.Image{
    constructor(scene,x,y,texture){
        super(scene,x,y,texture)

        this.setDisplaySize(100,100)
        
        this.setInteractive();
        this.on("pointerdown",()=>{
            this.setAlpha(0);
            console.log("Clicked")
        })
        scene.add.existing(this)
    }
}