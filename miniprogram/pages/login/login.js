// pages/login/login.js
//获取应用实例
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
var inputinfo;
var openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:'../../images/headpic.png',
    gender:2,
    nickName:'未登录',
    userInfo:{},
    hasUserInfo:false,
    canIUse:wx.canIUse('button.open-typewx.getUserInfo')
  },

  //事件处理函数
  bindViewTap:function(){
    console.log("进入主页了");
    wx.switchTab({
      url: '../index/index',
    });
  },
  //获取用户授权信息
  getUserInfo:function(e){
    console.log('用户授权信息',e)
    this.onLoad()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
//0.先检验本地缓存中是否有token，直接请求后端服务器，获取数据库用户信息
//1.用wx.login()获取到一个code
//2.把code传给后端，后端换取openid和session_key
//3.如果openid存在于数据库当中，直接更具openid查询用户的信息，返回信息和token
//4.如果openid不存在数据库当中，把openid存到数据库中，相当于插入了user用户，只不过昵称、头像都是空的
//依然返回用户信息和token
//5.前端获取到用户信息和token，如果用户信息是空的，说明没有授权过，就要显示授权按钮，等待用户授权，
//6.用户同意授权后，可以通过wx.getUserInfo()拿到用户信息，把信息传给后端，请求头携带token
//后端接受到请求之后，根据token获取到对应的user表记录，用户，将信息更新到数据库表


    var that = this
    //查看是否授权
    wx.getSetting({
      success(res){
        if(res.authSetting['scope.userInfo']){
          //已经授权，可以直接调用，getUserInfo获取头像昵称
          wx.getUserInfo({
            lang: 'zh_CN',
            success:function(res){
              console.log(res.userInfo)
              let {
                avatarUrl,city,nickName,gender,province
              } = res.userInfo
              avatarUrl = avatarUrl.split('/')
              avatarUrl[avatarUrl.length - 1] = 0
              avatarUrl = avatarUrl.join('/')
              that.setData({
                avatarUrl,
                city,
                nickName,
                gender,
                province
              })
              console.log(app)
              if(!app.globalData.openid){
                wx.cloud.callFunction({
                  name: 'login',
                  data:{},
                  success:res=>{
                    console.log(res)
                    wx.setStorageSync('openid',res.result.openid)
                    app.globalData.openid = res.result.openid
                    db.collection("user_info").where({
                      _openid:_.eq(res.result.openid)
                    }).count({
                      success:res=>{
                        console.log('查询成功',res)
                        if(res.total === 0){
                          db.collection("user_info").add({
                            data:{
                              avatarUrl,
                              city,
                              nickName,
                              gender,
                              province
                            },
                            success:res=>{
                              console.log('添加用户信息成功',res)
                            },
                            fail:err=>{
                              console.log('添加用户信息失败',err)
                            }
                          })
                        } else{
                          console.log('用户已存在')
                        }
                      },
                      fail:err=>{
                        console.log('查询用户信息失败',err)
                      }
                    })
                  },
                  fail:err=>{
                    wx.showToast({
                      title: '请检查登录状态',
                    })
                    console.log('【云函数】[login]获取openid失败，请检查是否部署有云函数，错误信息：',err)
                  }
                })
              }
            }
          })
        } else{
          wx.showToast({
            title: '单击头像即可登录',
          })
        }
      }
      
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