
// pages/login/goods/goods.js
var app = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodslist:[],
    skip:0
  },

  //跳转到详情页
  goInfo:function(e){
    console.log(e.currentTarget.dataset.id,'to main information')
    if(!e.currentTarget.dataset.id){
      wx.showToast({
        title: '商品id不能为空',
        duration:2000
      })
      return
    }
    wx.navigateTo({
      url: '../goods/edit/edit?id=' + e.currentTarget.dataset.id,
    })
  },

  //删除产品
  delete:function(event){
    wx.showModal({
      title:'提示',
      content:'确定删除吗？',
    }).then(res=>{
      if(res.confirm){
        console.log(event.currentTarget.dataset.id)
        console.log(res)
        db.collection("goods_list").doc(event.currentTarget.dataset.id)
        .remove({
          success:res =>{
            wx.showToast({
              title: '删除成功',
            })
            console.log('删除成功')
            setTimeout(()=>{
              this.getGoodsList()
            },2000)
          },
          fail:err =>{
            wx.showToast({
              title: '删除失败',
            })
            console.log('删除失败',err)
          }
        })
      }
    })
  },
  //获取发布列表
  getGoodsList:function(){
    wx.showToast({
      title: '加载中',
    })
    let openid = app.globalData.openid
    db.collection("goods_list")
    .where({
      _openid:openid
    })
    .skip(this.data.skip)
    .limit(7)
    .get()
    .then(res=>{
      console.log('res:',res)
      let old_data = this.data.goodslist
      let new_data = old_data.concat(res.data)
      new_data.forEach(item => {
        item.updatetime = item.updatetime.toString()
      });
      console.log('newdata',new_data)
      this.setData({
        goodslist:new_data,
        skip:new_data.length
      })
      console.log(this.data.skip)
      console.log(typeof this.data.goodslist[0].updatetime)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showNavigationBarLoading()
    if(!app.globalData.openid){
      wx.showToast({
        title: '请登录后查看',
      })
      return
    }
    this.getGoodsList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideNavigationBarLoading()
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
    console.log('下拉')
    this.getGoodsList()
    wx.stopPullDownRefresh()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})