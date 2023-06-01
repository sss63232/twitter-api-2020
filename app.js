require('newrelic');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
console.log('TCL=> ~ express:',)
const cors = require('cors')
const helpers = require('./_helpers')
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
  console.log('TCL=> ~ app.get ~ req:', req.headers)
  res.send({ name: 'testing' })
})
app.get('/', (req, res) => {
  console.log('TCL=> ~ app.get ~ req:', req.headers)
  res.send({ name: 'testing' })
})

app.listen(port, () => console.log(`Example APP listening on port ${port}!`))

module.exports = app
