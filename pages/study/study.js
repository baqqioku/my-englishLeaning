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

Page({
  data: {
    word: '',
    phonetic: '',
    pos: '',
    meaning: '',
    level: '',
    lvClass: 'lv3',
    index: 0,
    total: 0,
    pct: 0,
    meaningShown: false,
    finished: false,
    score: 0,
    remCount: 0,
    forgotCount: 0
  },

  onLoad: function (options) {
    var words = []
    if (options.mode === 'review') {
      var filter = options.filter || 'all'
      for (var k in store.state.learned) {
        var item = store.state.learned[k]
        if (filter === 'forgot' && item.remembered) continue
        if (filter === 'remembered' && !item.remembered) continue
        var found = store.find(k)
        if (found) words.push(found)
      }
    } else {
      var level = decodeURIComponent(options.level || '五星')
      var count = Number(options.count || 20)
      var pool = store.vocab.filter(function (w) { return w[4] === level })
      var unlearned = pool.filter(function (w) { return !store.state.learned[w[0]] })
      var learned = pool.filter(function (w) { return store.state.learned[w[0]] })
      shuffle(unlearned)
      shuffle(learned)
      words = unlearned.concat(learned).slice(0, count)
    }

    if (!words.length) {
      wx.showToast({ title: '没有符合条件的单词', icon: 'none' })
      this.setData({ finished: true, total: 0 })
      return
    }

    this.words = words
    this.cursor = 0
    this.remembered = []
    this.forgot = []
    this.setData({ total: words.length })
    this.showCurrent()
  },

  showCurrent: function () {
    var w = this.words[this.cursor]
    this.setData({
      word: w[0],
      phonetic: w[1] || '',
      pos: w[2] || '',
      meaning: w[3] || '',
      level: w[4],
      lvClass: levelClass(w[4]),
      index: this.cursor + 1,
      pct: Math.round(this.cursor / this.words.length * 100),
      meaningShown: false
    })
    tts.preload(w[0])
    var next = this.words[this.cursor + 1]
    if (next) tts.preload(next[0])
    var self = this
    setTimeout(function () { tts.speak(self.data.word, 1) }, 30)
  },

  showMeaning: function () {
    this.setData({ meaningShown: true })
  },

  speak: function () {
    tts.speak(this.data.word, 1)
  },

  mark: function (e) {
    var remembered = e.currentTarget.dataset.remembered === 'true'
    var word = this.words[this.cursor][0]
    store.mark(word, remembered)
    if (remembered) this.remembered.push(word)
    else this.forgot.push(word)

    this.cursor++
    if (this.cursor >= this.words.length) {
      this.finish()
    } else {
      this.showCurrent()
    }
  },

  finish: function () {
    var total = this.words.length
    this.setData({
      finished: true,
      score: Math.round(this.remembered.length / total * 100),
      remCount: this.remembered.length,
      forgotCount: this.forgot.length
    })
  },

  backHome: function () {
    wx.navigateBack({ delta: 1 })
  },

  reviewWrong: function () {
    wx.redirectTo({ url: '/pages/study/study?mode=review&filter=forgot' })
  }
})
