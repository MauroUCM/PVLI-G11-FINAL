import LogicBoard from "../Board/LogicBoard.js"
import { GraphicVertex } from "../Board/GraphicVertex.js";
import { GraphicSquare } from "../Board/GraphicSquare.js";
import EventDispatch from "../Event/EventDispatch.js"
import { SubmarineComplete} from "../Submarine/SubmarineComplete.js";
import Event from "../Event/Event.js";
// import { Orientation } from "../Submarine/Orientation.js";
import { ResourceManager_Complete } from "../Resources/ResourceManager.js";
// import { SubmarineInventory } from "../SubmarineInventory.js";
import { SubmarineHUD } from "../Submarine/SubmarineHUD.js";

import config from "./config.json" with {type:'json'}

export default class GameBoard extends Phaser.GameObjects.Container {
    /**
     * @param {*} scene El nombre de la escena
     * @param {Number} boardWidth El ancho del tablero
     * @param {Number} boardHeight El alto del tablero
     * @param {Number} x La posicion x de la esquina superior izquierda de donde esta el tablero
     * @param {Number} y La posicion y de la esquina superior izquierda de donde esta el tablero
     * @param {Array.<string>} texture La lista de texturas que utilizara el tablero
     * @param {Number} cellSize El tamaño de la celda
     */
    constructor(scene, boardWidth, boardHeight, x, y, texture, cellSize) {
        super(scene, x, y);
        this.active = true;
        
        this.texture = texture
        this.GRAPHIC = scene.add.graphics({ lineStyle: { width: 1, color: 0x00ff00 } });
        this.add(this.GRAPHIC)

        this.config = config;
        // this.data = {
        //     x: x,
        //     y: y,
        //     boardWidth: boardWidth,
        //     boardHeight: boardHeight,
        //     cellSize: cellSize,
        //     submarineLimit: {
        //         x: Math.round(boardWidth / 2),
        //         y: Math.round(boardHeight / 2),
        //     }
        // }

        this.matrix = {
            logic: new LogicBoard(config.boardWidth, config.boardHeight),
            graphic: null
        }

        this.matrix.graphic = this.graphicMatrixInitialize(boardWidth, boardHeight, this.matrix.logic)

        // Crear submarinos con la nueva clase
        this.submarines = {
            blue: new SubmarineComplete(scene, 3, 3, this.matrix.logic, this),   
            red:  new SubmarineComplete(scene, 2, 2, this.matrix.logic, this)  
        };

        this.submarines.blue.setTint(0x00aaff);
        this.submarines.red.setTint(0xff4444);
        this.submarines.blue.setAlpha(1);
        this.submarines.red.setAlpha(1);
        this.submarines.blue.setDepth(100);
        this.submarines.red.setDepth(100);

        this.initializeBackground(x, y, "BG");

        // Inicializar el ResourceManager
        this.resourceManager = new ResourceManager_Complete(scene, this);
        
        // Distribuir recursos en el mapa (8 recursos aleatorios)
        this.resourceManager.distributeRandomResources(8);

        // Crear HUDs para ambos jugadores
        this.huds = {
            blue: new SubmarineHUD(scene, this.submarines.blue, 10, 10, "Jugador Azul"),
            red: new SubmarineHUD(scene, this.submarines.red, 510, 10, "Jugador Rojo")
        };

        // Turno actual
        this.currentTurn = "red"; // Empieza el rojo

        // Configurar eventos
        this.setupEvents();

        this.render();
        console.log("Board created with resources and HUDs")
        scene.add.existing(this);
    }

    setupEvents() {
        EventDispatch.on(Event.TOGGLE_MAP, () => {
            this.refresh();
            console.log("Refreshed");
        })

        EventDispatch.on(Event.MOVE,(player,direction)=>{
            if(direction == 0) player.moveFront();
            if(direction == 90) player.moveRight();
            if(direction == -90) player.moveLeft();
            this.resourceManager.checkAndCollectResource(player);
            this.huds[this.currentTurn].update();
        })

        // EventDispatch.on(Event.MOVE,(direction,player)=>{
            
        // })

        // EventDispatch.on(Event.MOVE_RIGHT, () => {
        //     const submarine = this.submarines[this.currentTurn];
        //     if (submarine.moveRight()) {
        //         this.resourceManager.checkAndCollectResource(submarine);
        //         this.huds[this.currentTurn].update();
        //     }
        // })

        // EventDispatch.on(Event.MOVE_FRONT, () => {
        //     const submarine = this.submarines[this.currentTurn];
        //     if (submarine.moveFront()) {
        //         this.resourceManager.checkAndCollectResource(submarine);
        //         this.huds[this.currentTurn].update();
        //     }
        // })

        // EventDispatch.on(Event.MOVE_LEFT, () => {
        //     const submarine = this.submarines[this.currentTurn];
        //     if (submarine.moveLeft()) {
        //         this.resourceManager.checkAndCollectResource(submarine);
        //         this.huds[this.currentTurn].update();
        //     }
        // })

        EventDispatch.on(Event.SHOOT, () => {
            const attacker = this.submarines[this.currentTurn];
            const target = this.currentTurn === "red" ? this.submarines.blue : this.submarines.red;
            
            let isTarget1 = attacker.isTarget(target.position.x, target.position.y, 1)
            let isTarget2 = attacker.isTarget(target.position.x, target.position.y, 2)

            if (isTarget1 || isTarget2) console.log("Target!");

            this.showShootPopup(attacker, target, (direction, distance) => {
                if (!direction) {
                    console.log("No disparó");
                    return;
                }

                console.log("Disparo:", direction, "Distancia:", distance);
                
                let isTargetDir1 = isTarget1 && 
                    attacker.isTargetDir(target.position.x, target.position.y, 1, direction) && 
                    attacker.canShoot(distance);
                    
                let isTargetDir2 = isTarget2 && 
                    attacker.isTargetDir(target.position.x, target.position.y, 2, direction) && 
                    attacker.canShoot(distance);

                if (distance == 1) {
                    attacker.shoot(distance);
                    if (isTargetDir1) {
                        target.loseHealth(5);
                        console.log("¡Impacto! -5 HP");
                    }
                }
                if (distance == 2) {
                    attacker.shoot(distance);
                    if (isTargetDir2 || isTargetDir1) {
                        target.loseHealth(2);
                        console.log("¡Impacto! -2 HP");
                    }
                }

                // Actualizar ambos HUDs
                this.huds[this.currentTurn].update();
                const targetColor = this.currentTurn === "red" ? "blue" : "red";
                this.huds[targetColor].update();
            });
        });
    }

