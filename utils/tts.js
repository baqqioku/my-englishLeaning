var KEY = 'ttsMode'
var config = require('./config')
var mode = 'us'
try { mode = wx.getStorageSync(KEY) || 'us' } catch (e) {}

var cache = {}

function src(word) {
  return config.API_BASE + '/tts?word=' + encodeURIComponent(word) +
    '&accent=' + (mode === 'uk' ? 1 : 2)
}

function get(word) {
  var key = mode + '|' + word
  if (!cache[key]) {
    var a = wx.createInnerAudioContext()
    a.src = src(word)
    a.obeyMuteSwitch = false
    cache[key] = a
  }
  return cache[key]
}

function preload(word) {
  if (!word) return
  get(word)
}

function speak(word, rate) {
  var a = get(word)
  try { a.stop() } catch (e) {}
  a.playbackRate = rate || 1
  a.play()
  return a
}

function setMode(value) {
  mode = value
  try { wx.setStorageSync(KEY, value) } catch (e) {}
  cache = {}
}

function getMode() {
  return mode
}

module.exports = {
  preload: preload,
  speak: speak,
  setMode: setMode,
  getMode: getMode
}
