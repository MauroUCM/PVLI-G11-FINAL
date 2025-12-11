/**
 * AirAttackState_Mejorado.js
 * 
 * Sistema completo de ataque aéreo con selección en mapa
 * 
 * CARACTERÍSTICAS GDD 5.4.2:
 * - Alcance: cualquier casilla del mapa
 * - Área: 4 vértices de la casilla seleccionada
 * - Ejecución: al final de la ronda
 * - Cooldown: 3 turnos (empieza con 2)
 * - Daño: 40 HP
 * - Daño propio: SÍ
 */

import EventDispatch from "../../Event/EventDispatch.js";
import State from "../State.js";
import Event from "../../Event/Event.js";

export class AirAttackState extends State {
    
    /**
     * Teclas de control
     */
    confirmKey;
    cancelKey;
    
    /**
     * Sistema de selección en mapa
     */
    mapOverlay = null;
    selectedSquare = null;
    previewGraphics = null;
    
    constructor(stateMachine) {
        super(stateMachine);
        this._name = "Air Attack State";
    }

    onStateEnter() {
        EventDispatch.emit(Event.UPDATE_PLAYER_ACTION_TEXT, "Air Attack");
        
        const currentPlayer = this.stateMachine.context.currentState.id;
        
        // Obtener submarino actual
        let currentSubmarine = null;
        EventDispatch.emit(Event.GET_SUBMARINE, 
            currentPlayer === 1 ? "red" : "blue", 
            {
                callBack: (sub) => {
                    currentSubmarine = sub;
                }
            }
        );
        
        // Verificar si el ataque aéreo está disponible
        if (!currentSubmarine || !currentSubmarine.canUseAerialAttack()) {
            console.log(`Ataque aéreo en cooldown: ${currentSubmarine.aerialCooldown} turnos`);
            this.showCooldownMessage(currentSubmarine.aerialCooldown);
            
            // Saltar este estado
            this.time.delayedCall(1500, () => {
                this.transition();
            });
            return;
        }
        
        // Activar interfaz de selección
        this.activateAirAttackSelection(currentSubmarine);
        
        // Configurar teclas
        if (currentPlayer == 1) {
            this.confirmKey = this.stateMachine.scene.input.keyboard.addKey("ENTER");
            this.cancelKey = this.stateMachine.scene.input.keyboard.addKey('S');
        } else if (currentPlayer == 2) {
            this.confirmKey = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ENTER);
            this.cancelKey = this.stateMachine.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        }
        
        // Eventos
        this.confirmKey.on("down", () => {
            if (this.selectedSquare) {
                this.executeAirAttack(currentSubmarine);
            }
        });
        
