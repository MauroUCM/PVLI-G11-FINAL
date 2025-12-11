
//TODO:
//Vincular las vistas con el tablero y el submarino de verdad, pasandole a esto como parametros

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
        this.sub.setAlpha(0)
         this.sub.setPosition(this.centerX, this.centerY);
       
        if ( this.tablero.currentTurn === "blue")
        {
            this.sub.setTint(0xff0000);
             let front = this.onDistance1(this.tablero.submarines.blue, this.tablero.submarines.red, "front")
              let right = this.onDistance1(this.tablero.submarines.blue, this.tablero.submarines.red, "right")
                let left = this.onDistance1(this.tablero.submarines.blue, this.tablero.submarines.red, "left")
            if (front){
           
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerX, this.centerY);
           
            }
           
            
            if (right){
            
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerXder, this.centerY);
           
            }
             

            if (left){
            
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerXiz, this.centerY);
            
            }

            if (!front && !right && !left) this.sub.setAlpha(0);
             
        }
        else
        {
            let front = this.onDistance1(this.tablero.submarines.red, this.tablero.submarines.blue, "front")
                let right = this.onDistance1(this.tablero.submarines.red, this.tablero.submarines.blue, "right")
                let left = this.onDistance1(this.tablero.submarines.red, this.tablero.submarines.blue, "left")
            if (front){
           
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerX, this.centerY);
           
            }

           
            if (right){
            
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerXder, this.centerY);
           
            }
          

            if (left){
            
                this.sub.setAlpha(1)
                this.sub.setPosition(this.centerXiz, this.centerY);
            
            }
            if (!front && !right && !left) this.sub.setAlpha(0);
            this.sub.setTint(0x0000ff);
        }
        
    }

    //Comprobar si el submarino enemigo esta en rango 1 o 2
    onDistance1(attacker, target, direction)
    {
        //Calcula si los submarinos estan en rango de verse - usar isTargetDIr para pintar la vista en especifica 
        let isTarget1 = attacker.isTarget(target.position.x, target.position.y, 1)

        let isTargetDir1 = isTarget1 && attacker.isTargetDir(target.position.x, target.position.y, 1, direction)
        
        console.log("ON_DISTANCE_1", isTargetDir1, direction)

        return isTargetDir1;
    }
    
    onDistance2(attacker, target)
    {
        let isTarget2 = attacker.isTarget(target.position.x, target.position.y, 2)
        
        let isTargetDir2 = isTarget2 && 
            attacker.isTargetDir(target.position.x, target.position.y, 2, direction) 
        console.log("ON_DISTANCE_2", isTarget2)


        return isTargetDir2;
    }


    
    refresh() {
        this.active = !this.active;
        if (this.active) {
            this.setVisible(true);
        }
        else this.setVisible(false);
         
        // this.render()
    }

}