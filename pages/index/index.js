var store = require('../../utils/store')

Page({
  data: {
    totalLearned: 0,
    totalMastered: 0,
    total: 0,
    levels: [],
    selectedLevel: '五星',
    count: 20
  },

  onShow: function () {
    this.refresh()
  },

  refresh: function () {
    var stats = store.stats()
    this.setData({
      totalLearned: stats.learned,
      totalMastered: stats.mastered,
      total: stats.total,
      levels: store.levelStats()
    })
  },

  selectLevel: function (e) {
    this.setData({ selectedLevel: e.currentTarget.dataset.level })
  },

  onCountChange: function (e) {
    this.setData({ count: Number(e.detail.value) })
  },

  startStudy: function () {
    wx.navigateTo({
      url: '/pages/study/study?level=' + encodeURIComponent(this.data.selectedLevel) + '&count=' + this.data.count
    })
  },

  goCards: function () {
    wx.navigateTo({ url: '/pages/cards/cards' })
  },

  goReview: function () {
    wx.navigateTo({ url: '/pages/review/review' })
  },

  goSettings: function () {
    wx.navigateTo({ url: '/pages/settings/settings' })
  }
})
