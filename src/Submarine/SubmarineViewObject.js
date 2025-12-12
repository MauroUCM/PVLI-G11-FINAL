
//TODO:
//Vincular las vistas con el tablero y el submarino de verdad, pasandole a esto como parametros

import { Orientation } from "./SubmarineComplete.js";

export default class SubmarineView extends Phaser.GameObjects.Container{
/**
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {SubmarineComplete} redSubmarine  - El submarino rojo
     * @param {SubmarineComplete} blueSubmarine - El submarino azul
     * @param {Number} x - Posición X del HUD
     * @param {Number} y - Posición Y del HUD
     * @param {String} playerName - Nombre del jugador ("Jugador 1" o "Jugador 2")
     * @param {LogicBoard} board - Tablero del juego
     */
    constructor(scene,x,y, board, redSubmarine, blueSubmarine){
        super(scene,x,y)

        this.scene = scene;
        this.active = true;

        // imagen de fondo
        this.imId = "SubWindow";

        // pantalla
        this.screenWidth = scene.cameras.main.width;   // 800
        this.screenHeight = scene.cameras.main.height - 100; // 600
        this.setSize(this.screenWidth,this.screenHeight);
      
        // pasaer referencias
        this.tablero = board;
        this.redSubmarine = redSubmarine;
        this.blueSubmarine = blueSubmarine;

        this.toggleKey = this.scene.input.keyboard.addKey('M');

         //calcular centros de las ventanas
        this.centerY = this.screenHeight / 2 + 50; // vertical es la misma
        this.centerXiz = this.screenWidth / 6;
        this.centerX = this.screenWidth / 2;
        this.centerXder = this.screenWidth  - (this.screenWidth / 6) ;

     
        this.initialize();

        this.toggleKey.on("down",()=>{
            this.refresh();
        }) 
        scene.add.existing(this)

        if (this.tablero.isActive()) {
            this.setVisible(false);
        }

        
        this.sub = this.scene.add.image(this.centerX, this.centerY, "sFront" ).setDisplaySize(250,250);
        this.add(this.sub);
        this.sub.setAlpha(0)

        this.tablero.huds.red.container.setAlpha(0);
        this.tablero.huds.blue.container.setAlpha(0);

        this.renderView();

    }

    initialize(){

        const enemySub = this.tablero.submarines[this.tablero.submarines.currentTurn];
        const mySub = this.tablero.submarines.currentTurn === "red" ? this.tablero.submarines.blue : this.tablero.submarines.red;

        //Crear las ventanas del submarino con espacio para el resto de cosas
        this.createPlayerViews(0, 50, this.screenWidth, this.screenHeight)
       
       
    }


    createPlayerViews(x, y, width, height) {
        const viewWidth = width / 3;
        
       //LATERAL IZQUIERDA
        this.createSingleView(
            x,
            y,
            viewWidth,
            height
        );
        
        // VISTA FRONTAL (Centro)
        this.createSingleView(
            x + viewWidth,
            y,
            viewWidth,
            height
        );
        
        // VISTA LATERAL DERECHA
        this.createSingleView(
            x + (viewWidth * 2),
            y,
            viewWidth,
            height
        );
    }

    //Crear una ventanas
    createSingleView(x, y, width, height) {

      // Cargar imagen de fondo
        const waterBg = this.scene.add.image(
            x + width / 2,
            y + height / 2, 
            this.imId
        );
        this.add(waterBg);
       
        waterBg.setDisplaySize(width, height - 20); 
    }

