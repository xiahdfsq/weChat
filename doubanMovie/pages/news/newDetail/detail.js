var postsData=require('../../../data/posts-data.js')
var app = getApp();
Page({
    data:{
        isPlay: false, 
    },
    onLoad:function(option){
        var globalData = app.globalData;
        var postId = option.id;
        var postData=postsData.postList[Number(postId)];

        this.data.currentPostId=postId;
        this.setData({
         currentPostId:postId
        });
        this.data.postData=postData;
        this.setData({
         postData:postData
        }); 
        //收藏开始
        //初始化代码
        var postsCollected= wx.getStorageSync('posts_collected');
        if(postsCollected && JSON.parse(postsCollected)['key'+postId]){
            var postCollected= JSON.parse(postsCollected)['key'+postId]
            this.setData({
                collected: postCollected
            })
        }else{
            var postsCollected={};
            postsCollected['key'+ postId]=false;
            wx.setStorageSync('posts_collected', JSON.stringify(postsCollected));            
        }   

        if (app.globalData.g_isPlay && app.globalData.g_currentMusicPostId
            === postId) {
            this.setData({
                isPlay: true
            })
        }
        this.setMusicMonitor();
          
    }, 
    setMusicMonitor: function () {
        //点击播放图标和总控开关都会触发这个函数
        var that = this
        wx.onBackgroundAudioPlay(function(){
            var pages = getCurrentPages();
            //console.log(pages)
            var currentPage = pages[pages.length - 1];
            if (currentPage.data.currentPostId === that.data.currentPostId) {
                // 打开多个post-detail页面后，每个页面不会关闭，只会隐藏。通过页面栈拿到到
                // 当前页面的postid，只处理当前页面的音乐播放。
                if (app.globalData.g_currentMusicPostId == that.data.currentPostId) {
                    // 播放当前页面音乐才改变图标
                    that.setData({
                        isPlay: true
                    })
                }
                // if(app.globalData.g_currentMusicPostId == that.data.currentPostId )
                // app.globalData.g_currentMusicPostId = that.data.currentPostId;
            } 
            app.globalData.g_isPlay = true; 
        })  
        wx.onBackgroundAudioPause(function(){
            var pages = getCurrentPages();
            var currentPage = pages[pages.length - 1];
            if (currentPage.data.currentPostId === that.data.currentPostId) {
                if (app.globalData.g_currentMusicPostId == that.data.currentPostId) {
                    that.setData({
                        isPlay: false
                    })
                }
            } 
             
            app.globalData.g_isPlay = false;
        }) 

        wx.onBackgroundAudioStop(function () {
            that.setData({
                isPlay: false
            })
            app.globalData.g_isPlay = false;
            // app.globalData.g_currentMusicPostId = null;
        });
        app.globalData.g_currentMusicPostId = this.data.currentPostId;
    },
    onColletionTap:function(event){
         //拿到这个缓存的值
         var postsCollected= JSON.parse(wx.getStorageSync('posts_collected'));
         //拿到这个值
         var postCollected = postsCollected['key'+ this.data.currentPostId];
         //取反操作 收藏的变成未收藏
         postCollected=!postCollected; 
         postsCollected['key'+ this.data.currentPostId]=postCollected; 
         //更新文章是否的缓存值
         wx.setStorageSync('posts_collected',JSON.stringify(postsCollected));
         //更新数据绑定变量，从而实现切换图片
         this.setData({
             collected:postCollected
         })
         wx.showToast({
             title:postCollected?'收藏成功':'取消成功',
             duration:2000,
             icon:'success'
         })
    },
    onMusicTap:function(){
        var currentPostId = this.data.currentPostId;
        var postData = postsData.postList[currentPostId].music;
        var isPlay = this.data.isPlay; 
        if(isPlay){
            wx.pauseBackgroundAudio()  
            this.setData({
                isPlay: false    
            })  
            app.globalData.g_isPlay = false;
        }else{
            wx.playBackgroundAudio({
                dataUrl: postData.url,
                title: postData.title,
                coverImgUrl: postData.coverImg
            }) 
            this.setData({
                isPlay: true    
            }) 
            app.globalData.g_currentMusicPostId = this.data.currentPostId;
            app.globalData.g_isPlay = true;
        }
    },
    getPostsCollectedSyc: function () {
        var postsCollected = wx.getStorageSync('posts_collected');
        var postCollected = postsCollected[this.data.currentPostId];
        // 收藏变成未收藏，未收藏变成收藏
        postCollected = !postCollected;
        postsCollected[this.data.currentPostId] = postCollected;
        this.showToast(postsCollected, postCollected);
    },
    showModal: function (postsCollected, postCollected) {
        var that = this;
        wx.showModal({
            title: "收藏",
            content: postCollected ? "收藏该文章？" : "取消收藏该文章？",
            showCancel: "true",
            cancelText: "取消",
            cancelColor: "#333",
            confirmText: "确认",
            confirmColor: "#405f80",
            success: function (res) {
                if (res.confirm) {
                    wx.setStorageSync('posts_collected', postsCollected);
                    // 更新数据绑定变量，从而实现切换图片
                    that.setData({
                        collected: postCollected
                    })
                }
            }
        })
    },

    showToast: function (postsCollected, postCollected) {
        // 更新文章是否的缓存值
        wx.setStorageSync('posts_collected', postsCollected);
        // 更新数据绑定变量，从而实现切换图片
        this.setData({
            collected: postCollected
        })
        wx.showToast({
            title: postCollected ? "收藏成功" : "取消成功",
            duration: 1000,
            icon: "success"
        })
    },

    onShareTap: function (event) {
        var itemList = [
            "分享给微信好友",
            "分享到朋友圈",
            "分享到QQ",
            "分享到微博"
        ];
        wx.showActionSheet({
            itemList: itemList,
            itemColor: "#405f80",
            success: function (res) {
                // res.cancel 用户是不是点击了取消按钮
                // res.tapIndex 数组元素的序号，从0开始
                wx.showModal({
                    title: "用户 " + itemList[res.tapIndex],
                    content: "用户是否取消？" + res.cancel + "现在无法实现分享功能，什么时候能支持呢"
                })
            }
        })
    },

    onMusicTap: function (event) {
        var currentPostId = this.data.currentPostId;
        var postData = postsData.postList[currentPostId];
        var isPlayingMusic = this.data.isPlayingMusic;
        if (isPlayingMusic) {
            wx.pauseBackgroundAudio();
            this.setData({
                isPlayingMusic: false
            })
            // app.globalData.g_currentMusicPostId = null;
            app.globalData.g_isPlayingMusic = false;
        }
        else {
            wx.playBackgroundAudio({
                dataUrl: postData.music.url,
                title: postData.music.title,
                coverImgUrl: postData.music.coverImg,
            })
            this.setData({
                isPlayingMusic: true
            })
            app.globalData.g_currentMusicPostId = this.data.currentPostId;
            app.globalData.g_isPlayingMusic = true;
        }
    },

    /*
    * 定义页面分享函数
    */
    onShareAppMessage: function (event) {
        return {
            title: '离思五首·其四',
            desc: '曾经沧海难为水，除却巫山不是云',
            path: '/pages/posts/post-detail/post-detail?id=0'
        }
    } 
})