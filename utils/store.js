var VOCAB = require('../data/vocab.js')
var KEY = 'vocab3153'

var state
try {
  var raw = wx.getStorageSync(KEY)
  state = raw ? JSON.parse(raw) : { learned: {} }
} catch (e) {
  state = { learned: {} }
}
if (!state.learned) state.learned = {}

function save() {
  try { wx.setStorageSync(KEY, JSON.stringify(state)) } catch (e) {}
}

function mark(word, remembered) {
  if (!state.learned[word]) {
    state.learned[word] = { remembered: remembered, count: 1, lastTime: Date.now() }
  } else {
    state.learned[word].remembered = remembered
    state.learned[word].count = (state.learned[word].count || 0) + 1
    state.learned[word].lastTime = Date.now()
  }
  save()
}

function find(word) {
  for (var i = 0; i < VOCAB.length; i++) {
    if (VOCAB[i][0] === word) return VOCAB[i]
  }
  return null
}

function stats() {
  var learned = 0
  var mastered = 0
  for (var w in state.learned) {
    learned++
    if (state.learned[w].remembered && state.learned[w].count >= 2) mastered++
  }
  return { learned: learned, mastered: mastered, total: VOCAB.length }
}

function levelStats() {
  var counts = { '五星': 0, '四星': 0, '三星': 0 }
  var done = { '五星': 0, '四星': 0, '三星': 0 }
  for (var i = 0; i < VOCAB.length; i++) {
    var lv = VOCAB[i][4]
    if (counts[lv] === undefined) continue
    counts[lv]++
    if (state.learned[VOCAB[i][0]]) done[lv]++
  }
  var names = ['五星', '四星', '三星']
  return names.map(function (name) {
    return {
      name: name,
      count: counts[name],
      learned: done[name],
      pct: counts[name] ? Math.round(done[name] / counts[name] * 100) : 0
    }
  })
}

function reset() {
  state.learned = {}
  save()
}

function exportJson() {
  return JSON.stringify({
    version: 1,
    exportTime: new Date().toISOString(),
    learned: state.learned
  }, null, 2)
}

function importJson(text) {
  var data = JSON.parse(text)
  if (!data.learned || typeof data.learned !== 'object') throw new Error('文件格式不正确')
  var added = 0
  var updated = 0
  for (var k in data.learned) {
    if (!state.learned[k]) {
      state.learned[k] = data.learned[k]
      added++
    } else if ((data.learned[k].lastTime || 0) > (state.learned[k].lastTime || 0)) {
      state.learned[k] = data.learned[k]
      updated++
    }
  }
  save()
  return { added: added, updated: updated }
}

module.exports = {
  state: state,
  vocab: VOCAB,
  save: save,
  mark: mark,
  find: find,
  stats: stats,
  levelStats: levelStats,
  reset: reset,
  exportJson: exportJson,
  importJson: importJson
}
