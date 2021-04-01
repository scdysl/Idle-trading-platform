// pages/list/list.js
var app = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodslist:[],
    skip:0,
    index:4,
    isShow:false,
    show:false,
    searchValue:'',
    selectData: [{
      text: '数码产品',
      value: 0
    },
    {
      text: '学习资料',
      value: 1
    },
    {
      text: '体育用品',
      value: 2
    },
    {
      text: '生活用品',
      value: 3
    },
    {
    text: '全部商品',
      value: 4
    }
  ],
  },

  //跳转到详情页
  goInfo:function(e){
    console.log('详情页',e.currentTarget.dataset.id)
    if(!e.currentTarget.dataset.id){
      wx.showToast({
        title: '商品id不能为空',
        duration:2000
      })
      return
    }
    wx.navigateTo({
      url: '../product_detail/product_detail?id=' + e.currentTarget.dataset.id,
    })
  },
  //跳转到搜索页面
  tosearch:function(){
    wx.navigateTo({
      url: '../search/search',
    })
  },
  //打开和关闭选择分类
  selectTap:function(){
      this.setData({
        show:!this.data.show,
        isShow:!this.data.isShow
      })
  },

  //选择分类
  optionTap:function(e){
    console.log('选择分类为：',e.currentTarget.dataset.index)
    if(e.currentTarget.dataset.index != this.data.index){
      console.log('不是之前的类别')
      this.setData({
        goodslist:[],
        skip:0
      })
    }
    this.setData({
      isShow:false,
      show:false,
      index:e.currentTarget.dataset.index
    })
    console.log('获取新的分类数据')
    this.getGoodsList()
  },
  //点击外面关闭下拉列表
  close:function(){
    if(this.data.show&&this.data.isShow){
      this.setData({
        show:false,
        isShow:false
      })
    }
  },
  //获取列表
  getGoodsList:function(){
    console.log('进入获取列表')
    wx.showToast({
      title: '加载中',
    })
    let where = {}
    if(this.data.index != 4){
      where = {
        index:this.data.index,
        //使用正则查询，实现对搜索的模糊查询
        title:db.RegExp({
          //从搜索栏中获取的value作为规则进行匹配
          regexp:this.data.searchValue,
          options:'i'
        })
      }
    }else{
      where = {
        //使用正则查询，实现对搜索的模糊查询
        title:db.RegExp({
          //从搜索栏中获取的value作为规则进行匹配
          regexp:this.data.searchValue,
          options:'i'
        })
      }
    }
    console.log(where)
    db.collection("goods_list")
    .where(where)
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
      // console.log(this.data.skip)
      // console.log(typeof this.data.goodslist[0].updatetime)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('获取的搜索值：',options)
    console.log('options.searchValue:',typeof options.searchValue)
    console.log(typeof options.index)
    this.setData({
      index:Number(options.index),
      searchValue:options.searchValue
    })
    this.getGoodsList()
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
    this.getGoodsList()

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})