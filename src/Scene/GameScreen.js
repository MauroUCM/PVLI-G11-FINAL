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
        this.load.image("SubWindow", "assets/SubWindow.png");
        this.load.image("sFront", "assets/Submarine/Submarine_front.png");
        this.load.image("sBack", "assets/Submarine/Submarine_back.png");
        this.load.image("sRight", "assets/Submarine/Submarine_right.png");
        this.load.image("sLeft", "assets/Submarine/Submarine_left.png");
    }
    
    //La dimension de la tabla tiene que ser un numero impar
    create(){

        this.createHeader();
        this.createPanel();
        let roundText = this.add.text(400,550,"Round 0",
        {
            fontFamily:"Outfit",
            fontSize:30,
            color: '#412e1fff'
        })

        this.roundTextAnimation = this.add.text(-150,300,"Round 0",{fontFamily:"Outfit",fontSize:25})

        let playerText = this.add.text(5,5,"Turno de China",
        {
            fontFamily:"Outfit",
            fontSize:40,
            color: '#412e1fff'
        })

        let playerActionText = this.add.text(5,550,"Fase actual:", 
        {
            fontFamily:"Outfit",
            fontSize:30,
            color: '#412e1fff'
        })

        this.toggleKey = this.input.keyboard.addKey('M');

        this.createTextTween();

        // Maquina de estados y objetos del juego
        this.gameloopMachine = new GameLoopMachine(this);
        this.playerActionMachine = new PlayerActionMachine(this,this.gameloopMachine);

        let texturas = ["Square","BG", "Submarine"];

        this.tablero = new GameBoard(this);

        let redSubmarine = this.tablero.submarines.red;
        let blueSubmarine = this.tablero.submarines.blue;

        this.submarineView = new SubmarineView(this,0,0, this.tablero, this.tablero.submarines.red, this.tablero.submarines.blue);
        this.submarineView.setDepth(1); // Pantalla al fondo
        this.tablero.setDepth(0); // Tablero encima

        // this.submarineView.setVisible(false);
        console.log(this.submarineView.visible)
        //Actualizar textos de ronda y jugador
        EventDispatch.on(Event.UPDATE_ROUND,(round)=>{
            let text = `Round ${round}`
            roundText.setText(text)
            this.roundTextAnimation.setText(text);
             this.submarineView.renderView();
            this.chain.restart();            
        })
        
        EventDispatch.on(Event.UPDATE_PLAYER_TEXT,(player)=>{
            if (this.tablero.currentTurn == "red") playerText.setText(`Turno de China`);
            else if (this.tablero.currentTurn == "blue")playerText.setText(`Turno de Japon`);
             this.submarineView.renderView();
          
        })

        EventDispatch.on(Event.UPDATE_PLAYER_ACTION_TEXT,(state)=>{
            playerActionText.setText(`Fase actual: ${state}`)
           // this.submarineView.onDistance(this.tablero.submarines.red, this.tablero.submarines.blue)
             this.submarineView.renderView();
        })

        //Toogle Submarine View - Board con M
        // this.toggleKey.on("down",()=>{
        //     this.refresh();
        // }) 
    }

     refresh() {
        this.submarineView.active = !this.submarineView.active;
        if (this.submarineView.active) {
            this.submarineView.setVisible(true);
        }
        else this.submarineView.setVisible(false);
        console.log("Toggled submarine view visibility");
        
    }

    update(){
     
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

    createHeader()
    {
        this.background = this.add.rectangle(0, 0, 1600, 60, 0x00CC9966, 1);
        this.background.setOrigin(0, 0);
        // this.container.add(this.background);


    }
    createPanel()
    {
        this.panel = this.add.rectangle(0, 0, 1050, 100, 0x00CC9966, 1);
        this.panel.setPosition(0,575);
      

          let divisor = this.add.text(300,565," | ",
        {
            fontFamily:"Outfit",
            fontSize:40,
            color: '#412e1fff'
        })
           let divisor2 = this.add.text(300,530," | ",
        {
            fontFamily:"Outfit",
            fontSize:40,
            color: '#412e1fff'
        })


    }
}