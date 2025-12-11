// import { Position } from "./Position";

// export default class Submarine extends Phaser.GameObjects.Graphics{

//     /**
//      * @description Constructor del submarino
//      * @param {Number} x Anchura
//      * @param {Number} y Altura
//      * @param {Number} ammunition Cantidad de municion para el ataque basico por turno.
//      * @param {Number} damage Daño que hace el cañon basico.
//      */
//         constructor(scene,x,y,text,ammunition, damage){
//             super(scene,x,y);

//             this.texture = text;
//             this.range = 2;
//             this.orientation = 'N';
//             this.damage = damage;
//             this.boardPosition = Position(x, y);
//             this.ammunition = ammunition;
    
//             scene.add.existing(this);
//         }

//     render(){
        
//     }

//     /**
//      * @description Metodo para disparar
//      * @param {Number} x Coordenada X del objetivo
//      * @param {Number} y Coordenada Y del objetivo
//      */
//     shoot(x, y){
//         if(ammunition > 0){
//             if(this.boardPosition.x == x){
//                 aux = this.boardPosition.y - y;
//             }
//             else if (this.boardPosition.y == y){

//             }
//         }
//     }


// }