    render() {
        if (this.active) {
            this.matrix.graphic.forEach((row) => {
                row.forEach(point => {
                    if (point instanceof GraphicSquare) {
                        point.render();
                    }
                    if (point instanceof GraphicVertex) {
                        point.render();
                    }
                })
            })
        }
    }

    graphicMatrixInitialize(boardWidth, boardHeight, logic) {
        let aux = []
        for (let i = 0; i < boardWidth; ++i) {
            aux[i] = [];
            for (let j = 0; j < boardHeight; ++j) {
                this.createGraphicPoint(aux, i, j, logic);
            }
        }
        return aux;
    }

    initializeBackground(x, y, image) {
        let centerX = ((this.data.boardWidth - 1) * this.data.cellSize) / 2
        let centerY = ((this.data.boardHeight - 1) * this.data.cellSize) / 2  
        this.background_image = new Phaser.GameObjects.Image(this.scene, 0, 0, image);
        this.background_image.setPosition(centerX, centerY)

        let width = ((this.data.boardWidth - 1) * this.data.cellSize);
        let height = ((this.data.boardHeight - 1) * this.data.cellSize);
        this.background_image.setDisplaySize(width, height)
        this.scene.add.existing(this.background_image);
        this.background_image.setAlpha(0.2);

        this.add(this.background_image)
        this.moveDown(this.background_image)
    }

    createGraphicPoint(m, i, j, logic) {
        if ((i % 2 === 0) && (j % 2 === 0)) {
            m[i][j] = new GraphicVertex(this.scene, this.GRAPHIC, this.data.cellSize, logic.matrix[i][j], this.data.x, this.data.y);
        }
        else if ((i % 2 === 1) && (j % 2 === 1)) {
            m[i][j] = new GraphicSquare(this.scene, logic.matrix[i][j], "Square", this.data.cellSize, this.data.x, this.data.y);
            this.add(m[i][j])
        }
        else {
            m[i][j] = null;
        }
    }

    refresh() {
        this.active = !this.active;
        if (this.active) {
            this.setVisible(true);
        }
        else this.setVisible(false);
         
        this.render()
    }

    /**
     * Finaliza el turno actual
     */
    endTurn() {
        const currentSubmarine = this.submarines[this.currentTurn];
        
        // Aplicar efectos de fin de turno
        currentSubmarine.endTurn();
        
        // Actualizar HUD
        this.huds[this.currentTurn].update();
        
        // Cambiar turno
        this.currentTurn = this.currentTurn === "red" ? "blue" : "red";
        console.log(`Turno de: ${this.currentTurn}`);
    }

    showShootPopup(attacker, target, callback) {
        const scene = this.scene; 
        let popup2 = null;

        const overlay = scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.6)
            .setScrollFactor(0)
            .setDepth(1000);

        const panel = scene.add.rectangle(400, 300, 300, 220, 0xffffff, 1)
            .setStrokeStyle(2, 0x000000)
            .setScrollFactor(0)
            .setDepth(1001);

        const popup = scene.add.container(0, 0, [overlay, panel]).setDepth(1002);

        const boton = (text, y, action) => {
            const btn = scene.add.text(400, y, text, { fontSize: '20px', color: '#000' })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
                .setDepth(1003)
                .on("pointerdown", () => action());
            popup.add(btn);
        };

        boton("Derecha", 260, () => choose("right"));
        boton("Izquierda", 290, () => choose("left"));
        boton("Delante", 320, () => choose("front"));
        boton("No disparar", 350, () => close(null, null));

        const choose = (direction) => {
            popup.removeAll(true);
            popup.destroy(true); 

            const overlay2 = scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.6).setDepth(1000);
            const panel2 = scene.add.rectangle(400, 300, 300, 160, 0xffffff, 1).setStrokeStyle(2, 0x000000).setDepth(1001);

            popup2 = scene.add.container(0, 0, [overlay2, panel2]).setDepth(1002);

            const boton2 = (label, y, dist) => {
                const btn = scene.add.text(400, y, label, { fontSize: "20px", color: "#000" })
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                    .setDepth(1003)
                    .on("pointerdown", () => close(direction, dist));

                popup2.add(btn);
            };

            boton2("Distancia 1", 290, 1);
            boton2("Distancia 2", 330, 2);
        };

        const close = (direction, distance) => {
            if (popup) popup.destroy(true);
            if (popup2) popup2.destroy(true); 
            callback(direction, distance);
        };
    }

    /**
     * Update llamado cada frame
     */
    update() {
        // Actualizar HUDs
        this.huds.blue.update();
        this.huds.red.update();
        
        // Actualizar recursos
        this.resourceManager.update();
    }
}