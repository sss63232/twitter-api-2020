const { Message } = require('../models')

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
  }
}

module.exports = messageController