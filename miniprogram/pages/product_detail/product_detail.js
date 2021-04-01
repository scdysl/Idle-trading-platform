// pages/product_detail/product_detail.js
const db = wx.cloud.database();
const _ = db.command;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:[],
    id:"",
    goodslist:[],
    isCollected:false
  },

  // //加入购物车
  // intoShoppingCart:function(){
  //   let that = this;
  //   db.collection("shopping_cart").where({
  //     product_id:that.data.id
  //   })
  //   .get({
  //     success:function(res){
  //       console.log('加入购物车匹配成功',res)
  //       if(res.data == ""){
  //         db.collection("shopping_cart").add({
  //           data:{
  //             product_name:that.data.product_name,
  //             product_src:that.data.product_src[0],
  //             product_price:that.data.product_price,
  //             product_num:1,
  //             product_id:that.data.id
  //           },success:function(res){
  //             console.log('商品加入购物车成功',res)
  //             wx.showToast({
  //               title: '加入成功',
  //             })
  //           },fail:function(res){
  //             console.log('商品加入购物车失败',res)
  //           }
  //         })
  //       }else{
  //         wx.showToast({
  //           title: '已有这个商品',
  //           icon:'none'
  //         })
  //       }
  //     },fail:function(res){
  //       console.log('加入购物车匹配失败',res)
  //     }
  //   })
  // },

  // //立即购买
  // buy:function(){
  //   let that = this;
  //   db.collection("shopping_cart").where({
  //     product_id:that.data.id
  //   })
  //   .get({
  //     success:function(res){
  //       console.log(res)
  //       if(res.data == ""){
  //         db.collection("shopping_cart").add({
  //           data:{
  //             product_name:that.data.product_name,
  //             product_src:that.data.product_src[0],
  //             product_price:that.data.product_price,
  //             product_num:1,
  //             product_id:that.data.id
  //           },success:function(res){
  //             console.log('商品加入购物车成功',res)
  //             wx.switchTab({
  //               url: '../shopping_cart/shopping_cart',
  //             })
  //           },fail:function(res){
  //             console.log('商品加入购物车失败',res)
  //           }
  //         })
  //       }else{
  //         wx.switchTab({
  //           url: '../shopping_cart/shopping_cart',
  //         })
  //       }
  //     },fail:function(res){
  //       console.log(res)
  //     }
  //   })
  // },
  /**
   * 生命周期函数--监听页面加载
   */

   //收藏
   toCollection:function(){
    if(!app.globalData.openid){
      wx.showToast({
        title: '请登录',
      })
      return
    }
    console.log('用户已登录')
    console.log('开始判断isCollected')
    if(this.data.isCollected){
      console.log('进入收藏if')
      wx.showModal({
        title:'是否取消收藏？',
        success:res=>{
          if(res.confirm){
            db.collection("favorites_list").where({
              _openid:app.globalData.openid,
              goodsid:this.data.id
            })
            .remove()
            .then(res=>{
              console.log('取消收藏成功',res)
              this.setData({
                isCollected:false
              })
            })
          }
        },
        fail:err=>{
          console.log('取消收藏失败',err)
        }
      })
    }else{
      console.log('进入收藏else,物品id',this.data.id)
      db.collection("favorites_list").add({
        data:{
          goodsid:this.data.id,
          time:db.serverDate()
        }
      })
      .then(res=>{
        console.log('收藏成功',res)
        this.setData({
          isCollected:!this.data.isCollected
        })
        wx.showToast({
          title: '收藏成功',
        })
      })
    }
       
   },
   //查看联系方式
   checkTel:function(){
     console.log('点击查看联系方式')
     wx.showModal({
       title:this.data.info.nickName+'的联系方式',
       content:this.data.goodslist.tel,
       confirmText:'复制',
       success:res=>{
         if(res.confirm){
           console.log('用户点击复制')
           wx.setClipboardData({
             data: this.data.goodslist.tel,
             success:res=>{
               console.log('复制成功',res)
             }
           })
         }
       }
     })
   },

  //  浏览量增加
  addhits:function(e){
    db.collection("goods_list").doc(e)
    .update({
      data:{
        hits:_.inc(1)
      }
    })
    .then(res=>{
      console.log('浏览量加1')
    })
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    let that = this
    console.log('成功获取产品id',options.id)
    //hits+1
    that.addhits(options.id);
    
    console.log('开始获取产品信息')
    db.collection("goods_list").doc(options.id)
    .get()
    .then(res=>{
      console.log("成功获取到产品信息",res)
      res.data.addtime = res.data.addtime.toString()
      console.log('addtime的数据类型：',typeof res.data.addtime)
      that.setData({
        goodslist:res.data,
        id:options.id
      })
    })
    //获取发布者信息
    db.collection("user_info").where({
      _openid:that.data.goodslist._openid
    })
    .get()
    .then(res => {
      console.log(that.data.goodslist._openid)
      console.log('进入then',res)
      that.setData({
        info:res.data[0]
      })
    })
    //判断是否收藏
    if(app.globalData.openid){
      db.collection("favorites_list").where({
        _openid:app.globalData.openid,
        goodsid:options.id
      })
      .get()
      .then(res=>{
        console.log('判断是否收藏',res)
        console.log('物品id：',that.data.id)
        if(res.data.length!=0){
          that.setData({
            isCollected:true
          })
        }
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
    return {
      title:this.data.goodslist.title,
      path:'/miniprogram/pages/product_detail/product_detail?id=' + this.data.id,//这里是路径
      imageUrl:this.data.goodslist.thumb
    }
  }
})