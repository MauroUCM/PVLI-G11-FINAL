// import EventDispatch from "../Event/EventDispatch.js";
// import Event from "../Event/Event.js";
// import { SubmarineComplete } from "../Submarine/SubmarineComplete.js";
// import { KeySet } from "./KeySet.js";

// //TODO
// // - Quitar todo lo que tenga que ver con la logica del juego, togle del mapa incluido
// // - Los keysets ya no deberian ser necesario, ya que el propio estado sabe que teclas se va a utilizar
// // - Este script probablemente se vacie
// // - Un array de teclas para facilitar el paso de las cosas

// const Key = Object.freeze({
//     W:Symbol("W"),
//     A:Symbol("A"),
//     S:Symbol("S"),
//     D:Symbol("D"),

//     UP:Symbol("UpArrow"),
//     LEFT:Symbol("LeftArrow"),
//     RIGHT:Symbol("RightArrow"),
//     DOWN:Symbol("DownArrow"),

//     M:Symbol('M'),
// })

// export default Key;

// export class InputManager {
//     /**
//      * 
//      * @param {SubmarineComplete} player1
//      * @param {SubmarineComplete} player2
//      * @param {Phaser.Scene} scene
//      */


//     constructor(scene, player1, player2,gameloopMachine,playerActionMachine){
        
//         this.gameloopMachine = gameloopMachine;
//         this.playerActionMachine = playerActionMachine;
//         this.scene = scene;
//         this.board = this.scene.tablero;
//         this.player1 = player1;
//         this.player2 = player2;

//         // this.createKeys();
//         // this.createEvents();
//     }

//     createKeys(){   
       
//         // Input submarino 1 (red )
//         this.w = this.scene.input.keyboard.addKey('W');
//         this.s = this.scene.input.keyboard.addKey('S');
//         this.a = this.scene.input.keyboard.addKey('A');
//         this.d = this.scene.input.keyboard.addKey('D');
//         this.player1Key = new KeySet([this.w,this.s,this.a,this.d])
        
        
//         // Input submarino 2 (blue)
        
//         this.upArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
//         this.downArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
//         this.rightArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
//         this.leftArrow = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        
//         this.player2Key = new KeySet([this.upArrow,this.downArrow,this.rightArrow,this.leftArrow])
        
//         this.space = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
//         this.m = this.scene.input.keyboard.addKey('M');
//     }

//     createEvents(){

//         this.w.on("down",()=>{
//             console.log("W pressed");
//             this.keyParse(Key.W,this.player1,this.playerActionMachine.currentState);
//         });

//         this.a.on("down",()=>{
//             console.log("A pressed");
//             this.keyParse(Key.A,this.player1,this.playerActionMachine.currentState);
//         });

//         this.s.on("down",()=>{
//             console.log("S pressed");
//             this.keyParse(Key.S,this.player1,this.playerActionMachine.currentState);
//         });

//         this.d.on("down",()=>{
//             console.log("D pressed");
//             this.keyParse(Key.D,this.player1,this.playerActionMachine.currentState);
//         });

//         this.upArrow.on("down",()=>{
//             console.log("upArrow");
//             this.keyParse(Key.UP,this.player2,this.playerActionMachine.currentState);
//         })

//         this.downArrow.on("down",()=>{
//             console.log("downArrow");
//             this.keyParse(Key.DOWN,this.player2,this.playerActionMachine.currentState);
//         })

//         this.leftArrow.on("down",()=>{
//             console.log("leftArrow");
//             this.keyParse(Key.LEFT,this.player2,this.playerActionMachine.currentState);
//         })

//         this.rightArrow.on("down",()=>{
//             console.log("rightArrow");
//             this.keyParse(Key.RIGHT,this.player2,this.playerActionMachine.currentState);
//         })

//         this.m.on("down",()=>{
//             this.keyParse(Key.M);
//         })
        

        
//         //Evento para desactivar tecla
//         EventDispatch.on(Event.DISABLE_KEY,(player)=>{
//             if(player == 1){
//                 this.player1Key.disable();
//             }
//             else if(player == 2){
//                 this.player2Key.disable();
//             }
//         })

//         //Evento para activar tecla
//         EventDispatch.on(Event.ENABLE_KEY,(player)=>{
//             if(player == 1){
//                 this.player1Key.enable();
//             }
//             else if(player == 2){
//                 this.player2Key.enable();
//             }
//         })

//         // //Una tecla dependiendo del estado tiene diferentes usos, el uso es diferente si estas en movimiento o en disparo
//         // //Alternativas:
//         // //1. Cuando recibe un input del teclado, manda esa tecla y el estado actual a otro script
//         // //y esa cosa dependiendo de la tecla y del estado pues ya manda mediandte el bus de evento lo que tiene que hacer las cosas
//         // //Pero asi hay que hacer todo esto para todas las teclas y para todos los eventos que recibe el script
//         // //O parsear directamente aqui

//         // //2.Crear un evento para todas las acciones de los dos jugadores
//         // //Y este script tendra las maquinas del estado, cuando una tecla es presionada mira directamente el estado que se encuentra
//         // //Y dependiendo del estado manda el evento correspondiente mediante el bus de los eventos

//     }
//     /**
//      * 
//      * @param {Key} key 
//      */
//     keyParse(key,player,state){
//         if(player == null || state == null){
//             if(key == Key.M){
//                 EventDispatch.emit(Event.TOGGLE_MAP);
//             }
//         }

//         else{
            
//             if((key === Key.W) || (key === Key.UP)){
//                 switch (state.name){
//                     case "Move State":
//                         console.log("Move state")
//                         EventDispatch.emit(Event.MOVE,player,0);
//                         break
//                 }
//             }
    
//             else if((key === Key.A) || (key === Key.LEFT)){
//                 switch (state.name){
//                     case "Move State":
//                         console.log("Move state")
//                         EventDispatch.emit(Event.MOVE,player,-90);
//                         break;
//                 }
//             }
    
//             else if((key === Key.D) || (key === Key.RIGHT)){
//                 switch (state.name){
//                     case "Move State":
//                         console.log("Move state")
//                         EventDispatch.emit(Event.MOVE,player,90);
//                         break;
//                 }
//             }
    
//             else if((key === Key.S) || (key === Key.DOWN)){
//                 switch (state.name){
//                     case "Move State":
//                         console.log("Move state");
//                         EventDispatch.emit(Event.MOVE,player,null);
//                         break;
//                 }
//             }
    
    
//             this.playerActionMachine.transition();
            
//         }

//     }
// }