    //Esto sirve de render 
    // si se ve un submarino, lo pinta en la vista correspondiente
    renderView() 
    {
        //por si acaso
        this.sub.setAlpha(0)
        this.sub.setPosition(this.centerX, this.centerY);
        this.sub.setDisplaySize(150,150); 

        // condiciones
        let front = null
        let right = null
        let left = null

        let front2 = null
        let right2 = null
        let left2 = null

        //Logica para que aparezca y a distintas distancias
       
        if ( this.tablero.currentTurn === "blue")
        {
            this.sub.setTint(0xff0000); // tintar para diferenciar LUEGO QUITAR

            front = this.onDistance1(this.tablero.submarines.blue, this.tablero.submarines.red, "front")
            right = this.onDistance1(this.tablero.submarines.blue, this.tablero.submarines.red, "right")
            left = this.onDistance1(this.tablero.submarines.blue, this.tablero.submarines.red, "left")

            front2 = this.onDistance2(this.tablero.submarines.blue, this.tablero.submarines.red, "front")
            right2 = this.onDistance2(this.tablero.submarines.blue, this.tablero.submarines.red, "right")
            left2 = this.onDistance2(this.tablero.submarines.blue, this.tablero.submarines.red, "left")

            this.paintSub(front, right, left, front2, right2, left2);

            let me = this.tablero.submarines.blue;
            let enemy = this.tablero.submarines.red;

            this.checkRotations(me, enemy, front, right, left, front2, right2, left2);
             
        }
        else
        {
            this.sub.setTint(0x0000ff);

            front = this.onDistance1(this.tablero.submarines.red, this.tablero.submarines.blue, "front")
            right = this.onDistance1(this.tablero.submarines.red, this.tablero.submarines.blue, "right")
            left = this.onDistance1(this.tablero.submarines.red, this.tablero.submarines.blue, "left")

            front2 = this.onDistance2(this.tablero.submarines.red, this.tablero.submarines.blue, "front")
            right2 = this.onDistance2(this.tablero.submarines.red, this.tablero.submarines.blue, "right")
            left2 = this.onDistance2(this.tablero.submarines.red, this.tablero.submarines.blue, "left")

            this.paintSub(front, right, left, front2, right2, left2);

            let me = this.tablero.submarines.red;
            let enemy = this.tablero.submarines.blue;

             this.checkRotations(me, enemy, front, right, left, front2, right2, left2);
            
        }

        //Logica para pintar el submarino enemigo segun el lado que el atacante este mirando
        let thisDir = this.tablero.submarines[this.tablero.currentTurn].orientation
        let enemyDir = this.tablero.submarines[this.tablero.currentTurn === "red" ? "blue" : "red"].orientation
 
        
      
        
    }

    paintSub(front, right, left, front2, right2, left2)
    {
        let rotar = 10;
        if (front){
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerX, this.centerY); 
                this.sub.setDisplaySize(250,250); // mas cerca para dist 1 
                
            }

