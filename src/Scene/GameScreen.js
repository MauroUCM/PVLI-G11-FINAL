import GameBoard from "../Board/GameBoard.js";
import { SubmarineComplete } from "../Submarine/SubmarineComplete.js";
import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";
import SubmarineView from "../Scene/SubmarineViewObject.js";
import { GameLoopMachine } from "../State/GameloopMachine/GameLoopMachine.js";
import { PlayerActionMachine } from "../State/PlayerActionMachine/PlayerActionMachine.js";

// AZUL = JAPON | ROJO = CHINA !!!

export class GameScreen extends Phaser.Scene{

    chain

    constructor(){
        super({key:"GameScreen"})
        this.tablero;
    }
    
    init(){
        console.log(" GameScreen init");
        
        // LIMPIAR eventos anteriores para evitar duplicados
        EventDispatch.off(Event.UPDATE_ROUND);
        EventDispatch.off(Event.UPDATE_PLAYER_TEXT);
        EventDispatch.off(Event.UPDATE_PLAYER_ACTION_TEXT);
        
        this.tablero = null;
    }
    
    preload(){
        console.log("preload");
        
        this.load.image("Square","Page/img/Profile/Lappland.jpeg")
        this.load.image("BG","assets/GameBoard_BG.jpg")
        this.load.image("Submarine","assets/submarino.png")
        this.load.image("SubWindow","assets/SubWindow.png")
    }
    
    create(){
        console.log(" GameScreen create");
        
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
        
        console.log("GameScreen creado correctamente");
    }

    update(){
        // Código de update si es necesario
    }

    createTextTween(){
        this.leftAnimation = this.add.tween({
            targets:this.roundTextAnimation,
            duration:1500,
            props:{
                x:{value:350}
            },
            ease:"Quart.easeInOut",
            persist:true,
        })

        this.rightAnimation = this.add.tween({
            targets:this.roundTextAnimation,
            duration:1500,
            props:{
                x:{value:1000}
            },
            ease:"Quart.easeInOut",
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
    
    /**
     * Limpieza cuando la escena se cierra o se reinicia
     */
    shutdown() {
        console.log("=== LIMPIANDO GAMESCREEN ===");
        
        // 1. Eventos
        EventDispatch.off(Event.UPDATE_ROUND);
        EventDispatch.off(Event.UPDATE_PLAYER_TEXT);
        EventDispatch.off(Event.UPDATE_PLAYER_ACTION_TEXT);
        
        // 2. CRÍTICO: Detener TODOS los tweens
        this.tweens.killAll();
        
        // 3. Tweens específicos
        if (this.chain) {
            this.chain.stop();
            this.chain.destroy();
        }
        if (this.leftAnimation) {
            this.leftAnimation.stop();
            this.leftAnimation.destroy();
        }
        if (this.rightAnimation) {
            this.rightAnimation.stop();
            this.rightAnimation.destroy();
        }
        
        // 4. Sistemas del tablero
        if (this.tablero) {
            if (this.tablero.zoneClosing) {
                this.tablero.zoneClosing.destroy();
            }
            if (this.tablero.exitZoneSystem) {
                this.tablero.exitZoneSystem.destroy();
            }
        }
        
        console.log("   GameScreen limpio");
    }
}