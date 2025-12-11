/**
 * SubmarineHUD
 * Clase para mostrar la información del submarino en pantalla
 */
export class SubmarineHUD {
    /**
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {SubmarineComplete} submarine - El submarino a monitorear
     * @param {Number} x - Posición X del HUD
     * @param {Number} y - Posición Y del HUD
     * @param {String} playerName - Nombre del jugador ("Jugador 1" o "Jugador 2")
     */
    constructor(scene, submarine, x, y, playerName) {
        this.scene = scene;
        this.submarine = submarine;
        this.x = x;
        this.y = y;
        this.playerName = playerName;
        this.screenWidth = scene.cameras.main.width;   // 800
        this.screenHeight = scene.cameras.main.height; // 600

        // Contenedor del HUD
        this.container = scene.add.container(x, y);
        this.container.setDepth(1000); // Siempre visible

        this.createHUD();
    }

    /**
     * Crea todos los elementos visuales del HUD
     */
    createHUD() {
        const style = {
            fontSize: '14px',
            color: '#443521ff',
            fontFamily: 'Arial'
        };

        const smallStyle = {
            fontSize: '12px',
            color: '#443521ff',
            fontFamily: 'Arial'
        };

        // Fondo hud
        this.background = this.scene.add.rectangle(0, 0, 280, 180, 0x00CC9966, 1);
        this.background.setOrigin(0, 0);
        this.container.add(this.background);

   
        // Nombre del jugador
        this.playerNameText = this.scene.add.text(10, 10, this.playerName, {
            fontSize: '16px',
            color: '#553c28ff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.container.add(this.playerNameText);

        // Barra de vida
        this.hpLabel = this.scene.add.text(10, 35, 'Vida:', style);
        this.container.add(this.hpLabel);

        // Fondo de la barra de vida
        this.hpBarBackground = this.scene.add.rectangle(60, 43, 200, 20, 0x00999966);
        this.hpBarBackground.setOrigin(0, 0.5);
        this.container.add(this.hpBarBackground);

        // Barra de vida (relleno)
        this.hpBar = this.scene.add.rectangle(60, 43, 200, 20, 0x00339999);
        this.hpBar.setOrigin(0, 0.5);
        this.container.add(this.hpBar);

        // Texto de HP numérico
        this.hpText = this.scene.add.text(265, 35, '100/100', smallStyle);
        this.hpText.setOrigin(1, 0);
        this.container.add(this.hpText);

        // Munición
        this.ammoLabel = this.scene.add.text(10, 65, 'Munición:', style);
        this.container.add(this.ammoLabel);

        this.ammoText = this.scene.add.text(100, 65, 'Corta: 15 | Larga: 15', smallStyle);
        this.container.add(this.ammoText);

        // Ataque aéreo
        this.aerialLabel = this.scene.add.text(10, 93, 'Ataque Aéreo:', style);
        this.container.add(this.aerialLabel);

        this.aerialText = this.scene.add.text(130, 93, 'Cooldown: 2', smallStyle);
        this.container.add(this.aerialText);

        // Inventario
        this.inventoryLabel = this.scene.add.text(10, 115, 'Inventario:', style);
        this.container.add(this.inventoryLabel);

        this.inventoryText = this.scene.add.text(10, 135, '', smallStyle);
        this.container.add(this.inventoryText);

        // Estado (fugas, restricciones)
        this.statusText = this.scene.add.text(10, 155, '', {
            fontSize: '12px',
            color: '#c23434ff',
            fontFamily: 'Arial'
        });
        this.container.add(this.statusText);

        // Actualizar información inicial
        this.update();
    }

    /**
     * Actualiza toda la información del HUD
     */
    update() {
        // Actualizar barra de vida
        const hpPercent = this.submarine.currentHP / this.submarine.maxHP;
        this.hpBar.width = 200 * hpPercent;
        
        // Cambiar color según la vida
        if (hpPercent > 0.5) {
            this.hpBar.fillColor = 0x00339999; // Verde
        } else if (hpPercent > 0.25) {
            this.hpBar.fillColor = 0x00CCCC33; // Amarillo
        } else {
            this.hpBar.fillColor = 0x00CC3300; // Rojo
        }

        this.hpText.setText(`${this.submarine.currentHP}/${this.submarine.maxHP}`);

            
        const MAX_M1 = 3;
        const MAX_M2 = 2;

        
        const mun1Raw = (this.submarine && typeof this.submarine.mun1 === 'number') ? this.submarine.mun1 : 0;
        const mun2Raw = (this.submarine && typeof this.submarine.mun2 === 'number') ? this.submarine.mun2 : 0;

       
        const m1_full = Phaser.Math.Clamp(mun1Raw, 0, MAX_M1);
        const m2_full = Phaser.Math.Clamp(mun2Raw, 0, MAX_M2);

        
        const m1 = "●".repeat(m1_full) + "○".repeat(MAX_M1 - m1_full);
        const m2 = "●".repeat(m2_full) + "○".repeat(MAX_M2 - m2_full);

        this.ammoText.setText(`Corta: ${m1}\nLarga: ${m2}`);
       // this.ammoText.setText(`Corta: ${this.submarine.mun1} | Larga: ${this.submarine.mun2}`);

        // Actualizar ataque aéreo
        if (this.submarine.aerialCooldown <= 0) {
            this.aerialText.setText('DISPONIBLE');
            this.aerialText.setColor('#4fbd4fff');
        } else {
            this.aerialText.setText(`Cooldown: ${this.submarine.aerialCooldown}`);
            // this.aerialText.setColor('#443521ff');
        }

        // Actualizar inventario
        const inv = this.submarine.inventory;
        let invText = `Kits: ${inv.repairKits} | Reductores: ${inv.cooldownReducers}\n`;
        invText += `Limitadores: ${inv.movementLimiters}`;
        this.inventoryText.setText(invText);

        // Actualizar estado
        let status = '';
        if (this.submarine.hasLeaks) {
            status += 'FUGAS ';
        }
        if (this.submarine.movementRestricted) {
            status += 'MOVIMIENTO LIMITADO ';
        }
        this.statusText.setText(status);
    }

    /**
     * Muestra el HUD
     */
    show() {
        this.container.setVisible(true);
    }

    /**
     * Oculta el HUD
     */
    hide() {
        this.container.setVisible(false);
    }

    /**
     * Destruye el HUD
     */
    destroy() {
        this.container.destroy();
    }

    /**
     * Cambia la posición del HUD
     */
    setPosition(x, y) {
        this.container.setPosition(x, y);
    }
}