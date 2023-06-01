if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config() // 讀取 .env 把値讀送至node的process.env
}
require('newrelic');


const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const passport = require('./config/passport')
const methodOverride = require('method-override')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(methodOverride('_method'))
// app.use('/upload', express.static(__dirname + '/upload'))

app.use(routes)

app.get('/test', (req, res) => {
  res.send({ name: 'testing' })
})
app.get('/', (req, res) => {
  res.send({ name: 'testing' })
})

app.listen(port, () => console.log(`Example APP listening on port ${port}!`))

module.exports = app
