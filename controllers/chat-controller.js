const path = require('path')
const { Message, User, sequelize } = require('../models')

const chatController = {
  startChatRoom: (req, res, next) => {
    const chatHtmlPath = path.resolve(__dirname, '..', 'index.html')
    res.sendFile(chatHtmlPath)
  },
  getMessages: (req, res, next) => {
    return Message.findAll({
      order: [['createdAt', 'ASC']],
      include: { model: User, attributes: [] },
      attributes: [
        'UserId',
        [sequelize.col('User.avatar'), 'avatar'],
        [sequelize.col('content'), 'content'],
        [sequelize.col('Message.createdAt'), 'createdAt']
      ],
      raw: true
    }).then(msg => {
      return res.json(msg)
    })
      .catch(err => next(err))
  }
}

module.exports = chatController