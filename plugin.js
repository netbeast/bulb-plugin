var express = require('express')
var request = require('superagent')

var router = express.Router()
var bulbParams // aux nasty way to transmit changes

module.exports = function (io) {
  io = io

  io.on('connection', function () {
    console.log('ws:// bulb has connected to plugin')
  })

  io.on('disconnection', function () {
    console.log('ws:// bulb has disconnected from plugin')
  })

  io.on('connect_failure', function (err) {
    console.log('ws:// connection failure')
    console.log(err)
  })

  request.post(process.env.LOCAL_URL + '/resources')
  .send({ app: 'bulb-plugin', topic: 'lights', hook: '/api' })
  .end(function (err, resp) {
    if (err) console.log(err)
  })

  router.post('/', function (req, res) {
    console.log('Plugin translates uniform req.body to bulb params...')
    console.log(req.body)
    io.emit('set', {
      brightness: req.body.bri,
      color: req.body.hue,
    })
    console.log('setting...')
    console.log({
      brightness: req.body.bri,
      color: req.body.hue,
    })
    if (req.body.on) io.emit('on')
    if (req.body.off) io.emit('off')
    if (req.body.power) io.emit(req.body.power)
    res.status(204).end()
  })

  router.get('/', function (req, res) {
    io.emit('get')
    var timerReference = setTimeout(function () {
      if (bulbParams) {
        res.json(bulbParams)
      } else {
        res.status(200).json({ error: 'No bulb available' })
      }
    }, 3000)
  })

  router.get('/on', function (req, res) {
    io.emit('on')
    res.status(204).end()
  })

  router.get('/off', function (req, res) {
    io.emit('off')
    res.status(204).end()
  })

  return router
}
