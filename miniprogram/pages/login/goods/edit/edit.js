// pages/login/goods/edit/edit.js
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
    isShow:true,
    location:{
      address:'还未获取地址',
      logitude:0,
      latitude:0,
    },
    title:'起个标题',
    index:0,
    array:['数码产品','学习资料','体育用品','生活用品'],
    price:0,
    deintro:'',
    tel:0,
    pics:[]
  },

    //上传图片
    upImg:function(){
      let that = this;
      let pics = that.data.pics;
      wx.chooseImage({
        success:function(res){
          console.log(res)
          count:6 - pics.length;
          console.log('这里是上传图片时的res：',res)
          filePath = res.tempFilePaths;
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
          console.log('这是上传图片：',that.data.pics)
        }
      })
    },
    //上传图片到云函数
    upTocloud:function(){
      wx.showToast({
        title: '请稍后...',
      })
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
    console.log('picker发送选择改变，携带值为：',e)
    this.setData({
      index:e.detail.value
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
            address:res.address,
            logitude:res.longitude,
            latitude:res.latitude
          }
        })
        console.log('这是地图选择location',that.data.location)
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
      console.log('这是location.logitude：',this.data.location.longitude)
      console.log('longitude的类型：',typeof this.data.location.longitude)
      console.log('数据完整，开始上传到数据库')
      wx.showToast({
        title: '正在发布',
      })
      //上传到数据库
      var imgList = [];
      urlArr.forEach(item =>{
        imgList.push(item)
      })
      db.collection("goods_list").doc(id).update({
        data:{
          index:this.data.index,
          title:e.detail.value.title,
          price:Number(e.detail.value.price),
          tel:e.detail.value.tel,
          deintro:e.detail.value.deintro,
          address:e.detail.value.address,
          location:db.Geo.Point(this.data.location.longitude,this.data.location.latitude),
          pics:imgList,
          thumb:this.data.pics[0],
          addtime:db.serverDate(),
          updatetime:db.serverDate(),
        },
        success:res => {
          console.log('发布成功', res)
          // id = res._id
          wx.showToast({
            title: '发布成功',
            complete: res => {
              setTimeout(function(){
                wx.redirectTo({
                  url: '../goods',
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
    if(!app.globalData.openid){
      wx.showToast({
        title: '请登录后查看',
      })
      complete:res=>{
        setTimeout(function(){
          wx.switchTab({
            url: '../../login',
          })
        },2000)
      }
    }
    console.log('这是edit的options：',options)
    id = options.id
    db.collection("goods_list").doc(options.id)
    .get()
    .then(res=>{
      console.log('获取的then，',res.data)
      let arr = res.data
      urlArr = arr.pics
      console.log('这是最开始的图片数组urlArr',urlArr)
      console.log('这是location.latitude:',arr.location.latitude)
      console.log('这是location.longitude:',arr.location.longitude)
      this.setData({
        title:arr.title,
        index:arr.index,
        price:arr.price,
        location:{
          address:arr.address,
          latitude:arr.location.latitude,
          longitude:arr.location.longitude
        },
        deintro:arr.deintro,
        pics:arr.pics,
        tel:arr.tel
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