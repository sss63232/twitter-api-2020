module.exports = {
  generateRoomName: (id, listenerId) => {
    if (!id || !listenerId) throw new Error('no id or listenerId!')
    const sorts = [id, listenerId]
    sorts.sort((a, b) => {
      return a - b
    })
    const roomName = sorts.join('n')
    return roomName
  },
  checkListenerOnline: (io, socket, clients, listenerId) => {
    const listenerSocketId = []
    for (let [socketId, socket] of io.of('/').sockets) {
      if (socket.data.id === listenerId) {
        listenerSocketId.push(socketId)
      }
    }
    return listenerSocketId.length > 0 ? {
      isOnline: true,
      listenerSocketId
    } : {
      isOnline: false,
      listenerSocketId: []
    }
  },
  checkInRoom: (io, socket, clients, listenerSocketId) => {
    const isInRoom = listenerSocketId.some(id => {
      return clients.has(id)
    })
    return isInRoom
  }
}