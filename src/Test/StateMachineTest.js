import EventDispatch from "../Event/EventDispatch.js"
import { StateMachine } from "../State/StateMachine.js"
import { PlayerActionMachine } from "../State/PlayerActionMachine/PlayerActionMachine.js"
import { GameLoopMachine } from "../State/GameloopMachine/GameLoopMachine.js"
export class StateMachineTest extends Phaser.Scene{
    constructor(){
        super({key: 'StateMachineTest'})
    }

    init(){}

    preload(){

    }
    create(){
        this.glMachine = new GameLoopMachine();
        this.playerMachine = new PlayerActionMachine(this.glMachine)

        this.input.keyboard.on("keydown-D",()=>{
            console.log("D pressed");
            this.playerMachine.transition();
        })
    }

    update(){

    }
}