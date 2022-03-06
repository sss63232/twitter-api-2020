const { Server } = require("socket.io")
const publicChat = require('./modules/public-chat')
const privateChat = require('./modules/private-chat')

module.exports = (server) => {
  const users = new Map()
  const io = new Server(server, {
    cors: {
      origin: 'https://a2623212.github.io/project-simple-twitter-vue-chatroom/',
      method: ['GET', 'POST']
    },
    pingTimeout: 30000
  })

  io.on('connection', (socket) => {
    console.log('user is connecting')

    //to catch all listener
    socket.onAny((event, ...args) => {
      console.log(event, args)
    })

    socket.on('user connected', (user) => {
      socket.data = { ...user }
      const data = {
        userSocketId: socket.id, ...socket.data,
        joinedAt: new Date()
      }
      if (!users.has(socket.data.id)) {
        socket.broadcast.emit('userConnected', {
          name: socket.data.name,
          isOnline: 1
        })
      }

      users.set(socket.data.id, data)
      io.emit('user connected', data)
    })
    privateChat(io, socket)
    publicChat(io, socket, users)
  })


}