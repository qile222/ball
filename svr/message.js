class Message {
    constructor(head, error, data) {
        this.head = head
        this.error = error
        this.data = data || {}
    }
}

module.exports = Message