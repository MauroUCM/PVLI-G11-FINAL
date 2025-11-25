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
            this.up = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
            this.down = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
            this.left = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
            this.right = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        }

        this.createEvent();

        this.up.on("down",()=>{
            EventDispatch.emit(Event.SHOOT,currentPlayer,0);
        })
        this.down.on("down",()=>{
            // EventDispatch.emit(Event.SHOOT);
            this.transition();
        })
        this.left.on("down",()=>{
            EventDispatch.emit(Event.SHOOT,currentPlayer,-90);
            // this.transition();
        })
        this.right.on("down",()=>{
            EventDispatch.emit(Event.SHOOT,currentPlayer,90);
            // this.transition();
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

    createEvent(){
        EventDispatch.on(Event.SHOOT,(player,direction)=>{
            this.scene.scene.pause();
            this.scene.scene.launch("fireStateWindow",{
                player:player, //Teclas del jugador correspondiente
                //cuando ya sabe la distancia que quiere disparar
                distanceCallback: (distance)=>{
                    console.log(`Shoot distance: ${distance}`);
                    this.distance = distance;
                    this.shoot("despues")
                }
            })
            console.log("Launching fire window")
            EventDispatch.emit(Event.SUBMARINE,"blue",{callBack:(sub)=>{this.blue = this.getSubmarine(sub)}})
            EventDispatch.emit(Event.SUBMARINE,"red",{callBack:(sub)=>{this.red = this.getSubmarine(sub)}})
        })
    }

    shoot(algo){
        this.distance = algo;
        console.log(algo);
        // this.transition();
    }
}