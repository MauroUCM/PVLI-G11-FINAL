import { Square } from "../Board/Square.js";
import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";
export class GraphicSquare extends Phaser.GameObjects.Image{

    /**
     * 
     * @param {*} scene 
     * @param {Square} s 
     */
    constructor(scene,square,texture,cellSize,offsetX,offsetY){
        super(scene,(square.position.x*cellSize),square.position.y*cellSize,texture)
        // this.offsetX = offsetX;
        // this.offsetY = offsetY;
        this.cellSize = cellSize;

        this.square = square;
        this.texture = texture;
        this.setDisplaySize(cellSize*2,cellSize*2)
        this.setAlpha(0.01);
        this.dragon = null;
        
        
        // this.setInteractive();
        this.addEvent();
        
        scene.add.existing(this);
    }
    /**
     * 
     * @param {Phaser.GameObjects.Graphics} GRAPHIC 
     * @param {number} cellSize 
     * @param {number} max 
     */
    render(){
        if(this.square.dragon != null){
            this.setDisplaySize(this.cellSize*1,this.cellSize*1);
            this.setAlpha(1);
            console.log(`Dragon square: ${this.x} ${this.y}`)
        }
        else this.setAlpha(0.01);
        this.setDisplaySize(this.cellSize*2,this.cellSize*2);
        // if(this.square.active){
        //     this.setAlpha(1);
        // }
        // else{
        //     this.setAlpha(0.01);
        // }
        
    }

    addEvent(){
        this.on("pointerdown",()=>{
            this.square.active = !this.square.active
            // console.log(this.square.position.x + " " + this.square.position.y)
            this.render();
            // console.log(this.square.active);
        })
    }
    Update(){
        this.square.active = !this.square.active
        console.log(this.square.position.x + " " + this.square.position.y)
        this.render();
        console.log(this.square.active);
    }
}