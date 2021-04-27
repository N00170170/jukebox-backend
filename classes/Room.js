class Room {
    constructor(roomName){
        this.name = roomName;
        this.users = [];
        this.queue = [];

        return this;
    }
}

module.exports = { Room }