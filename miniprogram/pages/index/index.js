const db = wx.cloud.database();

var isBack=false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    skip:0,
    product:[]
  },

  //跳转到搜索页面
  tosearch:function(res){
    wx.navigateTo({
      url: '../search/search',
    })
  },
  //搜索
  search(e){
    let that = this;
    console.log(e)
    db.collection("product")
    .where({
      //使用正则查询，实现对搜索的模糊查询
      name:db.RegExp({
        //从搜索栏中获取的value作为规则进行匹配
        regexp:e.detail.value,
        options:'i'
      })
    })
    .get({
      success:function(res){
        that.setData({
          search:res.data
        })
        console.log("搜索成功",that.data.search)
        if(that.data.search == ""){
          wx.showToast({
            title: '未找到商品',
            icon:'none'
          })
        }
      },
      fail:function(res){
        console.log('搜索失败',res)
      }
    })
  },

  //获取商品列表
  getGoods:function(){
    db.collection("goods_list").skip(this.data.skip).limit(7)
    .get()
    .then(res=>{
      console.log("产品获取成功",res.data)
      console.log('页面skip：',this.data.skip)
      // this.data.product.concat(res.data)
      var new_list = this.data.product.concat(res.data)
      if(isBack){
          db.collection("goods_list").get()
          .then(res=>{
            for(let i=0;i<new_list.length;i++){
                new_list[i].hits=res.data[i].hits
            }
          })
      }
      this.setData({
        product:new_list,
        skip:this.data.skip+res.data.length
      })
      console.log("getgoods后的skip",this.data.skip)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection("swiper")
    .get()
    .then(res=>{
      console.log("轮播图获取成功",res)
      this.setData({
        banner:res.data
      })
    })
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
    console.log('到达页面显示')
    
    
    this.getGoods()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('页面隐藏')
    isBack = true
    this.setData({
      skip:this.data.skip-7
    })
    this.data.product.splice(this.data.skip,this.data.skip+7)
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
    this.getGoods()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})