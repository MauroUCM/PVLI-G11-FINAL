    import GameBoard from "../Board/GameBoard.js";
import { SubmarineComplete } from "../Submarine/SubmarineComplete.js";
import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";
// import { InputManager } from "../Input/InputManager.js";
import SubmarineView from "../Scene/SubmarineViewObject.js";
import { GameLoopMachine } from "../State/GameloopMachine/GameLoopMachine.js";
import { PlayerActionMachine } from "../State/PlayerActionMachine/PlayerActionMachine.js";
// import { ResourceManager } from "../Resources/ResourceManager.js";
// import { SubmarineInventory } from "../Resources/SubmarineInventory.js";

// AZUL = JAPON | ROJO = CHINA !!!

//TODO
// - Arreglar tween

export class GameScreen extends Phaser.Scene{

    chain

    constructor(){
        super({key:"GameScreen"})

        this.tablero;
    }
    
    init(){
        console.log("init");
        this.tablero;
    }
    
    preload(){
        console.log("preload");
        
        this.load.image("Square","Page/img/Profile/Lappland.jpeg")
        this.load.image("BG","assets/GameBoard_BG.jpg")
        this.load.image("Submarine","assets/submarino.png")
        this.load.image("SubWindow","assets/SubWindow.png")
    }
    
    //La dimension de la tabla tiene que ser un numero impar
    create(){
        let header = this.add.rectangle(0, 0, 2000, 100, 0x00CC9966, 1);
        let roundText = this.add.text(40,520,"Round 0",{fontFamily:"Arial",fontSize:20})
        this.roundTextAnimation = this.add.text(-150,300,"Round 0",{fontFamily:"Arial",fontSize:25})
        let playerText = this.add.text(0,10,"Turno de China",{fontFamily:"Arial",fontSize:20})
        let playerActionText = this.add.text(40,570,"Fase actual:",{fontFamily:"Arial",fontSize:20})
        
        

        this.createTextTween();

        this.gameloopMachine = new GameLoopMachine(this);
        this.playerActionMachine = new PlayerActionMachine(this,this.gameloopMachine);
        let texturas = ["Square","BG", "Submarine"];
        this.submarineView = new SubmarineView(this,0, 100)
        this.tablero = new GameBoard(this);

        // let china = this.tablero.player1(); // China
        // let japan = this.tablero.player2(); // Japon

        // this.pC = china;
        // this.pJ = japan;

        if (this.tablero.onRange()) console.log("AAA");

        EventDispatch.on(Event.UPDATE_ROUND,(round)=>{
            let text = `Round ${round}`
            roundText.setText(text)
            this.roundTextAnimation.setText(text);
            this.chain.restart();
        })

        EventDispatch.on(Event.UPDATE_PLAYER_TEXT,(player)=>{
            if (this.player == 'rojo') playerText.setText(`Turno de China`);
            else playerText.setText(`Turno de Japon`);
        })

        EventDispatch.on(Event.UPDATE_PLAYER_ACTION_TEXT,(state)=>{
            playerActionText.setText(`Fase actual: ${state}`)
        })
    }

    update(){

        // pC = this.tablero.player1(); // China
        // pJ = this.tablero.player2(); // Japon

    }

    createTextTween(){

        this.leftAnimation = this.add.tween({
            targets:this.roundTextAnimation,
            duration:1500,
            props:{
                x:{value:350}
            },
            ease:"Quart.easeInOut", //Quart
            persist:true,
        })

        this.rightAnimation = this.add.tween({
            targets:this.roundTextAnimation,
            duration:1500,
            props:{
                x:{value:1000}
            },
            ease:"Quart.easeInOut", //Quart
            delay:1000,
            persist:true
        })

        this.rightAnimation.on("complete",()=>{
            this.roundTextAnimation.setPosition(-150,525)
        })

        this.chain = this.tweens.chain({
            targets:this.roundTextAnimation,
            tweens:[
                this.leftAnimation,this.rightAnimation
            ],
            persist:true,
        })

    }

    playChain(){
        this.chain.play();
    }
}