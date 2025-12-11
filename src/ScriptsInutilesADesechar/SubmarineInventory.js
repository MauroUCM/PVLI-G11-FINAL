// import { Submarine_v2 } from "/mnt/project/Submarine_v2.js";

// /**
//  * SubmarineInventory:
//  * Clase que extiende Submarine_v2 y añade únicamente el SISTEMA DE INVENTARIO.
//  * No modifica vida, munición ni movimiento del submarino original.
//  * Solo añade objetos de recursos y métodos para usarlos.
//  */
// export class Submarine_Inventory extends Submarine_v2 {
//     constructor(scene, x, y, board, container) {
//         super(scene, x, y, board, container);
             
//         // Inventario de recursos
//         this.inventory = {
//             cooldownReducers: 0,
//             movementLimiters: 0,
//             repairKits: 0
//         };
       
//     }
   
//     //MÉTODOS DE INVENTARIO
    
//     /**
//      * Añade un reductor de cooldown al inventario
//      */
//     addCooldownReducer(amount = 1) {
//         this.inventory.cooldownReducers += amount;
//         console.log(`Reductores de cooldown en inventario: ${this.inventory.cooldownReducers}`);
//     }
    
//    /**
//      * Usa un reductor de cooldown.
//      * Intenta llamar al método público reduceCooldown() del submarino base.
//      * @param {Submarine_v2} submarine - instancia del submarino (normalmente this)
//      */
//     useCooldownReducer(Submarine_v2) 
//     {
//         if (this.inventory.cooldownReducers > 0) 
//         {
//             this.inventory.cooldownReducers--;
//             console.log(`Reductor usado. Quedan ${this.inventory.cooldownReducers} en inventario`);

//             // Se asume que Submarine_v2 tendrá un método público reduceCooldown()
//             if (typeof Submarine_v2.reduceCooldown === "function") 
//             {
//                 Submarine_v2.reduceCooldown(1);
//             }
//             else 
//             {
//                 console.warn("AVISO: Submarine_v2 no tiene reduceCooldown(). El reductor no hace nada todavía.");
//             }

//             return true;
//         }
//         console.log("No hay reductores de cooldown en el inventario");
//         return false;
//     }
    
//     /**
//      * Añade un limitador de movimiento al inventario
//      */
//     addMovementLimiter(amount = 1) 
//     {
//         this.inventory.movementLimiters += amount;
//         console.log(`Limitadores de movimiento en inventario: ${this.inventory.movementLimiters}`);
//     }
    
//     /**
//      * Usa un limitador de movimiento (debe aplicarse al enemigo)
//      */
//     useMovementLimiter() 
//     {
//         if (this.inventory.movementLimiters > 0) 
//         {
//             this.inventory.movementLimiters--;
//             console.log(`Limitador usado. Quedan ${this.inventory.movementLimiters} en inventario`);
//             return true;
//         }
//         console.log("No hay limitadores de movimiento en el inventario");
//         return false;
//     }
    
//     /**
//      * Añade un kit de reparación al inventario
//      */
//     addRepairKit(amount = 1) 
//     {
//         this.inventory.repairKits += amount;
//         console.log(`Kits de reparación en inventario: ${this.inventory.repairKits}`);
//     }
    
//     /**
//      * Usa un kit de reparación del inventario
//      */
//     useRepairKit(Submarine_v2, healAmount = 30) 
//     {
//         if (this.inventory.repairKits <= 0)
//         {
//            console.log("No hay kits de reparación.");
//             return false;
//         }
        
//         // Verifica que el submarino tenga método heal()
//          if (typeof Submarine_v2.heal !== "function") {
//             console.warn("El submarino base no tiene método heal().");
//             return false;
//         }

//         this.repairKits--;
//         return Submarine_v2.heal(healAmount);
//     }
    
//     //MÉTODOS DE RECURSOS
    
//     /**
//      * Recoge un recurso (llamado por el ResourceManager)
//      * @param {Resource} resource - El recurso a recoger
//      */
//     collectResource(resource) {
//         console.log(`Recogiendo recurso de tipo: ${resource.type}`);
//         resource.applyEffect(this);
//     }
    
//     // UTILIDAD
//     showInventory() {
//         console.log("=== Inventario del Submarino ===");
//         console.log(`Reductores cooldown: ${this.inventory.cooldownReducers}`);
//         console.log(`Limitadores movimiento: ${this.inventory.movementLimiters}`);
//         console.log(`Kits reparación: ${this.inventory.repairKits}`);
//         console.log("===============================");
//     }
// }