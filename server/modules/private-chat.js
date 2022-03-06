const { generateRoomName } = require('../../libs/utility')
const messageController = require('../../controllers/message-controller')

module.exports = (io, socket) => {
  socket.on('enterRoom', async msg => {
    const { id, listenerId } = msg
    const roomName = generateRoomName(id, listenerId)
    socket.join(roomName)

    await messageController.createPrivateRoom(id, listenerId, roomName)
    await messageController.clearUnread(msg)
  })

  socket.on('leaveRoom', async msg => {
    const { id, listenerId } = msg
    const roomName = generateRoomName(id, listenerId)
    socket.leave(roomName)
  })

  socket.on('privateMessage', async msg => {
    const { id, listenerId } = msg
    const roomName = generateRoomName(id, listenerId)
    const clients = io.sockets.adapter.rooms.get(roomName)
    console.log(clients)
    if (!clients) {
      console.log('No clients in room')
      return
    }
    const { isOnline, listenerSocketId } = checkListenerOnline(io, socket, clients, listenerId)
    msg.isInRoom = checkInRoom(io, socket, clients, listenerSocketId)
    const message = await messageController.saveMessage(msg)
    io.to(roomName).emit('privateMessage', message)
  })
}