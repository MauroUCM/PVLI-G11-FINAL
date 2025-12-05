import GameBoard from "../Board/GameBoard.js";
import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";
import { GameLoopMachine } from "../State/GameloopMachine/GameLoopMachine.js";
import { PlayerActionMachine } from "../State/PlayerActionMachine/PlayerActionMachine.js";
import DialogText from "../Tutorial/dialog_plugin.js";
import { SubmarineComplete } from "../Submarine/SubmarineComplete.js";

//TODO
// - Arreglar tween
export class TutorialScene extends Phaser.Scene{

    chain

    constructor(){
        super({key:"tutorial"})

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
    }
    
    //La dimension de la tabla tiene que ser un numero impar
    create(){
        let roundText = this.add.text(350,400,"Round 0",{fontFamily:"inconsolata",fontSize:32})
        this.roundTextAnimation = this.add.text(-150,300,"Round 0",{fontFamily:"inconsolata",fontSize:32})
        let playerText = this.add.text(350,450,"Turno del submarino rojo",{fontFamily:"inconsolata",fontSize:32})
        let playerActionText = this.add.text(350,500,"Fase actual:",{fontFamily:"inconsolata",fontSize:32})

        this.createTextTween();

        this.gameloopMachine = new GameLoopMachine(this);
        this.playerActionMachine = new PlayerActionMachine(this,this.gameloopMachine);
        let texturas = ["Square","BG", "Submarine"];
        this.tablero = new GameBoard(this);		
        let redSubmarine = this.tablero.submarines.red;
        let blueSubmarine = this.tablero.submarines.blue;

        redSubmarine.setNewPosition(2, 6);
        blueSubmarine.setNewPosition(4, 6);

        this.dialog = new DialogText(this, {
			borderThickness: 4,
			borderColor: 0xcb3234,
			borderAlpha: 1,
			windowAlpha: 0.6,
			windowColor: 0xff6961,
			windowHeight: 150,
			padding: 32,
			closeBtnColor: 'darkgoldenrod',
			dialogSpeed: 4,
			fontSize: 24,
			fontFamily: "pixel"
		});

		this.dialog.setText("¡Bienvenido a tu entrenamiento introductorio, soldado! Aqui aprenderas las bases que toda persona que aspire a ser un capitan decente debe conocer.", true);

        EventDispatch.on(Event.UPDATE_ROUND,(round)=>{
            let text = `Round ${round}`
            roundText.setText(text)
            this.roundTextAnimation.setText(text);
            this.chain.restart();
        })

        EventDispatch.on(Event.UPDATE_PLAYER_TEXT,(player)=>{
            playerText.setText(`Turno del submarino ${player}`);
        })

        EventDispatch.on(Event.UPDATE_PLAYER_ACTION_TEXT,(state)=>{
            playerActionText.setText(`Fase actual: ${state}`)
        })

    }

    update(){}

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
            this.roundTextAnimation.setPosition(-150,300)
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