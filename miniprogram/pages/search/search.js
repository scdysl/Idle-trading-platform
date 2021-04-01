// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyList:[],
    value:''
  },
  // 要实现的功能，1.输入搜索词，点击搜索按钮或者键盘搜索按钮跳转到list页面并传搜索词，
  // 2.搜索一次后历史记录新增一个词并显示，删除按钮可删除历史记录
  // 3.点击一个历史记录会跳转到list页面并将传值
  // 监听搜索词改变
  onChange:function(e){
    console.log(e.detail.value)
    this.setData({
      value:e.detail.value
    })
  },
  // 点击搜索
  toSearch:function(e){
    console.log('搜索',e)
    console.log('e.currentTarget.dataset.value',e.currentTarget.dataset.value)
    if(e.currentTarget.dataset.value){
      this.setData({
        value:e.currentTarget.dataset.value
      })
    }
    console.log('输入的值：',this.data.value)
    let arr = this.data.historyList
    if(!arr.includes(this.data.value)&&this.data.value!=''){
      arr.push(this.data.value)
      this.setData({
        historyList:arr
      })
      wx.setStorageSync('historyList', this.data.historyList)
    }
    console.log('historyList:',this.data.historyList)
    // 跳转
    wx.navigateTo({
      url: '../list/list?index=4&searchValue=' + this.data.value,
    })

  },
  //删除历史搜索记录
  del:function(){
    this.setData({
      historyList:[]
    })
    wx.removeStorageSync('historyList')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 确保新的页面有历史搜索记录
    if(wx.getStorageSync('historyList')){
      this.setData({
        historyList:wx.getStorageSync('historyList')
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})