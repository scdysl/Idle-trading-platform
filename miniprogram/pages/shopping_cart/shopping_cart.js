const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    product:[],
    money:0
  },
// 复选框
  choose(res){
    console.log(res)
  },
  getProduct(){
    let that = this
    db.collection("shopping_cart")
    .get({
      success:function(res){
        console.log('获取购物车商品成功',res)
        that.setData({
          product:res.data
        })
      },fail:function(res){
        console.log('获取购物车商品失败',res)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    this.getProduct()
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