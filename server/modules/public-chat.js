const messageController = require('../../controllers/message-controller')

module.exports = (io, socket, users) => {
  socket.on('chat message', async msg => {
    const message = await messageController.saveMessage(msg)
    return io.emit('chat message', message)
  })
  
  socket.on('leavePublic', async msg => {
    const matchingSockets = await io.in(`user${socket.data.id}`).allSockets()
    const isDisconnected = matchingSockets.size === 0

    if (isDisconnected) {
      users.delete(socket.data.id)

      socket.broadcast.emit('userDisconnected', {
        name: socket.data.name,
        isOnline: 0
      })

      io.emit('users', [...users.values()])
    }
  })
}