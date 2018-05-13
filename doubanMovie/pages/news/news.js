var postsData=require('../../data/posts-data.js')
Page({
  data: {
    imgUrls: [
      {url:'/images/post/wx.png',id: "3"},
      {url:'/images/post/iqiyi.png',id: "5"},
      {url:'/images/post/vr.png',id: "4"}
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000
  },
  onLoad:function(){
    // 生命周期函数--监听页面加载1    
    this.data.postList =postsData.postList;
    this.setData({
      posts_key:postsData.postList
    });
  },
  onPostTap:function(event){
    var postId =event.currentTarget.dataset.postid;
    wx.navigateTo({
      url: '../news/newDetail/detail?id=' + postId
    })
  },

  onSwiperTap: function (event) {
    // target 和currentTarget
    // target指的是当前点击的组件 和currentTarget 指的是事件捕获的组件
    // target这里指的是image，而currentTarget指的是swiper
    var postId = event.target.dataset.postid;
    wx.navigateTo({
      url: "../news/newDetail/detail?id=" + postId
    })
  }
})