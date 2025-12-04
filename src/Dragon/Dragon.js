import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";


export class Dragon extends Phaser.GameObjects.Image{

    board

    position;

    square;

    constructor(board,randomSpawn,position){
        super(board.scene);
        this.board = board;

        this.randomSpawn(randomSpawn,position);

        EventDispatch.on(Event.GET_DRAGON,(callback)=>{
            callback.dragon = this;
        })

        EventDispatch.on(Event.MOVE_DRAGON,()=>{
            this.randomMove();
        })
    }

    randomSpawn(random,position){
        let x = null,y = null;
        if(!random){
            this.position = position;
        }
        if(random){
            do{
                x = Phaser.Math.Between(0,(this.board.config.boardWidth-1)*2)
            }while(x%2 == 0);

            do{
                y = Phaser.Math.Between(0,(this.board.config.boardHeight-1)*2)
            }while(y%2 == 0);
            console.log(this.board.matrix.logic);
            this.square = this.board.matrix.logic.matrix[x][y];
            this.position = this.square.position;
            this.square.dragonEnter(this);
        }
    }


    /**
     * Movimiento aleatorio del dragon
     */
    randomMove(){
        let direction, sign,x,y;

        let checkPosition = (x,y)=>{
            return x > 0 && x < ((this.board.config.boardWidth-1)*2) &&
                   y > 0 && y < ((this.board.config.boardHeight-1)*2)
        }

        do{
            sign = Math.sign(Phaser.Math.Between(-1,1));
            direction = Phaser.Math.Between(0,1);
    
            if(direction == 0){
                x = this.position.x + (sign*2);
                y = this.position.y;
            }
            else{
                x = this.position.x;
                y = this.position.y +(sign*2);
            }
        }while(!checkPosition(x,y))

        this.square.dragonExit();
        this.square = this.board.matrix.logic.matrix[x][y].dragonEnter(this); 
        this.position = this.square.position;
        console.log(`Dragon: moviendo a ${this.position.position}`)
    }
}