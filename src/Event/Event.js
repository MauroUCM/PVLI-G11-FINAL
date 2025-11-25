//TODO
// - Todos los eventos aqui
/**
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
    BLUE_SUBMARINE:Symbol("Blue Submarine"),
    RED_SUBMARINE:Symbol("Red Submarine"),
    GET_SUBMARINE:Symbol("Submarine"),
})

export default Event;