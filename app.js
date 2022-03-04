if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const helpers = require('./_helpers')
const routes = require('./routes')
const passport = require('./config/passport')
const methodOverride = require('method-override')

const app = express()
const port = process.env.PORT || 3000

// chatroom
const http = require('http')
const server = http.createServer(app)
const createServer = require('./server')
createServer(server)

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(methodOverride('_method'))
// app.use('/upload', express.static(__dirname + '/upload'))

app.use(routes)
server.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
