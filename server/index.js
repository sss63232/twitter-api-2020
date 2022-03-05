const { Server } = require("socket.io")

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      method: ['GET', 'POST']
    },
    pingTimeout: 30000
  })

  io.on('connection', (socket) => {

    socket.on('user connected', (user) => {
      const data = {
        ...user,
        joinedAt: new Date()
      }
      io.emit('user connected', data)
    })

    socket.on('chat message', (msg) => {
      io.emit('chat message', msg)
    })
  })
}