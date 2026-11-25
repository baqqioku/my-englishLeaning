var store = require('../../utils/store')
var tts = require('../../utils/tts')

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
}

function levelClass(level) {
  if (level === '五星') return 'lv5'
  if (level === '四星') return 'lv4'
  return 'lv3'
}

var LEVELS = ['all', '五星', '四星', '三星']
var SOURCES = ['all', 'unlearned', 'forgot']

Page({
  data: {
    setup: true,
    levelLabels: ['全部', '五星', '四星', '三星'],
    sourceLabels: ['全部', '未学过', '不认识'],
    levelIndex: 0,
    sourceIndex: 0,
    count: 20,
    card: null,
    index: 0,
    total: 0,
    pct: 0
  },

  selectLevel: function (e) {
    this.setData({ levelIndex: Number(e.currentTarget.dataset.index) })
  },

  selectSource: function (e) {
    this.setData({ sourceIndex: Number(e.currentTarget.dataset.index) })
  },

  onCountChange: function (e) {
    this.setData({ count: Number(e.detail.value) })
  },

  start: function () {
    var pool = store.vocab
    var level = LEVELS[this.data.levelIndex]
    if (level !== 'all') {
      pool = pool.filter(function (w) { return w[4] === level })
    }
    var source = SOURCES[this.data.sourceIndex]
    if (source === 'unlearned') {
      pool = pool.filter(function (w) { return !store.state.learned[w[0]] })
    } else if (source === 'forgot') {
      pool = pool.filter(function (w) {
        return store.state.learned[w[0]] && !store.state.learned[w[0]].remembered
      })
    }
    if (!pool.length) {
      wx.showToast({ title: '没有符合条件的单词', icon: 'none' })
      return
    }
    shuffle(pool)
    this.words = pool.slice(0, this.data.count)
    this.cursor = 0
    this.setData({ setup: false, total: this.words.length })
    this.show()
  },

  show: function () {
    var w = this.words[this.cursor]
    this.setData({
      card: {
        word: w[0],
        phonetic: w[1] || '',
        pos: w[2] || '',
        meaning: w[3] || '',
        level: w[4],
        lvClass: levelClass(w[4])
      },
      index: this.cursor + 1,
      pct: Math.round(this.cursor / this.words.length * 100)
    })
    tts.preload(w[0])
    var next = this.words[this.cursor + 1]
    var prev = this.words[this.cursor - 1]
    if (next) tts.preload(next[0])
    if (prev) tts.preload(prev[0])
    var self = this
    setTimeout(function () { tts.speak(self.data.card.word, 1) }, 20)
  },

  next: function () {
    if (this.cursor < this.words.length - 1) {
      this.cursor++
      this.show()
    }
  },

  prev: function () {
    if (this.cursor > 0) {
      this.cursor--
      this.show()
    }
  },

  speak: function () {
    if (this.data.card) tts.speak(this.data.card.word, 1)
  },

  handleTouchStart: function (e) {
    this.startX = e.touches[0].clientX
    this.startY = e.touches[0].clientY
  },

  handleTouchEnd: function (e) {
    var dx = e.changedTouches[0].clientX - this.startX
    var dy = e.changedTouches[0].clientY - this.startY
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) this.next()
      else this.prev()
    }
  },

  back: function () {
    this.setData({ setup: true })
  }
})
