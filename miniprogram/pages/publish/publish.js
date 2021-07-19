// pages/publish/publish.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
var filePath = [];
var urlArr = [];
var id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    location:{
      address:'还未获取地址',
      logitude:0,
      latitude:0,
    },
    isShow:true,
    pics:[],
    index:0,
    array:['数码产品','学习资料','体育用品','生活用品'],
  },

  //上传图片
  upImg:function(){
    let that = this;
    let pics = that.data.pics;
    wx.chooseImage({
      success:function(res){
        console.log('upImg>res:',res)
        count:6 - pics.length;
        filePath = res.tempFilePaths;
        console.log('upImg>filePath:',filePath)
        filePath.forEach((item)=>{
          pics.push(item)
        })
        if(pics.length >= 6){
          that.setData({
            isShow:false
          })
        }
        that.setData({
          pics
        })
        console.log(that.data.pics)
      }
    })
  },
  //上传图片到云存储
  upTocloud:function(){
    wx.showToast({
      title: '请稍后...',
      icon:'loading'
    })
    console.log('upTocloud>filePath:',this.data.pics)
    this.data.pics.forEach((item,idx)=>{
      var fileName = Date.now() + "_" + idx;
      this.cloudFile(fileName,item)
    })
    // console.log('这是在上传图片时的urlArr：',urlArr)
    // console.log('这是在上传图片时的urlArr[0]：',urlArr[0])
    wx.hideToast()
  },
  cloudFile:function(filename,path){
    wx.cloud.uploadFile({
      cloudPath:"img/product_details/"+filename+".jpg",
      filePath:path,
      success:res=>{
        urlArr.push(res.fileID)
        console.log('cloudFile>urlArr:',urlArr)
        // if(filePath.length == urlArr.length){
        //   this.setData({
        //     urlArr
        //   })
        // }
        console.log("这里的id：",id)
        db.collection("goods_list").doc(id).update({
            data:{
              pics:urlArr,
              thumb:urlArr[0]
            }
        })
        
        
      },
      fail: err => {
        // handle error
      }
    })
  },
  // 删除图片
  deleteImg:function(e){
     let that=this;
     let deleteImg=e.currentTarget.dataset.img;
     let pics = that.data.pics;
     let newPics=[];
     for (let i = 0;i<pics.length; i++){
     //判断字符串是否相等
    console.log('pics:'+i,pics[i])
    console.log('deleteImg:',deleteImg)
     if (pics[i] !== deleteImg){
     newPics.push(pics[i])
     }
     }
     that.setData({
     pics: newPics,
     isShow: true
     })
      
     },

    //选择分类
    bindPickerChange:function(e){
      console.log('picker发送选择改变，携带值为',e.detail.value)
      console.log('e为：',e)
      this.setData({
        index:Number(e.detail.value)
      })
    },

    //打开地图选择地址
    chooseLocation:function(){
      let that = this
      wx.chooseLocation({
        success:res=>{
          console.log('地图res：',res)
          console.log('名称：',res.name)
          console.log('详细地址',res.address)
          var address = res.name
          if(res.name.length > 7){
            address = address.slice(0,6)+'...'
          }
          that.setData({
            location:{
              address,
              logitude:res.longitude,
              latitude:res.latitude
            }
          })
        }
      })
    },
    //form表单提交到数据库
    formSubmit:function(e){
      console.log('form发生了submit事件，携带数据为',e)
      console.log('这是这里的this：',this.data)
      //判断用户是否登录
      if(!app.globalData.openid){
        console.log('进入判断用户是否登录')
        wx.showToast({
          title: '请先登录',
          complete:res=>{
            setTimeout(function(){
              wx.switchTab({
                url: '../login/login',
              })
            },2000);
          }
        })
        return
      }
      //判断数据是否完整
      if(e.detail.value.title && e.detail.value.category && e.detail.value.price && e.detail.value.address && e.detail.value.tel && e.detail.value.deintro){
        console.log('开始判断数据是否完整')
        //判断是否上传图片
        if(this.data.pics.length == 0){
          wx.showToast({
            title: '未上传图片',
          })
          return
        }
        console.log('数据完整，开始上传到数据库')
        wx.showToast({
          title: '正在发布',
          icon:'loading'
        })
        //上传到数据库
        var imgList = [];
        urlArr.forEach(item =>{
          imgList.push(item)
        })
        db.collection("goods_list").add({
          data:{
            index:this.data.index,
            title:e.detail.value.title,
            price:Number(e.detail.value.price),
            tel:e.detail.value.tel,
            deintro:e.detail.value.deintro,
            address:e.detail.value.address,
            location:db.Geo.Point(this.data.location.logitude,this.data.location.latitude),
            pics:imgList,
            thumb:this.data.pics[0],
            addtime:db.serverDate(),
            updatetime:db.serverDate(),
            hits:0
          },
          success:res => {
            console.log('发布成功', res._id)
            id = res._id
            wx.showToast({
              title: '发布成功',
              complete: res => {
                setTimeout(function(){
                  wx.redirectTo({
                    url: '../login/goods/goods',
                  })
                },1000)
              }
            })
          },
          fail: err => {
            wx.hideLoading()
            wx.showToast({
              title: '发布失败',
            })
            console.log('发布失败：',err)
          }
        })
      }else {
        wx.showToast({
          title: '请填写完整信息',
        })
      }
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
    if(!app.globalData.openid){
      wx.showToast({
        title: '请登录',
        icon:'error',
        mask:true
      })
      setTimeout(function(){
        wx.hideToast();
        wx.switchTab({
          url: '../login/login',
        })
      },1000)

    }
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