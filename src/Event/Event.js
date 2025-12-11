/**
 * Un "enum" de los eventos del juego
 *
 * Sistema centralizado de eventos para comunicación entre componentes
 * 
 * @enum
 */
const Event = Object.freeze({
    TOGGLE_MAP:Symbol("Toggle Map"),
    SHOOT:Symbol("Shoot"),
    MOVE:Symbol("Move"),
    DISABLE_KEY:Symbol("Disable key"),
    ENABLE_KEY:Symbol("Enable key"),
    UPDATE_ROUND:Symbol("Update round"),
    UPDATE_PLAYER_TEXT:Symbol("Update player text"),
    UPDATE_PLAYER_ACTION_TEXT:Symbol("Update player action text"),
    AIR_ATTACK:Symbol("Air attack"),
    GET_SUBMARINE:Symbol("Submarine"),
    GET_GAMEBOARD:Symbol("Get GameBoard"),
    END_TURN:Symbol("End turn"),
    GET_DRAGON:Symbol("Get dragon"),
    MOVE_DRAGON:Symbol("Move dragon"),
    UPDATE_MAP:Symbol("Update Map"),
    TUTORIAL_NEXT_STEP:Symbol("Tutorial next state"),

    // NUEVOS EVENTOS PARA MINIJUEGOS
    
    /**
     * CHECK_DRAGON_COLLISION
     * 
     * Verifica si un submarino está cerca del dragón
     * 
     * Emisión:
     *   EventDispatch.emit(Event.CHECK_DRAGON_COLLISION, submarine, callback)
     * 
     * Callback debe tener:
     *   callback.collision = boolean
     *   callback.dragonPosition = Position
     */
    CHECK_DRAGON_COLLISION: Symbol("Check Dragon Collision"),
    
    /**
     * ACTIVATE_DRAGON_MINIGAME
     * 
     * Activa el diálogo para jugar al minijuego del dragón
     * 
     * Emisión:
     *   EventDispatch.emit(Event.ACTIVATE_DRAGON_MINIGAME, submarine, dragonPosition)
     */
    ACTIVATE_DRAGON_MINIGAME: Symbol("Activate Dragon Minigame"),
    
    /**
     * START_DRAGON_MINIGAME
     * 
     * Inicia directamente el minijuego del dragón (sin diálogo)
     * 
     * Emisión:
     *   EventDispatch.emit(Event.START_DRAGON_MINIGAME, submarine)
     */
    START_DRAGON_MINIGAME: Symbol("Start Dragon Minigame"),
    
    /**
     * ACTIVATE_REPAIR_MINIGAME
     * 
     * Activa el minijuego de reparación cuando el jugador intenta curarse
     * 
     * Emisión:
     *   EventDispatch.emit(Event.ACTIVATE_REPAIR_MINIGAME, submarine, healAmount)
     */
    ACTIVATE_REPAIR_MINIGAME: Symbol("Activate Repair Minigame"),
    
    /**
     * MINIGAME_COMPLETED
     *
     * Notifica que un minijuego se completó
     * 
     * Emisión:
     *   EventDispatch.emit(Event.MINIGAME_COMPLETED, {
     *     type: 'dragon' | 'repair',
     *     success: boolean,
     *     rewards: Object
     *   })
     */
    MINIGAME_COMPLETED: Symbol("Minigame Completed"),
    
    /**
     * REQUEST_HEAL
     * 
     * Solicita curar el submarino (activa minijuego de reparación)
     * 
     * Emisión:
     *   EventDispatch.emit(Event.REQUEST_HEAL, submarine)
     */
    REQUEST_HEAL: Symbol("Request Heal"),
    
    /**
     * DRAGON_REWARD_RECEIVED
     * 
     * Notifica que se recibieron recompensas del dragón
     * 
     * Emisión:
     *   EventDispatch.emit(Event.DRAGON_REWARD_RECEIVED, submarine, resourceCount)
     */
    DRAGON_REWARD_RECEIVED: Symbol("Dragon Reward Received"),
    
    /**
     * SUBMARINE_HEALED
     * 
     * Notifica que el submarino fue curado
     * 
     * Emisión:
     *   EventDispatch.emit(Event.SUBMARINE_HEALED, submarine, healAmount)
     */
    SUBMARINE_HEALED: Symbol("Submarine Healed"),
})

export default Event;