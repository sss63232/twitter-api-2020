const path = require('path')

const chatController = {
  startChatRoom: (req, res, next) => {
    const chatHtmlPath = path.resolve(__dirname, '..', 'index.html')
    res.sendFile(chatHtmlPath)
  }

}

module.exports = chatController