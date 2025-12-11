export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    init(data) {
        this.winner = data.winner; // 'red' o 'blue'
        this.reason = data.reason; // 'elimination' o 'escape'
        this.stats = data.stats;  // Estadísticas de la partida
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        
        // Fondo oscuro
        this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.95);
        
        // Determinar color del ganador
        const winnerColor = this.winner === 'red' ? 0xff4444 : 0x4444ff;
        const winnerName = this.winner === 'red' ? 'ROJO' : 'AZUL';
        
        // Título principal
        const titleText = this.reason === 'elimination' 
            ? '¡SUBMARINO DESTRUIDO!' 
            : '¡ZONA DE ESCAPE ALCANZADA!';
        
        this.add.text(w/2, 100, titleText, {
            fontSize: '42px',
            fill: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Ganador con efecto de brillo
        const winnerText = this.add.text(w/2, 180, `VICTORIA: ${winnerName}`, {
            fontSize: '56px',
            fill: Phaser.Display.Color.IntegerToColor(winnerColor).rgba,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        // Animación de brillo del ganador
        this.tweens.add({
            targets: winnerText,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Estadísticas de la partida
        this.createStatsPanel(w, h);
        
        // Botones
        this.createButtons(w, h);
        
        // Partículas de celebración
        this.createCelebrationEffect(w/2, h/2, winnerColor);
    }
    
    createStatsPanel(w, h) {
        const panelY = 280;
        
        // Panel semi-transparente
        this.add.rectangle(w/2, panelY + 80, 500, 180, 0x1a1a1a, 0.9)
            .setStrokeStyle(3, 0xffffff);
        
        // Título de estadísticas
        this.add.text(w/2, panelY, 'ESTADÍSTICAS DE LA PARTIDA', {
            fontSize: '20px',
            fill: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Mostrar estadísticas
        const stats = [
            `Duración: ${this.stats.duration || '5:30'}`,
            `Total de turnos: ${this.stats.totalTurns || 0}`,
            `Disparos realizados: ${this.stats.totalShots || 0}`,
            `Impactos: ${this.stats.hits || 0}`,
            `Recursos recogidos: ${this.stats.resourcesCollected || 0}`,
            `Daño total infligido: ${this.stats.totalDamage || 0} HP`
        ];
        
        stats.forEach((stat, index) => {
            this.add.text(w/2, panelY + 30 + (index * 25), stat, {
                fontSize: '16px',
                fill: '#ffffff'
            }).setOrigin(0.5);
        });
    }
    
    createButtons(w, h) {
        const buttonY = h - 120;
        
        // Botón REVANCHA
        const revanchaBtn = this.add.rectangle(w/2 - 150, buttonY, 250, 70, 0x00ff88, 1);
        revanchaBtn.setStrokeStyle(4, 0xffffff);
        revanchaBtn.setInteractive({ useHandCursor: true });
        
        const revanchaText = this.add.text(w/2 - 150, buttonY, '↻ REVANCHA', {
            fontSize: '28px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Botón MENÚ
        const menuBtn = this.add.rectangle(w/2 + 150, buttonY, 250, 70, 0xff4444, 1);
        menuBtn.setStrokeStyle(4, 0xffffff);
        menuBtn.setInteractive({ useHandCursor: true });
        
        const menuText = this.add.text(w/2 + 150, buttonY, '⌂ MENÚ', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Efectos hover y click
        this.setupButton(revanchaBtn, revanchaText, () => {
            this.scene.start('GameScreen');
        });
        
        this.setupButton(menuBtn, menuText, () => {
            this.scene.start('menu');
        });
    }
    
    setupButton(btn, text, onClick) {
        btn.on('pointerover', () => {
            this.tweens.add({
                targets: [btn, text],
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });
        
        btn.on('pointerout', () => {
            this.tweens.add({
                targets: [btn, text],
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });
        
        btn.on('pointerdown', () => {
            this.tweens.add({
                targets: [btn, text],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: onClick
            });
        });
    }
    
    createCelebrationEffect(x, y, color) {
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