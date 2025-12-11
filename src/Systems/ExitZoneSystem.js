/**
 * ExitZoneSystem.js
 * 
 * Sistema para crear y gestionar las zonas de salida
 * Según GDD 5.1.2: "En las esquinas opuestas a la esquina donde inicias"
 */

export class ExitZoneSystem {
    constructor(board) {
        this.board = board;
        this.zones = {
            red: null,
            blue: null
        };
        
        this.zoneSprites = {
            red: null,
            blue: null
        };
    }

    /**
     * Crea las zonas de salida basándose en las posiciones iniciales de los submarinos
     */
    createExitZones() {
        const w = this.board.config.boardWidth - 1;
        const h = this.board.config.boardHeight - 1;
        
        // Obtener posiciones iniciales de los submarinos
        const sub1Pos = this.board.submarines.red.position;
        const sub2Pos = this.board.submarines.blue.position;
        
        // Zona de salida ROJA (esquina opuesta a spawn de rojo)
        // Si rojo está en (2,2) (esquina superior izquierda), su salida es esquina inferior derecha
        this.zones.red = {
            x: w * 2,  // Esquina opuesta
            y: h * 2,
            color: 0xff4444,
            label: 'SALIDA\nROJO'
        };
        
        // Zona de salida AZUL (esquina opuesta a spawn de azul)
        this.zones.blue = {
            x: 0,
            y: 0,
            color: 0x4444ff,
            label: 'SALIDA\nAZUL'
        };
        
        // Visualizar las zonas
        this.visualizeZone(this.zones.red, 'red');
        this.visualizeZone(this.zones.blue, 'blue');
        
        console.log(`Zonas de salida creadas:`);
        console.log(`- Rojo: (${this.zones.red.x}, ${this.zones.red.y})`);
        console.log(`- Azul: (${this.zones.blue.x}, ${this.zones.blue.y})`);
        
        // Devolver las zonas para que GameBoard las almacene
        return this.zones;
    }

    /**
     * Visualiza una zona de salida con efectos
     */
    visualizeZone(zone, playerColor) {
        const cellSize = this.board.config.cellSize;
        const x = zone.x * cellSize;
        const y = zone.y * cellSize;
        
        // Container para la zona
        const container = this.board.scene.add.container(x, y);
        
        // FONDO CIRCULAR GRANDE 
        const bgCircle = this.board.scene.add.circle(0, 0, cellSize * 0.9, zone.color, 0.2);
        bgCircle.setStrokeStyle(4, zone.color, 0.8);
        
        //CÍRCULO MEDIO 
        const midCircle = this.board.scene.add.circle(0, 0, cellSize * 0.6, zone.color, 0.3);
        
        // ESTRELLA CENTRAL 
        const star = this.board.scene.add.star(
            0, 0,
            5,                    // 5 puntas
            cellSize * 0.25,     // radio interno
            cellSize * 0.5,      // radio externo
            zone.color,
            1
        );
        
        //TEXTO 
        const text = this.board.scene.add.text(0, 0, zone.label, {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Añadir todo al container
        container.add([bgCircle, midCircle, star, text]);
        
        // Añadir al board
        this.board.add(container);
        container.setDepth(50); // Por encima del tablero, debajo de submarinos
        
        // ANIMACIONES 
        
        // Pulsación del círculo exterior
        this.board.scene.tweens.add({
            targets: bgCircle,
            scale: 1.2,
            alpha: 0.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Rotación de la estrella
        this.board.scene.tweens.add({
            targets: star,
            angle: 360,
            duration: 4000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Pulsación del círculo medio
        this.board.scene.tweens.add({
            targets: midCircle,
            scale: 1.1,
            alpha: 0.5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 500
        });
        
        // Guardamos el sprite para futuras referencias
        this.zoneSprites[playerColor] = container;
    }

    /**
     * Verifica si un submarino está en una zona de salida
     */
    checkSubmarineInZone(submarine, zoneName) {
        const zone = this.zones[zoneName];
        if (!zone) return false;
        
        return submarine.position.x === zone.x && 
               submarine.position.y === zone.y;
    }

    /**
     * Reubica las zonas de salida (usado cuando el mapa se cierra)
     */
    relocateZones(newBounds) {
        console.log("Reubicando zonas de salida...");
    }

    /**
     * Muestra un efecto cuando un submarino entra en su zona
     */
    showEnterEffect(zoneName) {
        const container = this.zoneSprites[zoneName];
        if (!container) return;
        
        // Efecto de éxito
        const flash = this.board.scene.add.circle(
            container.x, 
            container.y, 
            this.board.config.cellSize * 2, 
            0xffff00, 
            0.8
        );
        this.board.add(flash);
        flash.setDepth(200);
        
        this.board.scene.tweens.add({
            targets: flash,
            scale: 3,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => flash.destroy()
        });
        
        // Partículas de celebración
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const particle = this.board.scene.add.star(
                container.x, 
                container.y,
                5, 5, 10,
                0xffff00, 
                1
            );
            this.board.add(particle);
            particle.setDepth(201);
            
            this.board.scene.tweens.add({
                targets: particle,
                x: container.x + Math.cos(angle) * 150,
                y: container.y + Math.sin(angle) * 150,
                alpha: 0,
                scale: 0,
                duration: 1500,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Destruye las zonas de salida
     */
    destroy() {
        Object.values(this.zoneSprites).forEach(sprite => {
            if (sprite) sprite.destroy();
        });
    }
}

