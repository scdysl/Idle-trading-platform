// pages/login/favorites/favorites.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
var skip = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodslist:[]
  },

  // to详情页
  goInfo:function(e){
    console.log('到详情页：',e)
    wx.navigateTo({
      url:'../../product_detail/product_detail?id=' + e.currentTarget.dataset.id
    })
  },
  // 获取数据
  getMyCollected:function(){
    if(app.globalData.openid){
      wx.cloud.callFunction({
        name:'getMyCollected',
        data:{
          skip:skip,
          openid:app.globalData.openid
        }
      })
      .then(res=>{
        console.log('完成getMyCollected',res)
        let new_list = this.data.goodslist.concat(res.result.list)
        skip = skip + res.result.list.length
        this.setData({
          goodslist:new_list
        })
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMyCollected()
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
    this.getMyCollected()

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})