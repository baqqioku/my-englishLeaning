var KEY = 'ttsMode'
var mode = 'us'
try { mode = wx.getStorageSync(KEY) || 'us' } catch (e) {}

var cache = {}

function src(word) {
  return 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(word) +
    '&type=' + (mode === 'uk' ? 1 : 2)
}

function get(word) {
  if (!cache[word]) {
    var a = wx.createInnerAudioContext()
    a.src = src(word)
    a.obeyMuteSwitch = false
    cache[word] = a
  }
  return cache[word]
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
