import GameBoard from "../Board/GameBoard.js";
import { Orientation, SubmarineComplete } from "../Submarine/SubmarineComplete.js";
import EventDispatch from "../Event/EventDispatch.js";
import Event from "../Event/Event.js";
import SubmarineView from "../Submarine/SubmarineViewObject.js";
import { GameLoopMachine } from "../State/GameloopMachine/GameLoopMachine.js";
import { PlayerActionMachine } from "../State/PlayerActionMachine/PlayerActionMachine.js";
import DialogText from "../Tutorial/dialog_plugin.js";
import { StateMachine } from "../State/StateMachine.js";

// AZUL = JAPON | ROJO = CHINA !!!

export class GameScreen extends Phaser.Scene{

    chain

    constructor(){
        super({key:"GameScreen"})

        this.tablero;
    }
    
    init(datos){
        console.log("init");
        this.tablero;
        this.tutorialToggle = datos.tutorial;
        console.log("Tutorial activado: " + this.tutorialToggle);
    }
    
    preload(){

        // cargar imagenes
        this.load.image("Square","Page/img/Profile/Lappland.jpeg")
        this.load.image("BG","assets/GameBoard_BG.jpg")
        this.load.image("Submarine","assets/submarino.png")
        this.load.image("SubWindow", "assets/SubWindow.png");
        this.load.image("sFront", "assets/Submarine/Submarine_front.png");
        this.load.image("sBack", "assets/Submarine/Submarine_back.png");
        this.load.image("sRight", "assets/Submarine/Submarine_right.png");
        this.load.image("sLeft", "assets/Submarine/Submarine_left.png");
        this.load.image("tutorialArrow", "assets/flecha.png")
        this.load.image("Panel", "assets/Panel.png");

        // cargar sonidos
        
    }
    
    //La dimension de la tabla tiene que ser un numero impar
    create(){

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

        // Crear ui
        this.createHeader();
        this.createPanel();
        let roundText = this.add.text(370,550,"Round 0",
        {
            fontFamily:"Outfit",
            fontSize:30,
            color: '#412e1fff'
        }).setDepth(3)

        this.roundTextAnimation = this.add.text(-150,300,"Round 0",{fontFamily:"Outfit",fontSize:25})

        let playerText = this.add.text(5,5,"Turno de China",
        {
            fontFamily:"Outfit",
            fontSize:40,
            color: '#412e1fff'
        }).setDepth(3)

        let playerActionText = this.add.text(5,550,"Fase actual:", 
        {
            fontFamily:"Outfit",
            fontSize:30,
            color: '#412e1fff'
        }).setDepth(3)

        this.toggleKey = this.input.keyboard.addKey('M');

        this.createTextTween();


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

        // tutorial
        if(this.tutorialToggle) this.createTutorialStuff();
    }

