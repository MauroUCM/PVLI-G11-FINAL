import { Container_image } from "../Container_test/Container_image.js"

export class Container_object extends Phaser.GameObjects.Container{
    constructor(scene,x,y){
        super(scene,x,y)

        this.image = new Container_image(scene,x,y,"BG")
        this.image2 = new Container_image(scene,x,y,"Square")
        
        this.add(this.image)
        this.add(this.image2)
        
        this.moveUp(this.image)
        scene.add.existing(this);
    }
}