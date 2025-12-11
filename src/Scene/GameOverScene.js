/**
 * GameOverScene
 * 
 * Escena de fin de juego
 * 
 *  CORRECCIÓN: Ahora usa el sistema unificado de estilos (UIStyles.js)
 *  y tiene soporte completo de teclado + ratón
 * 
 * CONTROLES:
 * - R: Revancha (reiniciar partida)
 * - ESC: Volver al menú
 * - Click en botones
 */

// IMPORTAR sistema de estilos unificado
import { 
    UIStyles, 
    createOverlay, 
    createStyledPanel, 
    createStyledText, 
    createStyledButton 
} from '../UIStyles.js';

export class GameOverScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'GameOver' });
    }

    /**
     * Inicialización - Recibe datos del resultado de la partida
     * 
     * @param {Object} data - Datos del fin de juego
     * @param {string} data.winner - 'red' o 'blue'
     * @param {string} data.reason - 'elimination' o 'escape'
     * @param {Object} data.stats - Estadísticas de la partida
     */
    init(data) {
        this.winner = data.winner;
        this.reason = data.reason;
        this.stats = data.stats;
        
        console.log("=== FIN DE JUEGO ===");
        console.log(`   Ganador: ${this.winner}`);
        console.log(`   Razón: ${this.reason}`);
    }

    /**
     * Creación de la escena
     */
    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        console.log("Creando pantalla de Game Over...");
        
        // PASO 1: Fondo oscuro
        const overlay = createOverlay(this, 0.95);
        overlay.setDepth(1000);
        
        // PASO 2: Determinar datos del ganador
        const winnerColor = this.winner === 'red' ? 0xff4444 : 0x4444ff;
        const winnerColorHex = this.winner === 'red' ? '#ff4444' : '#4444ff';
        const winnerName = this.winner === 'red' ? 'CHINA (ROJO)' : 'JAPÓN (AZUL)';
        
        // PASO 3: Título principal según razón de victoria
        const titleText = this.reason === 'elimination' 
            ? '¡SUBMARINO DESTRUIDO!' 
            : '¡ZONA DE ESCAPE ALCANZADA!';
        
        const title = createStyledText(this, w/2, 100, titleText, 'title');
        title.setFontSize('42px');
        title.setColor('#ffff00');
        title.setStroke('#000000', 6);
        title.setOrigin(0.5);
        title.setDepth(1001);
        
        // PASO 4: Anuncio del ganador con efecto de brillo
        const winnerText = this.add.text(
            w/2, 180, 
            `VICTORIA: ${winnerName}`, 
            {
                fontSize: '48px',
                color: winnerColorHex,
                fontFamily: 'Arial',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            }
        );
        winnerText.setOrigin(0.5);
        winnerText.setDepth(1001);
        
        // Animación de brillo del ganador
        this.tweens.add({
            targets: winnerText,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // PASO 5: Panel de estadísticas
        this.createStatsPanel(w, h);
        
        // PASO 6: Botones de acción
        this.createButtons(w, h);
        
        // PASO 7: Efecto de celebración
        this.createCelebrationEffect(w/2, h/2, winnerColor);
        
        console.log("Pantalla de Game Over creada");
    }
    
    /**
     * Crea el panel de estadísticas
     * 
     * @param {Number} w - Ancho de la pantalla
     * @param {Number} h - Alto de la pantalla
     */
    createStatsPanel(w, h) {
        const panelY = 280;
        
        console.log("Creando panel de estadísticas...");
        
        // Panel semi-transparente
        const panel = createStyledPanel(this, w/2, panelY + 80, 500, 180);
        panel.setDepth(1001);
        
        // Título de estadísticas
        const statsTitle = createStyledText(
            this, w/2, panelY, 
            'ESTADÍSTICAS DE LA PARTIDA',
            'subtitle'
        );
        statsTitle.setColor('#00ff88');
        statsTitle.setOrigin(0.5);
        statsTitle.setDepth(1002);
        
        // Mostrar estadísticas (usando datos reales)
        const stats = [
            `Duración: ${this.stats.duration || '5:30'}`,
            `Total de turnos: ${this.stats.totalTurns || 0}`,
            `Disparos realizados: ${this.stats.totalShots || 'N/A'}`,
            `Impactos: ${this.stats.hits || 0}`,
            `Recursos recogidos: ${this.stats.resourcesCollected || 0}`,
            `Daño total: ${this.stats.totalDamage || 0} HP`
        ];
        
        stats.forEach((stat, index) => {
            const statText = createStyledText(
                this, 
                w/2, 
                panelY + 30 + (index * 25), 
                stat, 
                'body'
            );
            statText.setFontSize('16px');
            statText.setOrigin(0.5);
            statText.setDepth(1002);
        });
    }
    
    /**
     * Crea los botones de acción
     * 
     * @param {Number} w - Ancho de la pantalla
     * @param {Number} h - Alto de la pantalla
     */
    createButtons(w, h) {
        const buttonY = h - 120;
        
        console.log("Creando botones...");
    
        // BOTÓN REVANCHA con soporte de teclado (R)
        const revanchaBtn = createStyledButton(
            this,
            w/2 - 150,
            buttonY,
            '↻ REVANCHA',
            () => {
                // console.log("=== INICIANDO REVANCHA ===");
                
                // // CRÍTICO: Detener TODOS los tweens y timers de Game Over
                // console.log("  Deteniendo tweens de Game Over...");
                // this.tweens.killAll();
                // this.time.removeAllEvents();
                
                // console.log("  Cerrando Game Over...");
                // this.scene.stop('GameOver');
                
                // const gameScreen = this.scene.get('GameScreen');
                
                // if (gameScreen && typeof gameScreen.restartGame === 'function') {
                //     console.log("  Llamando a restartGame()...");
                //     gameScreen.restartGame();
                // } else {
                //     console.error(" No se pudo reiniciar GameScreen");
                // }
                this.scene.start("GameScreen")
                    },
            true,
            'R'
        );
        revanchaBtn.bg.setDepth(1002);
        revanchaBtn.label.setDepth(1003);

        // BOTÓN MENÚ con soporte de teclado (ESC)
        const menuBtn = createStyledButton(
            this,
            w/2 + 150,
            buttonY,
            '⌂ MENÚ',
            () => {
                console.log("=== VOLVIENDO AL MENÚ ===");
                
                // CRÍTICO: Detener TODOS los tweens y timers de Game Over
                console.log("  Deteniendo tweens de Game Over...");
                this.tweens.killAll();
                this.time.removeAllEvents();
                
                const gameScreen = this.scene.get('GameScreen');
                
                if (gameScreen) {
                    console.log("  Limpiando GameScreen...");
                    
                    if (gameScreen.tweens) {
                        gameScreen.tweens.killAll();
                    }
                    
                    if (gameScreen.tablero) {
                        if (gameScreen.tablero.zoneClosing) {
                            gameScreen.tablero.zoneClosing.destroy();
                        }
                        if (gameScreen.tablero.exitZoneSystem) {
                            gameScreen.tablero.exitZoneSystem.destroy();
                        }
                    }
                }
                
                console.log("  Deteniendo Game Over...");
                this.scene.stop('GameOver');
                
                console.log("  Deteniendo GameScreen...");
                this.scene.stop('GameScreen');
                
                // Usar timer desde scene manager (no desde this que ya está detenida)
                const sceneManager = this.scene.manager;
                
                // Intentar usar escena default/boot para el timer
                const bootScene = sceneManager.getScene('default');
                
                if (bootScene && bootScene.time) {
                    bootScene.time.delayedCall(200, () => {
                        console.log("  Iniciando menú...");
                        sceneManager.start('menu2');
                        console.log("Menú cargado");
                    });
                } else {
                    // Fallback: iniciar inmediatamente
                    console.log("  Iniciando menú (sin delay)...");
                    setTimeout(() => {
                        sceneManager.start('menu2');
                    }, 200);
                }
            },
            false,
            'ESC'
        );
        menuBtn.bg.setDepth(1002);
        menuBtn.label.setDepth(1003);
        
        // TEXTO DE AYUDA
        const helpText = createStyledText(
            this, w/2, buttonY + 50,
            'Presiona R para revancha | ESC para menú',
            'small'
        );
        helpText.setOrigin(0.5);
        helpText.setDepth(1002);
    }
    
    /**
     *  Crea efecto de celebración con partículas
     * 
     * @param {Number} x - Posición X
     * @param {Number} y - Posición Y
     * @param {Number} color - Color de las partículas
     */
    createCelebrationEffect(x, y, color) {
        console.log("Creando efecto de celebración...");
        
        // Partículas que caen desde arriba
        for (let i = 0; i < 30; i++) {
            this.time.delayedCall(i * 100, () => {
                const particle = this.add.circle(
                    Phaser.Math.Between(0, this.cameras.main.width),
                    0,
                    Phaser.Math.Between(3, 8),
                    color,
                    0.8
                );
                particle.setDepth(2000);
                
                this.tweens.add({
                    targets: particle,
                    y: this.cameras.main.height + 50,
                    duration: Phaser.Math.Between(2000, 4000),
                    ease: 'Sine.easeIn',
                    onComplete: () => particle.destroy()
                });
            });
        }
    }
}