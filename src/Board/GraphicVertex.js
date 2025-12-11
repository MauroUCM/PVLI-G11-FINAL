import { Vertex } from "../Board/Vertex.js";

export class GraphicVertex extends Phaser.GameObjects.Graphics{
    constructor(scene,graphic,cellSize,v,offsetX,offsetY){
        super(scene,v);
        this.graphic = graphic;
        this.cellSize = cellSize;
        this.vertex= v;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        scene.add.existing(this);
    }

    render(){
        this.graphic.fillStyle(0xe6e8f0);
        this.graphic.fillCircle((this.vertex.position.x)*this.cellSize,(this.vertex.position.y*this.cellSize),2);
    }
}