const { Server } = require("socket.io")
const { Message } = require('../models')

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
      const data = {
        ...msg
      }
      if (!msg.content.trim()) {
        throw new Error('聊天訊息不可以空白')
      }
      if (!msg.id) {
        throw new Error('請登入才可以發送聊天訊息')
      }

      return Message.create({
        UserId: msg.id,
        content: msg.content,
        createdAt: msg.createdAt
      }).then(msg => {
        return io.emit('chat message', data)
      })
    })
  })
}