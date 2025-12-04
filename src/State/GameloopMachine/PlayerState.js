import State from "../State.js";

export class PlayerState extends State{

    /**
     * @type {Number} ID del jugador
     */
    _id

    constructor(stateMachine,ID){
        super(stateMachine)
        this._id = ID
    }

    /**
     *@property 
     */
    get id(){
        return this._id;
    }
}