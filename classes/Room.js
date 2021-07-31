class Room {
    constructor(roomName){
        this.name = roomName;
        this.users = [];
        this.queue = [];
        this.playing = false;
        
        return this;
    }
}

module.exports = { Room }