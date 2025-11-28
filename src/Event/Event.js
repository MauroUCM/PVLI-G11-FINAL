/**
 * Un "enum" de los eventos
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
})

export default Event;