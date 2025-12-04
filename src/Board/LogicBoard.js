import { Vertex } from "../Board/Vertex.js";
import { Square } from "../Board/Square.js";

/**
 * El tablero logico del juego, contiene las informaciones de los cuadrados y de los vertices
 */
export default class LogicBoard{
    constructor(x,y){
        this.matrix = [];
        this.initialize(x,y);
        this.getVertexListForSquare();
    }

    /**
     * @description Funcion que inicializa la tabla
     * @param {Number} x Anchura
     * @param {Number} y Altura
     */
    initialize(x,y){
        for(let i = 0; i < x; ++i){
            this.matrix[i] = [];
            for(let j = 0; j < y; ++j){
                this.createVertex(i,j);
            }
        }
    }

    getVertexListForSquare(){
        this.matrix.forEach((row)=>{
            row.forEach((point)=>{
                if(point instanceof Square){
                    point.getNextPoint(this.matrix)
                }
            })
        })
    }

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     */
    createVertex(x,y){
        if(!(x%2) && !(y%2)){
            this.matrix[x][y] = new Vertex(x,y);
        }
        else if(x%2 && y%2){
            this.matrix[x][y] = new Square(x,y);
        }
        else {
            this.matrix[x][y] = null;
        }
        //console.log("Creando vertices en: " + x + " " + y + + " " + this.matrix[x][y].tipo)
    }
}