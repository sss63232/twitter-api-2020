const { Server } = require("socket.io")
const publicChat = require('./modules/public-chat')

module.exports = (server) => {
  const users = new Map()
  const io = new Server(server, {
    cors: {
      origin: '*',
      method: ['GET', 'POST']
    },
    pingTimeout: 30000
  })

  io.on('connection', (socket) => {
    console.log('user is connecting')

    socket.on('user connected', (user) => {
      socket.data = { ...user }
      const data = {
        userSocketId: socket.id, ...socket.data,
        joinedAt: new Date()
      }

      users.set(socket.data.id, data)
      io.emit('user connected', data)
    })
    publicChat(io, socket, users)
  })


}