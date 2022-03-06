const { Message, Room, Member, Sequelize } = require('../models')
const { Op } = Sequelize

const messageController = {
  saveMessage: (msg) => {
    if (!msg.content.trim()) {
      throw new Error('聊天訊息不可以空白')
    }
    if (!msg.id) {
      throw new Error('請登入才可以發送聊天訊息')
    }

    return Message.create({
      UserId: msg.id,
      RoomId: null,
      content: msg.content,
      createdAt: msg.createdAt,
      isRead: false
    })
    .then(msg => {
      return msg
    })
  },
  createPrivateRoom: (id, listenerId, roomName) => {
    return Room.findOne({
      where: { roomName }
    })
    .then(hasRoom => {
      if (!hasRoom) {
        return Room.create({ roomName })
      }
    })
    .then(newRoom => {
      if (newRoom) {
        const RoomId = newRoom.dataValues.id
        return Member.bulkCreate([
          { RoomId, UserId: id },
          { RoomId, UserId: listenerId }
        ])
      }
    })
    .then(() => { return { message: `room ${roomName} created` }})
  },
  clearUnread: (msg) => {
    let firstId
    let secondId
    if (msg.id > msg.listenerId) {
      firstId = msg.listenerId
      secondId = msg.id
    } else if (msg.id < msg.listenerId) {
      firstId = msg.id
      secondId = msg.listenerId
    }

    return Message.update({ isRead: true }, {
      where: {
        [Op.and]: [
          { UserId: msg.listenerId },
          { RoomId: `${firstId}n${secondId}` }
        ]
      }
    })
  }
}

module.exports = messageController