        this.cancelKey.on("down", () => {
            console.log("Ataque aéreo cancelado");
            this.deactivateAirAttackSelection();
            this.transition();
        });
    }

    onStateExit() {
        EventDispatch.emit(Event.MOVE_DRAGON);
        
        // Limpiar eventos
        if (this.confirmKey) this.confirmKey.off("down");
        if (this.cancelKey) this.cancelKey.off("down");
        
        // Limpiar interfaz
        this.deactivateAirAttackSelection();
    }

    transition() {
        this.stateMachine.transition(this.stateMachine.stateList.healState);
    }

    /**
     * Muestra mensaje de cooldown
     */
    showCooldownMessage(cooldown) {
        const scene = this.stateMachine.scene;
        
        const msg = scene.add.text(400, 300,
            `⏱️ ATAQUE AÉREO EN COOLDOWN\n\n` +
            `Disponible en: ${cooldown} turno${cooldown === 1 ? '' : 's'}`,
            {
                fontSize: '24px',
                fill: '#ffaa00',
                fontStyle: 'bold',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 20, y: 15 }
            }
        ).setOrigin(0.5).setDepth(3000);
        
        scene.tweens.add({
            targets: msg,
            alpha: 0,
            duration: 500,
            delay: 1000,
            onComplete: () => msg.destroy()
        });
    }

    /**
     * Activa la interfaz de selección de ataque aéreo
     */
    activateAirAttackSelection(submarine) {
        const scene = this.stateMachine.scene;
        let board = null;
        
        EventDispatch.emit(Event.GET_GAMEBOARD, {
            boardCallback: (b) => { board = b; }
        });
        
        if (!board) return;
        
        // OVERLAY OSCURO 
        this.mapOverlay = scene.add.rectangle(
            400, 300, 800, 600,
            0x000000, 0.7
        ).setDepth(2500).setInteractive();
        
        // TÍTULO
        const title = scene.add.text(400, 50,
            '🎯 SELECCIONAR OBJETIVO DE BOMBARDEO 🎯',
            {
                fontSize: '24px',
                fill: '#ff0000',
                fontStyle: 'bold',
                backgroundColor: '#000000',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5).setDepth(2501);
        
        //  INSTRUCCIONES
        const instructions = scene.add.text(400, 90,
            'Haz CLICK en una casilla del mapa\n' +
            'ENTER: Confirmar | S/DOWN: Cancelar',
            {
                fontSize: '14px',
                fill: '#ffff00',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(2501);
        
        // HACER VISIBLES LAS CASILLAS 
        const squares = board.matrix.graphic.filter(row =>
            row.filter(cell => cell && cell.square)
        ).flat();
        
        squares.forEach(graphicSquare => {
            if (!graphicSquare || !graphicSquare.square) return;
            
            // Hacer la casilla más visible y clickeable
            graphicSquare.setAlpha(0.4);
            graphicSquare.setDepth(2502);
            graphicSquare.setInteractive();
            
            // Hover effect
            graphicSquare.on('pointerover', () => {
                graphicSquare.setAlpha(0.7);
                graphicSquare.setTint(0xff0000);
                
                // Mostrar preview de área de efecto
                this.showAreaPreview(graphicSquare.square, board);
            });
            
            graphicSquare.on('pointerout', () => {
                graphicSquare.setAlpha(0.4);
                graphicSquare.clearTint();
                
                // Ocultar preview
                this.hideAreaPreview();
            });
            
            // Click para seleccionar
            graphicSquare.on('pointerdown', () => {
                this.selectedSquare = graphicSquare.square;
                
                // Feedback visual de selección
                graphicSquare.setTint(0xff0000);
                graphicSquare.setAlpha(0.9);
                
                // Mostrar confirmación
                this.showSelectionConfirm(graphicSquare.square, board);
            });
        });
        
        // Guardar referencias para limpieza
        this.mapOverlay.title = title;
        this.mapOverlay.instructions = instructions;
        this.mapOverlay.squares = squares;
    }

    /**
     * Muestra preview del área de efecto
     */
    showAreaPreview(square, board) {
        this.hideAreaPreview();
        
        const scene = this.stateMachine.scene;
        const cellSize = board.config.cellSize;
        
        this.previewGraphics = scene.add.graphics();
        this.previewGraphics.setDepth(2503);
        
        // Dibujar los 4 vértices que serán afectados
        square.nextPoint.forEach(vertex => {
            if (vertex) {
                this.previewGraphics.fillStyle(0xff0000, 0.5);
                this.previewGraphics.fillCircle(
                    vertex.position.x * cellSize,
                    vertex.position.y * cellSize,
                    cellSize * 0.4
                );
                
                this.previewGraphics.lineStyle(2, 0xff0000);
                this.previewGraphics.strokeCircle(
                    vertex.position.x * cellSize,
                    vertex.position.y * cellSize,
                    cellSize * 0.4
                );
            }
        });
        
        board.add(this.previewGraphics);
    }

    /**
     * Oculta preview del área de efecto
     */
    hideAreaPreview() {
        if (this.previewGraphics) {
            this.previewGraphics.destroy();
            this.previewGraphics = null;
        }
    }

    /**
     * Muestra confirmación de selección
     */
    showSelectionConfirm(square, board) {
        const scene = this.stateMachine.scene;
        
        const confirm = scene.add.text(400, 550,
            `Objetivo seleccionado: Casilla (${square.position.x}, ${square.position.y})\n` +
            `Presiona ENTER para CONFIRMAR`,
            {
                fontSize: '18px',
                fill: '#00ff00',
                fontStyle: 'bold',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 15, y: 10 }
            }
        ).setOrigin(0.5).setDepth(2504);
        
        // Animación de parpadeo
        scene.tweens.add({
            targets: confirm,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Guardar para limpieza
        if (this.mapOverlay) {
            this.mapOverlay.confirm = confirm;
        }
    }

    /**
     * Ejecuta el ataque aéreo
     */
    executeAirAttack(submarine) {
        if (!this.selectedSquare) return;
        
        console.log(`Ejecutando ataque aéreo en casilla (${this.selectedSquare.position.x}, ${this.selectedSquare.position.y})`);
        
        // Usar ataque aéreo (activa cooldown)
        submarine.useAerialAttack();
        
        // Marcar la casilla para explosión al final de ronda
        this.selectedSquare.pendingAirAttack = {
            attacker: submarine,
            damage: 40 // Daño según GDD
        };
        
        // Efecto visual inmediato
        this.showLaunchEffect(submarine);
        
        // Desactivar interfaz
        this.deactivateAirAttackSelection();
        
        // Continuar al siguiente estado
        this.transition();
    }

    /**
     * Muestra efecto de lanzamiento
     */
    showLaunchEffect(submarine) {
        const scene = this.stateMachine.scene;
        
        // Mensaje de lanzamiento
        const msg = scene.add.text(400, 300,
            '🚀 BOMBARDEO LANZADO 🚀\n\n' +
            'Impactará al final de la ronda',
            {
                fontSize: '28px',
                fill: '#ff0000',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(3000);
        
        msg.setScale(0);
        scene.tweens.add({
            targets: msg,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                scene.tweens.add({
                    targets: msg,
                    alpha: 0,
                    duration: 500,
                    delay: 1000,
                    onComplete: () => msg.destroy()
                });
            }
        });
        
        // Shake de pantalla
        scene.cameras.main.shake(300, 0.01);
        
        // Flash rojo
        scene.cameras.main.flash(200, 255, 100, 0);
    }

    /**
     * Desactiva la interfaz de selección
     */
    deactivateAirAttackSelection() {
        if (!this.mapOverlay) return;
        
        // Limpiar overlay
        if (this.mapOverlay.title) this.mapOverlay.title.destroy();
        if (this.mapOverlay.instructions) this.mapOverlay.instructions.destroy();
        if (this.mapOverlay.confirm) this.mapOverlay.confirm.destroy();
        
        // Restaurar casillas
        if (this.mapOverlay.squares) {
            this.mapOverlay.squares.forEach(sq => {
                if (sq && sq.setAlpha) {
                    sq.setAlpha(0.01);
                    sq.clearTint();
                    sq.setDepth(0);
                    sq.removeInteractive();
                    sq.off('pointerover');
                    sq.off('pointerout');
                    sq.off('pointerdown');
                }
            });
        }
        
        this.mapOverlay.destroy();
        this.mapOverlay = null;
        
        // Limpiar preview
        this.hideAreaPreview();
        
        // Limpiar selección
        this.selectedSquare = null;
    }
}

/**
 * RESOLUCIÓN DE ATAQUES AÉREOS AL FINAL DE RONDA
 * ===============================================
 * 
 * En CheckState.js, al inicio de onStateEnter():
 * 
 * ```javascript
 * onStateEnter() {
 *     // RESOLVER ATAQUES AÉREOS PENDIENTES
 *     this.resolveAirAttacks();
 *     
 *     // ... resto del código
 * }
 * 
 * resolveAirAttacks() {
 *     let board = null;
 *     EventDispatch.emit(Event.GET_GAMEBOARD, {
 *         boardCallback: (b) => { board = b; }
 *     });
 *     
 *     if (!board) return;
 *     
 *     // Buscar casillas con ataques pendientes
 *     board.matrix.logic.matrix.forEach(row => {
 *         row.forEach(cell => {
 *             if (cell && cell.pendingAirAttack) {
 *                 console.log(`Resolviendo bombardeo en (${cell.position.x}, ${cell.position.y})`);
 *                 
 *                 // Explotar en los 4 vértices
 *                 cell.nextPoint.forEach(vertex => {
 *                     if (vertex && vertex.submarine) {
 *                         vertex.submarine.loseHealth(cell.pendingAirAttack.damage);
 *                         console.log(`${vertex.submarine.name} recibió ${cell.pendingAirAttack.damage} de daño`);
 *                     }
 *                 });
 *                 
 *                 // Efecto visual de explosión
 *                 this.showExplosionEffect(cell, board);
 *                 
 *                 // Limpiar
 *                 delete cell.pendingAirAttack;
 *             }
 *         });
 *     });
 *     
 *     // Actualizar HUDs
 *     if (board.huds) {
 *         board.huds.red.update();
 *         board.huds.blue.update();
 *     }
 * }
 * 
 * showExplosionEffect(cell, board) {
 *     const cellSize = board.config.cellSize;
 *     const x = cell.position.x * cellSize;
 *     const y = cell.position.y * cellSize;
 *     
 *     // Explosión grande
 *     const explosion = this.stateMachine.scene.add.circle(x, y, cellSize * 2, 0xff0000, 0.8);
 *     board.add(explosion);
 *     explosion.setDepth(500);
 *     
 *     this.stateMachine.scene.tweens.add({
 *         targets: explosion,
 *         scale: 3,
 *         alpha: 0,
 *         duration: 1000,
 *         ease: 'Cubic.easeOut',
 *         onComplete: () => explosion.destroy()
 *     });
 *     
 *     // Shake y flash
 *     this.stateMachine.scene.cameras.main.shake(500, 0.02);
 *     this.stateMachine.scene.cameras.main.flash(300, 255, 0, 0);
 * }
 * ```
 */