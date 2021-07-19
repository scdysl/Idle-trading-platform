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
  getUserProfile:function(){
    if(!app.globalData.openid){
      wx.getUserProfile({
        desc:'用于登录',
        lang: 'zh_CN',
        success:res=>{
          console.log('getUserProfile',res);
          let {
             avatarUrl,city,nickName,gender,province
           } = res.userInfo
          avatarUrl = avatarUrl.split('/')
          avatarUrl[avatarUrl.length - 1] = 0
          avatarUrl = avatarUrl.join('/')
          this.setData({
            avatarUrl,
            city,
            nickName,
            gender,
            province
          })
          console.log('这是app',app)
          if(!app.globalData.openid){
            wx.cloud.callFunction({
                  name: 'login',
                  data:{},
                  success:res=>{
                    console.log('这是返回的login：',res)
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
    }
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  //4月13日后发布的新版本小程序，开发者调用wx.getUserInfo或<button open-type="getUserInfo"/>将不再弹出弹窗，直接返回匿名的用户个人信息,新增getUserProfile接口（基础库2.10.4版本开始支持），可获取用户头像、昵称、性别及地区信息，开发者每次通过该接口获取用户个人信息均需用户确认
  onLoad: function (options) {

    if(!app.globalData.openid){
      wx.showToast({
        title: '单击头像登录',
        icon:'error'
     })
    }else{
      db.collection("user_info").where({
        _openid:app.globalData.openid
      }).get().then(res=>{
        console.log(res)
        let {
          avatarUrl,city,nickName,gender,province
        } = res.data[0]
       this.setData({
         avatarUrl,
         city,
         nickName,
         gender,
         province
       })
      })
    }
  
    
    //查看是否授权
    // wx.getSetting({
    //   success(res){
    //     console.log('getSetting:',res)
    //     console.log('getSetting:',res.authSetting['scope.userInfo'])
    //     if(res.authSetting['scope.userInfo']){
    //       //已经授权，可以直接调用，getUserInfo获取头像昵称
    //       wx.getUserInfo({
    //         lang: 'zh_CN',
    //         success:function(res){
    //           console.log(res.userInfo)
    //           let {
    //             avatarUrl,city,nickName,gender,province
    //           } = res.userInfo
    //           avatarUrl = avatarUrl.split('/')
    //           avatarUrl[avatarUrl.length - 1] = 0
    //           avatarUrl = avatarUrl.join('/')
    //           that.setData({
    //             avatarUrl,
    //             city,
    //             nickName,
    //             gender,
    //             province
    //           })
    //           console.log(app)
    //           if(!app.globalData.openid){
    //             wx.cloud.callFunction({
    //               name: 'login',
    //               data:{},
    //               success:res=>{
    //                 console.log(res)
    //                 wx.setStorageSync('openid',res.result.openid)
    //                 app.globalData.openid = res.result.openid
    //                 db.collection("user_info").where({
    //                   _openid:_.eq(res.result.openid)
    //                 }).count({
    //                   success:res=>{
    //                     console.log('查询成功',res)
    //                     if(res.total === 0){
    //                       db.collection("user_info").add({
    //                         data:{
    //                           avatarUrl,
    //                           city,
    //                           nickName,
    //                           gender,
    //                           province
    //                         },
    //                         success:res=>{
    //                           console.log('添加用户信息成功',res)
    //                         },
    //                         fail:err=>{
    //                           console.log('添加用户信息失败',err)
    //                         }
    //                       })
    //                     } else{
    //                       console.log('用户已存在')
    //                     }
    //                   },
    //                   fail:err=>{
    //                     console.log('查询用户信息失败',err)
    //                   }
    //                 })
    //               },
    //               fail:err=>{
    //                 wx.showToast({
    //                   title: '请检查登录状态',
    //                 })
    //                 console.log('【云函数】[login]获取openid失败，请检查是否部署有云函数，错误信息：',err)
    //               }
    //             })
    //           }
    //         }
    //       })
    //     } else{
    //       wx.showToast({
    //         title: '单击头像登录',
    //       })
    //     }
    //   }
      
    // })
    
  
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
        title: '单击头像登录',
        icon:'error'
     })
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