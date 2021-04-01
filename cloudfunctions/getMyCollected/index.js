// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  console.log('这是云函数中的event',event)
  return await db.collection("favorites_list").aggregate().skip(event.skip)
  .match({
    _openid:event.openid
  })
  .lookup({
    from:'goods_list',
    localField:'goodsid',
    foreignField:'_id',
    as:'goodslist'
  })
  .project({
    goodslist:1
  })
  .limit(7)
  .end()
}