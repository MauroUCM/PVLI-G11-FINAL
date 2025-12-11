
import Board from "./LogicBoard.js";
import { Vertex_Graphic } from "./GraphicVertex.js";
import { Square_Graphic } from "./GraphicSquare.js";
import { Vertex } from "./Vertex.js";

export default class Graphic_Board extends Phaser.GameObjects.Image{
    constructor(scene,x,y,logic,texture,cellSize){
        super(scene,((x-2)*cellSize)/2,((y-2)*cellSize)/2,texture[1]);
        this.GRAPHIC = scene.add.graphics({ lineStyle: { width: 1, color: 0x00ff00 } });
        this.cellSize = cellSize;
        this.active = false;

        this.setAlpha(0.1);
        this.setDisplaySize(x*cellSize,y*cellSize)

        this.matrix = [];
        this.texture = texture
        // this.board = new Board(x,y);
        // console.table(this.board.matrix)
        this.initialize(scene,x,y,logic);
        // this.setInteractive();

        // this.on("pointerdown",()=>{
        //     if(this.active){
        //         this.active = !this.active;
        //         super.setAlpha(0);
        //         console.log(this.active)
        //         this.input.enabled = true;
        //     }
        //     else{
        //         this.active = !this.active;
        //         super.setAlpha(0.3);
        //         console.log(this.active)
        //         this.input.enabled = true;
        //     }
        //     console.log("Clicked")
        // })

        scene.add.existing(this);
    }

    initialize(scene,x,y,logic){

        for(let i = 0; i < x; ++i){
            this.matrix[i] = [];
            for(let j = 0; j < y; ++j){
                this.createVertex(scene,i,j,logic);
            }
        }

        console.table(this.matrix);
    }

    createVertex(scene,x,y,logic){
        //console.log(this.board.matrix[x][y])
        if((x%2 == 0) && (y%2 == 0)){
            this.matrix[x][y] = new Vertex_Graphic(scene,this.GRAPHIC,this.cellSize,logic.matrix[x][y]);
        }
        else if((x%2 == 1) && (y%2 == 1)){
            //this.matrix[x][y] = new Vertex_Graphic(scene,this.GRAPHIC,this.cellSize,logic.matrix[x][y]);
            this.matrix[x][y] = new Square_Graphic(scene,logic.matrix[x][y],this.texture[0],40);
        }
        else {
            this.matrix[x][y] = null;
        }   
    }

    render(){
        this.matrix.forEach((row,num) =>{
            row.forEach(point =>{
                if(point instanceof Square_Graphic){
                    point.render();
                }
                if(point instanceof Vertex_Graphic){
                    point.render();
                }
            })
        })

        
        // for(let i = 0;i < this.graphic_matrix.length;++i){
        //     for(let j = 0;j < this.graphic_matrix[0].length;++j){
        //         if(this.graphic_matrix[i][j] instanceof Vertex_Graphic){
        //             console.log(this.graphic_matrix[i][j]);
                    
        //             // this.graphic_matrix[i][j].render(GRAPHIC,cellSize);
        //         }
        //         // let point = this.graphic_matrix[i][j];
        //         // if(point != null){
        //         //     point.render(GRAPHIC,cellSize);
        //         // }
        //     }
        // }
    }

    add(texture){
        this.texture.push(texture);
    }

    addEvent(){

    }
}