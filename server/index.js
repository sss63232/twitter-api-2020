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
  })
}