    refresh() {
        this.submarineView.active = !this.submarineView.active;
        if (this.submarineView.active) {
            this.submarineView.setVisible(true);
        }
        else this.submarineView.setVisible(false);
        
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
        this.background.setDepth(2)
        // this.container.add(this.background);


    }
    createPanel()
    {
        this.panel = this.add.rectangle(0, 0, 1010, 100, 0x00CC9966, 1);
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

        setUpControls(){

        this.input.on('pointerdown', () =>
        {
            if(this.clickAdvanceEnabled){
                this.tutorialStep++;
                console.log("Paso del tutorial num.: " + this.tutorialStep);
                this.updateTutorial();
            }

        }, this);

        this.input.keyboard.on('keydown-W', () =>{
            if(this.wAdvanceEnabled){
                this.tutorialStep++;
                console.log("Paso del tutorial num.: " + this.tutorialStep);
                this.updateTutorial();
            }
        })

        this.input.keyboard.on('keydown-A', () =>{
            if(this.aAdvanceEnabled){
                this.tutorialStep++;
                console.log("Paso del tutorial num.: " + this.tutorialStep);
                this.updateTutorial();
            }
        })
        this.input.keyboard.on('keydown-D', () =>{
            if(this.dAdvanceEnabled){
                this.tutorialStep++;
                console.log("Paso del tutorial num.: " + this.tutorialStep);
                this.updateTutorial();
            }
        })
    }

    createTutorialStuff(){
        // Variables del tutorial
        this.tutorialStep = 0;
        this.clickAdvanceEnabled = true;
        this.wAdvanceEnabled = false;
        this.aAdvanceEnabled = false;
        this.dAdvanceEnabled = false;

        // Elementos del submarino
            // Cuadro de diálogo
        this.dialog = new DialogText(this, {    
            borderThickness: 4,
            borderColor: 0x43BA99,
            borderAlpha: 1,
            windowAlpha: 0.6,
            windowColor: 0xAAF2DE,
            windowHeight: 150,
            padding: 32,
            closeBtnColor: 'darkgoldenrod',
            dialogSpeed: 4,
            fontSize: 24,
            fontFamily: "pixel",
        });
            // Flecha
        this.arrow = new Phaser.GameObjects.Image(this, 230, 345, "tutorialArrow")  
        this.add.existing(this.arrow);
        this.arrow.scale = 0.05;
        this.arrow.visible = false;

        this.setUpControls();
        this.updateTutorial();

        //Reposicionamiento de los submarinos
        this.tablero.submarines.red.setNewPosition(2, 6);
        this.tablero.submarines.blue.setNewPosition(6, 6);
        this.tablero.submarines.red.orientation = Orientation.E;
        this.tablero.submarines.red.angle = 0;
        this.tablero.submarines.red.setVisible(true);
        this.tablero.submarines.blue.setVisible(true);
    }

    //Estados del tutorial
    updateTutorial(){
        switch(this.tutorialStep){
        case 0:
            this.dialog.setText(
            "Te damos la bienvenida a tu entrenamiento introductorio, recluta! Aqui aprenderas las bases que toda persona que aspire a ser un capitan decente debe conocer. Haz click con el boton izquierdo para seguir.",
            true
            )
            //this.tablero.remove(this.tablero.dragon)
            this.tablero.dragon.destroy();
            break;
        case 1:
            this.dialog.setText(
                "En el mapa que tienes en frente de ti verás 2 submarinos. Normalmente no tendrás un mapa con la posición de los enemigos y aliados disponible, pero para mayor claridad nosotros usaremos uno que si.", 
                true
            )            
            break;
        case 2:
            this.dialog.setText(
                "El rojo pertenece a China.", 
                true
            )
            this.arrow.visible = true
            break;
        case 3:
            this.dialog.setText(
                "Y el azul, a Japón.", 
                true
            )
            this.arrow.x = 590;
            this.arrow.toggleFlipX()
            break;
        case 4:
            this.dialog.setText(
                "En este entrenamiento asumiremos que somos los rojos, camarada.",
                true
            )
            this.arrow.visible = false;
            break;
        case 5:
            this.dialog.setText(
                "Practicaremos primero un movimiento acompañado por un ataque.",
                true
            )
            break;
        case 6:
            this.dialog.setText(
                "Pulsa [W] para avanzar hacia delante.",
                true
            )
            this.clickAdvanceEnabled = false;
            this.wAdvanceEnabled = true;
            break;
        case 7:
            this.dialog.setText(
                "Ahora pulsa [W] de nuevo para atacar a tu frente. Y después [A] para hacer un ataque a corto alcance.",
                true
            )
            break;
        case 8:
            this.dialog.setText(
                "Muy bien! Observa como has dañado el submarino japonés, ahora es su turno.",
                true
            )
            this.clickAdvanceEnabled = true;
            this.wAdvanceEnabled = false;
            break;
        case 9:
            this.tablero.submarines.blue.moveRight();
            this.playerActionMachine._currentState.transition();
            this.playerActionMachine._currentState.transition();

            this.dialog.setText(
                "Parece que se ha apartado para que no puedas seguir golpeandolo. Pulsa [D] para desplazarte a la casilla en tu derecha.",
                true
            )
            this.dAdvanceEnabled = true;
            this.clickAdvanceEnabled = false;
            break;
        case 10:
            this.dialog.setText(
                "Ahora para atacarlo debes tener en cuenta que has girado y estás boca abajo en el mapa, haciendo que tu izquierda sea la derecha de tu mapa.",
                true
            )
            this.dAdvanceEnabled = false;
            this.clickAdvanceEnabled = true;
            break;
        case 11:
            this.dialog.setText(
                "Pulsa [A] para atacar a tu derecha, donde está el submarino enemigo. Y pulsa otra vez [A] para hacer un ataque a corto alcance.",
                true
            )
            this.aAdvanceEnabled = true;
            this.clickAdvanceEnabled = false;
            break;
        case 12:
            this.dialog.setText(
                "Felicidades, superates el entrenamiento soldado. Ahora puedes participar en batallas por ti mismo!",
                true
            )
            this.aAdvanceEnabled = false;
            this.clickAdvanceEnabled = true;
            break;
        case 13:
            this.scene.start('menu2');
            break;
        }

    }
}