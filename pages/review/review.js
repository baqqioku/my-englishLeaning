var store = require('../../utils/store')
var tts = require('../../utils/tts')

Page({
  data: {
    filter: 'all',
    items: [],
    remCount: 0,
    forgotCount: 0
  },

  onShow: function () {
    this.refresh()
  },

  refresh: function () {
    var filter = this.data.filter
    var items = []
    var remCount = 0
    var forgotCount = 0

    for (var k in store.state.learned) {
      var info = store.state.learned[k]
      if (info.remembered) remCount++
      else forgotCount++
      if (filter === 'remembered' && !info.remembered) continue
      if (filter === 'forgot' && info.remembered) continue
      var w = store.find(k)
      if (!w) continue
      items.push({
        word: k,
        phonetic: w[1] || '',
        meaning: w[3] || '',
        remembered: info.remembered,
        count: info.count || 0
      })
    }

    this.setData({
      items: items,
      remCount: remCount,
      forgotCount: forgotCount
    })
  },

  setFilter: function (e) {
    var self = this
    this.setData({ filter: e.currentTarget.dataset.filter }, function () {
      self.refresh()
    })
  },

  speak: function (e) {
    tts.speak(e.currentTarget.dataset.word, 1)
  },

  reviewAll: function () {
    wx.navigateTo({ url: '/pages/study/study?mode=review&filter=all' })
  },

  reviewForgot: function () {
    wx.navigateTo({ url: '/pages/study/study?mode=review&filter=forgot' })
  }
})
