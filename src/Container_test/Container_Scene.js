import { Container_object } from "../Container_test/Container_object.js";
export default class Container_Scene extends Phaser.Scene{
    constructor(){
        super({key:"Test"})
    }

    init(){}

    preload(){
        console.log("preload");
        
        this.load.image("Square","Page/img/Profile/Lappland.jpeg")
        this.load.image("BG","Page/img/Profile/icon.jpg")
    }
    create(){
        let container = new Container_object(this,100,100)
    }
    update(){}
}