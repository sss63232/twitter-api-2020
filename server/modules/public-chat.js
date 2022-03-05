const messageController = require('../../controllers/message-controller')

module.exports = (io, socket, users) => {
  socket.on('chat message', async msg => {
    const message = await messageController.saveMessage(msg)
    return io.emit('chat message', message)
  })
}