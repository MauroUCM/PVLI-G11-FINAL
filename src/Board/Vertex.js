import { Position } from "../Board/Position.js";
import { SubmarineComplete } from "../Submarine/SubmarineComplete.js";

/**
 * Un vertice, tiene informacion de si este el submarino o no
 */
export class Vertex{
    constructor(x,y){
        this.position = new Position(x,y);
        this.available = true;
        this.submarine = null;
    }

    /**
     * El submarino sale de este vertice
     */
    exit(){
        this.submarine = null;
    }

    /**
     * La entrada de un submarino a este vertice
     * @param {SubmarineComplete} submarine 
     */
    enter(submarine){
        this.submarine = submarine;
    }
}