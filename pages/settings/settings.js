var store = require('../../utils/store')
var tts = require('../../utils/tts')

Page({
  data: {
    count: 0,
    modeLabels: ['美音（真人）', '英音（真人）'],
    modeIndex: 0
  },

  onShow: function () {
    this.setData({
      count: Object.keys(store.state.learned).length,
      modeIndex: tts.getMode() === 'uk' ? 1 : 0
    })
  },

  setMode: function (e) {
    var index = Number(e.currentTarget.dataset.index)
    tts.setMode(index === 1 ? 'uk' : 'us')
    this.setData({ modeIndex: index })
    tts.speak('hello', 1)
  },

  exportProgress: function () {
    var text = store.exportJson()
    wx.setClipboardData({
      data: text,
      success: function () {
        wx.showToast({ title: '进度已复制，可粘贴保存' })
      }
    })
  },

  importProgress: function () {
    var self = this
    wx.getClipboardData({
      success: function (res) {
        try {
          var result = store.importJson(res.data)
          self.setData({ count: Object.keys(store.state.learned).length })
          wx.showToast({ title: '新增' + result.added + ' 更新' + result.updated })
        } catch (e) {
          wx.showToast({ title: '剪贴板中不是有效备份', icon: 'none' })
        }
      }
    })
  },

  clear: function () {
    var self = this
    wx.showModal({
      title: '清除进度',
      content: '确定清除全部学习记录？此操作不可恢复，建议先导出备份。',
      success: function (res) {
        if (!res.confirm) return
        store.reset()
        self.setData({ count: 0 })
        wx.showToast({ title: '已清除' })
      }
    })
  }
})
