import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";

//TODO
// - Meter aqui la logica del disparar, y se supone que solo este estado sabe lo que tiene que hacer, y como tiene la escena se puede meter todo lo de disparo aqui

export class FireState extends State{

    /**
     * @type {Phaser.Input.Keyboard.Key}
     */
    up

    /**
     * @type {Phaser.Input.Keyboard.Key}
     */
    down

    /**
     * @type {Phaser.Input.Keyboard.Key}
     */
    left

    /**
     * @type {Phaser.Input.Keyboard.Key}
     */
    right

    /**
     * @type {Phaser.Scene} Para facilitar el acceso a la escena
     */
    scene

    constructor(stateMachine){
        super(stateMachine);
        this._name = "Fire State"
        this.scene = this.stateMachine.scene;
    }

    onStateEnter(){

        EventDispatch.emit(Event.UPDATE_PLAYER_ACTION_TEXT,"Fire");

        let currentPlayer = this.stateMachine.context.currentState.id
        
        if(currentPlayer == 1){
            //Enable player 1 key
            this.up = this.stateMachine.scene.input.keyboard.addKey("W")
            this.down = this.stateMachine.scene.input.keyboard.addKey('S');
            this.left = this.stateMachine.scene.input.keyboard.addKey('A');
            this.right = this.stateMachine.scene.input.keyboard.addKey('D');
        }
        else if(currentPlayer== 2){
            this.up = this.stateMachine.scene.input.keyboard.addKey("UP");
            this.down = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
            this.left = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
            this.right = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        }

        this.confirmButton = [this.left.keyCode,this.right.keyCode];
        this.setEvent();
        // console.log(this.left);

        this.up.on("down",()=>{
            EventDispatch.emit(Event.SHOOT,this.confirmButton,0);
        })
        this.down.on("down",()=>{
            // EventDispatch.emit(Event.SHOOT);
            this.transition();
        })
        this.left.on("down",()=>{
            EventDispatch.emit(Event.SHOOT,this.confirmButton,-90);
        })
        this.right.on("down",()=>{
            EventDispatch.emit(Event.SHOOT,this.confirmButton,90);
        })
    }

    onStateExit(){
        this.up.off("down");
        this.down.off("down");
        this.left.off("down");
        this.right.off("down");
    }

    transition(){
        this.stateMachine.transition(this.stateMachine.stateList.airAttackState)
    }

    setEvent(){
        EventDispatch.on(Event.SHOOT,(player,direction)=>{
            this.scene.scene.pause();
            this.scene.scene.launch("fireStateWindow",{
                confirmButton:player, //Teclas del jugador correspondiente
                //cuando ya sabe la distancia que quiere disparar
                distanceCallback: (distance)=>{
                    console.log(`Shoot distance: ${distance}`);
                    let range = distance;
                    this.shoot(range,direction);
                },
                currentPlayer:this.stateMachine.context.currentState.id
            })
            // console.log("Launching fire window")
            // EventDispatch.emit(Event.GET_SUBMARINE,"blue",{callBack:(sub)=>{this.blue = sub}})
            // EventDispatch.emit(Event.GET_SUBMARINE,"red",{callBack:(sub)=>{this.red = sub}})
        })
    }

    shoot(distance, direction){

        //Conversion para utilizar los metodos 
        if(direction == 0) direction = "front";
        else if(direction == -90) direction = "left"
        else if(direction == 90) direction = "right"

        let board = null;
        EventDispatch.emit(Event.GET_GAMEBOARD,{boardCallback:(b)=>{board = b}})

        //Logica del disparo (traslado tal cual de lo que habia en GameBoard)

        const attacker = board.submarines[board.currentTurn];
        const target = board.currentTurn === "red" ? board.submarines.blue : board.submarines.red;


        let isTarget1 = attacker.isTarget(target.position.x, target.position.y, 1)
        let isTarget2 = attacker.isTarget(target.position.x, target.position.y, 2)

        if (isTarget1 || isTarget2) console.log("Target!");

        let isTargetDir1 = isTarget1 && 
            attacker.isTargetDir(target.position.x, target.position.y, 1, direction) && 
            attacker.canShoot(distance);
            
        let isTargetDir2 = isTarget2 && 
            attacker.isTargetDir(target.position.x, target.position.y, 2, direction) && 
            attacker.canShoot(distance);

        if (distance == 1) {
            attacker.shoot(distance);
            if (isTargetDir1) {
                target.loseHealth(5);
                console.log("¡Impacto! -5 HP");
            }
        }
        if (distance == 2) {
            attacker.shoot(distance);
            if (isTargetDir2 || isTargetDir1) {
                target.loseHealth(2);
                console.log("¡Impacto! -2 HP");
            }
        }

        // Actualizar ambos HUDs
        board.huds[board.currentTurn].update();
        const targetColor = board.currentTurn === "red" ? "blue" : "red";
        board.huds[targetColor].update();
        // board.endTurn();

        this.transition();
    }
}