            if (front2){
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerX, this.centerY); 
                this.sub.setDisplaySize(150,150); 
            }
            
           
            if (right ){
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerXder, this.centerY);
                this.sub.setDisplaySize(150,150);
                this.sub.setAngle(rotar);
            }

            if (right2){
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerXder, this.centerY);
                this.sub.setDisplaySize(50,50);
                this.sub.setAngle(rotar);
            }

            if (left){
            
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerXiz, this.centerY);
                this.sub.setDisplaySize(150,150);
                this.sub.setAngle(0 - rotar);
            }

            if (left2){
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerXiz, this.centerY);
                this.sub.setDisplaySize(50,50);
                this.sub.setAngle(0 - rotar);
            }   

            if (!front && !right && !left && !front2 && !right2 && !left2) this.sub.setAlpha(0); 
    }

    //Comprobar si el submarino enemigo esta en rango 1 o 2
    onDistance1(attacker, target, direction)
    {
        //Calcula si los submarinos estan en rango de verse - usar isTargetDIr para pintar la vista en especifica 
        let isTarget1 = attacker.isTarget(target.position.x, target.position.y, 1)

        let isTargetDir1 = isTarget1 && attacker.isTargetDir(target.position.x, target.position.y, 1, direction)

        return isTargetDir1;
    }
    
    onDistance2(attacker, target, direction)
    {
        let isTarget2 = attacker.isTarget(target.position.x, target.position.y, 2)
        
        let isTargetDir2 = isTarget2 &&  attacker.isTargetDir(target.position.x, target.position.y, 2, direction) 

        return isTargetDir2;
    }


    
    refresh() {
        this.active = !this.active;

        
        if (this.active) {
            this.setVisible(true);
            this.tablero.huds.red.container.setAlpha(1);
            this.tablero.huds.blue.container.setAlpha(1);
        }
        else {this.setVisible(false)
            this.tablero.huds.red.container.setAlpha(0);
            this.tablero.huds.blue.container.setAlpha(0);
        };

         
        // this.render()
    }

    changeSprite(rotation)
    {
        switch (rotation) {
            case 'front':
                this.sub.setTexture("sFront");
                break;
            case 'back':
                this.sub.setTexture("sBack");
                break;
            case 'right':
                this.sub.setTexture("sRight");
                break; 
            case 'left':
                this.sub.setTexture("sLeft");
                break;
        }
    }

    checkRotations(me, enemy, front, right, left, front2, right2, left2)
    {
        if (front || front2)
            {
                if (me.orientation === Orientation.N)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("back");
                    if (enemy.orientation == Orientation.S) this.changeSprite("front");
                    if (enemy.orientation == Orientation.E) this.changeSprite("right");
                    if (enemy.orientation == Orientation.W) this.changeSprite("left");
                }
                if (me.orientation === Orientation.S)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("front");
                    if (enemy.orientation == Orientation.S) this.changeSprite("back");
                    if (enemy.orientation == Orientation.E) this.changeSprite("left");
                    if (enemy.orientation == Orientation.W) this.changeSprite("right");
                }
                if (me.orientation === Orientation.E)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("left");
                    if (enemy.orientation == Orientation.S) this.changeSprite("right");
                    if (enemy.orientation == Orientation.E) this.changeSprite("back");
                    if (enemy.orientation == Orientation.W) this.changeSprite("front");
                }
                if (me.orientation === Orientation.W)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("right");
                    if (enemy.orientation == Orientation.S) this.changeSprite("left");
                    if (enemy.orientation == Orientation.E) this.changeSprite("front");
                    if (enemy.orientation == Orientation.W) this.changeSprite("back");
                }
            }

            if (right || right2)
            {
                if (me.orientation === Orientation.N)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("right");
                    if (enemy.orientation == Orientation.S) this.changeSprite("left");
                    if (enemy.orientation == Orientation.E) this.changeSprite("back");
                    if (enemy.orientation == Orientation.W) this.changeSprite("front");
                }
                if (me.orientation === Orientation.S)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("left");
                    if (enemy.orientation == Orientation.S) this.changeSprite("right");
                    if (enemy.orientation == Orientation.E) this.changeSprite("front");
                    if (enemy.orientation == Orientation.W) this.changeSprite("back");
                }
                if (me.orientation === Orientation.E)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("back");
                    if (enemy.orientation == Orientation.S) this.changeSprite("front");
                    if (enemy.orientation == Orientation.E) this.changeSprite("right");
                    if (enemy.orientation == Orientation.W) this.changeSprite("left");
                }
                if (me.orientation === Orientation.W)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("front");
                    if (enemy.orientation == Orientation.S) this.changeSprite("back");
                    if (enemy.orientation == Orientation.E) this.changeSprite("left");
                    if (enemy.orientation == Orientation.W) this.changeSprite("right");
                }
            }
            
            if (left || left2)
            {
                if (me.orientation === Orientation.N)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("left");
                    if (enemy.orientation == Orientation.S) this.changeSprite("right");
                    if (enemy.orientation == Orientation.E) this.changeSprite("front");
                    if (enemy.orientation == Orientation.W) this.changeSprite("back");
                }
                if (me.orientation === Orientation.S)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("right");
                    if (enemy.orientation == Orientation.S) this.changeSprite("left");
                    if (enemy.orientation == Orientation.E) this.changeSprite("back");
                    if (enemy.orientation == Orientation.W) this.changeSprite("front");
                }   
                if (me.orientation === Orientation.E)

                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("front");
                    if (enemy.orientation == Orientation.S) this.changeSprite("back");
                    if (enemy.orientation == Orientation.E) this.changeSprite("left");
                    if (enemy.orientation == Orientation.W) this.changeSprite("right");
                }
                if (me.orientation === Orientation.W)
                {
                    if (enemy.orientation == Orientation.N) this.changeSprite("back");
                    if (enemy.orientation == Orientation.S) this.changeSprite("front");
                    if (enemy.orientation == Orientation.E) this.changeSprite("right");
                    if (enemy.orientation == Orientation.W) this.changeSprite("left");
                }
            }
    }

}