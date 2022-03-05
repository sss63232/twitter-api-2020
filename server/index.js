const { Server } = require("socket.io")
const publicChat = require('./modules/public-chat')

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      method: ['GET', 'POST']
    },
    pingTimeout: 30000
  })

  io.on('connection', (socket) => {
    const users = new Map()
    console.log('user is connecting')

    socket.on('user connected', (user) => {
      const data = {
        ...user,
        joinedAt: new Date()
      }
      users.set(socket.data.id, data)
      io.emit('user connected', data)
    })
    publicChat(io, socket, users)
  })


}