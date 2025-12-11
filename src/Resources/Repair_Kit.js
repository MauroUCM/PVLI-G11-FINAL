// import { Resource } from "../Resources/Resource.js";

// /**
//  * Recurso que repara el submarino
//  * "Restaura HP al submarino"
//  * Uso: Automático al recogerlo si estás dañado, o se almacena para uso manual posterior
//  */
// export class RepairKit extends Resource {
//     /**
//      * @param {Phaser.Scene} scene - La escena de Phaser
//      * @param {Number} x - Posición X en el tablero lógico
//      * @param {Number} y - Posición Y en el tablero lógico
//      * @param {String} texture - Textura del recurso
//      * @param {Number} healAmount - Cantidad de HP que restaura (por defecto 30)
//      */
//     constructor(scene, x, y, texture = "Resource", healAmount = 30) {
//         super(scene, x, y, texture, "repair_kit");
        
//         this.healAmount = healAmount; // Cantidad de HP que restaura
//         this.autoUse = true; // Se usa automáticamente si el submarino está dañado
//     }

//     /**
//      * Aplica el efecto de reparación al submarino
//      * Si el submarino está dañado, lo repara inmediatamente
//      * Si está a vida completa, se guarda en el inventario para uso posterior
//      * @param {Submarine} submarine - El submarino que recoge el recurso
//      */
//     applyEffect(submarine) {
//         // TODO: Implementar cuando Submarine tenga el sistema de vida completo
        
//         // Verificar si el submarino necesita reparación
//         const needsRepair = submarine.currentHP < submarine.maxHP;
        
//         if (needsRepair && this.autoUse) {
//             // Uso automático: Reparar inmediatamente
//             this.heal(submarine);
//             console.log(`Kit de reparación usado automáticamente. HP restaurado: ${this.healAmount}`);
//         } else {
//             // Guardar en inventario para uso manual posterior
//             console.log("Kit de reparación añadido al inventario para uso posterior");
            
//             // Placeholder para futura implementación:
//             // submarine.inventory.add(this);
//         }
//     }

//     /**
//      * Usa el kit de reparación sobre el submarino
//      * Puede ser llamado manualmente desde el inventario
//      * @param {Submarine} submarine - El submarino a reparar
//      */
//     use(submarine) {
//         this.heal(submarine);
//     }

//     /**
//      * Realiza la reparación del submarino
//      * @param {Submarine} submarine - El submarino a reparar
//      */
//     heal(submarine) {
//         // TODO: Implementar cuando Submarine tenga propiedades currentHP y maxHP
//         console.log(`Reparando submarino: +${this.healAmount} HP`);
        
//         // Placeholder para futura implementación:
//         // const hpBefore = submarine.currentHP;
//         // submarine.currentHP = Math.min(submarine.currentHP + this.healAmount, submarine.maxHP);
//         // const actualHeal = submarine.currentHP - hpBefore;
//         // 
//         // // Detener fugas si el sistema de fugas está implementado
//         // if (submarine.hasLeaks) {
//         //     submarine.hasLeaks = false;
//         //     submarine.leakDamagePerTurn = 0;
//         //     console.log("Fugas reparadas");
//         // }
//         // 
//         // return actualHeal;
//     }

//     /**
//      * Verifica si el kit puede ser usado en un submarino
//      * @param {Submarine} submarine - El submarino a verificar
//      * @returns {Boolean} true si el submarino está dañado
//      */
//     canUse(submarine) {
//         // TODO: Implementar cuando Submarine tenga sistema de vida
//         return true; // submarine.currentHP < submarine.maxHP;
//     }
// }
