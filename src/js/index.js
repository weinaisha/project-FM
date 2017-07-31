var playBtn=$('.icon-play1'),
    showAlbum=$('.nav .icon-liebiao'),
    album=$('.album'),
    closeAlbum=$('.album .icon-goback'),
    showLyrict=$('.icon-bofangqi_shouyegeci_'),
    audio=new Audio(),
    album_id='public_tuijian_suibiantingting',
    durationTime,
    timer,
    progressNowNode=$('.progress>.bar>.now'),
    progressBarNode=$('.progress>.bar'),
    timeNowNode=$('.progress>.current-time'),
    timeTotalNode=$('.progress>.duration-time'),
    lyricsArray=[],
    volumeNode=$('.volume'),
    volumeNowNode=document.querySelectorAll('.volume-now')[0]

addEvent()

//promise异步处理,获取所有专辑返回promise实例getAlbum
var getAlbum = function(url) {
  var promise = new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest()
    xhr.open("GET", url)
    xhr.onreadystatechange = handler
    xhr.responseType = "json"
    xhr.send()

    function handler() {
      if (this.readyState !==4) {
        return
      }
      if (this.status === 200) {
        resolve(this.response.channels)
      } else {
        reject(new Error(this.statusText))
      }
    }
  })

  return promise
}
//promise异步处理,获取歌曲返回promise实例getSong
var getSong=function(url){
  var promise=new Promise(function(resolve,reject){
    var xhr=new XMLHttpRequest
    xhr.open("GET", url)
    xhr.responseType = "json"
    xhr.onreadystatechange = handler
    xhr.send()

    function handler() {
      if (this.readyState !==4) {
        return
      }
      if (this.status === 200) {
        resolve(this.response.song)
      } else {
        reject(new Error(this.statusText))
      }
    }
  })
  return promise;
}
//promise异步处理,获取歌词返回promise实例getLyrics,getSong状态是resolve才执行
var getLyrics=function(url){
  var promise=new Promise(function(resolve,reject){
    var xhr=new XMLHttpRequest
    xhr.onreadystatechange=handler
    xhr.responseType='json'
    xhr.open('GET',url)
    xhr.send()

  function handler() {
      if (this.readyState !==4) {
        return
      }
      if (this.status === 200) {
        console.log(this.response)
        resolve(this.response.lyric)
      } else {
        reject(new Error(this.statusText))
      }
    }
  })
  return promise
}
//getSong，resolve回调函数
var addSong=function(data){
  // console.log('song:'+data)
  var title=$('.title-wrap .title'),
      img=$('.img-infor img')
  title.text(data[0].title+'-'+data[0].artist)
  title.attr('song-id',data[0].sid)
  img.attr('src',data[0].picture)
  audio.src=data[0].url
  audio.autoplay=true
  return data[0].sid
}
//解析歌词
function parseLyric(text) {
  var lines = text.split('\n'),
      pattern =/\[\d{2}:\d{2}.\d{2}\]/g,
      result = []
  lines.forEach(function(item){
    if (!(/\[\d{2}:\d{2}.\d{2}\]/g.test(item))) {
      lines = lines.slice(1)
    }
  })
  lines[lines.length - 1].length === 0 && lines.pop();
  lines.forEach(function(v, i, a ) {
    var time = v.match(pattern),
        value = v.replace(pattern, '')
    time.forEach(function(v1, i1, a1) {
      var t = v1.slice(1, -1).split(':')
      result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
    })
  })
  result.sort(function(a, b) {
    return a[0] - b[0]
  })
  return result
}
//getLyrics，resolve回调函数
var renderLyrics=function(lyrics){
  lyricsArray=parseLyric(lyrics)
  var html='',
      marginTop=-15
  lyricsContainer = $('.lyrics');
  for (var i = 0; i < lyricsArray.length; i++) {
    html+=`<p time-id=${lyricsArray[i][0]}>${lyricsArray[i][1]}</p>`
  }
  lyricsContainer.html(html) 
}
//滚动歌词
function scrollLyrics(){
  audio.shouldUpdate = true
  audio.ontimeupdate = function(){
    var p=document.querySelectorAll('.lyrics>p')
    var lyrics=document.querySelectorAll('.lyrics')[0]
    var point=120
    var _this = this
    if(_this.shouldUpdate) {
      for (let i = 0; i < lyricsArray.length; i++) {
        if(audio.currentTime>lyricsArray[i][0]){
          $(p[i]).siblings().removeClass('lyrics-change')
          p[i].classList.add('lyrics-change')
          var distance=p[i].offsetTop-point
          if (distance>0) {
            lyrics.style.top=-distance+'px'
          }
        }
      }
      _this.shouldUpdate = false
      setTimeout(function(){
        _this.shouldUpdate = true
      }, 900)
    }
  }
}
//获取全部专辑
getAlbum("https://jirenguapi.applinzi.com/fm/getChannels.php").then(function(json) {
  renderAlbum(json)
}).catch((error)=>alert('出错了'+ error))
//渲染专辑页
function renderAlbum(data){
  var html=''
  $(data).each(function(index,item){
    html+='<li album-id='+item.channel_id+'>'+item.name+'</li>'
  })
  album.find('ul').append($(html))
}
//切换歌曲
var changeSong=function(btn){
 common()
}
//公共方法promise异步操作,获取音乐后获取歌词并渲染
function common(){
  getSong('https://jirenguapi.applinzi.com/fm/getSong.php?channel='+album_id).then(function(song){
      console.log('song:'+song)
      return addSong(song)
    }).then((song_id)=>{
      // console.log('song_id:'+song_id)
      var url='https://jirenguapi.applinzi.com/fm/getLyric.php?&sid='+song_id
      getLyrics(url).then((lyrics)=>renderLyrics(lyrics))
    })
  playMusic()
}
//初始化
function init(){
  common()
  $('.options .switch').removeClass('icon-play1').addClass('icon-pause')
}
init()
//播放设置
function changeSetting(switchBtn){
  switchBtn.toggleClass('icon-danquxunhuan')
  switchBtn.toggleClass('icon-shunxubofang')
  if(switchBtn.hasClass('icon-shunxubofang')) {
    audio.loop=true
  }else{
    audio.loop=false
  }
}
//播放音乐
function playMusic(){
  audio.play()
  duration=calculatTime(audio.duration)
  timeTotalNode.text(duration)
  timer = setInterval(function(){
    updateProgress()
  }, 1000)
  scrollLyrics()
}
//暂停音乐
function pauseMusic(){
  audio.pause()
  clearInterval(timer)
}
//改变开关样式
function changeSwitch(switchBtn=$('.options .switch')){
  if(switchBtn){
    switchBtn=switchBtn
  }
  switchBtn.toggleClass('icon-play1')
  switchBtn.toggleClass('icon-pause')
  if(switchBtn.hasClass('icon-pause')) {
    playMusic()
  }else{
    pauseMusic()
  }
}
//更新进度条
function updateProgress(){
  var percent = (audio.currentTime/audio.duration)*100+'%'
  progressNowNode.width(percent)
  var time=calculatTime(audio.currentTime)
  timeNowNode.text(time)
}
//换算时间单位
function calculatTime(time){
  var minutes = parseInt(time/60)+''
  var seconds = parseInt(time%60)+''
  seconds = seconds.length == 2? seconds : '0'+seconds
  minutes = minutes.length == 2? minutes : '0'+minutes
  return(minutes + ':' + seconds)
}
//添加事件监听
function addEvent(){
  //显示专辑列表
  showAlbum.on('click',function(){
    album.fadeIn()
  })
  //隐藏专辑列表
  closeAlbum.on('click',function(){
    album.fadeOut()
  })
  //选择要播放的专辑
  album.on('click','li',function(e){
    album_id=e.target.getAttribute('album-id')
    common()
    album.fadeOut()
  })
  //显示歌词
  showLyrict.on('click',function(){
    $('.lyrics').toggleClass('showlyrics')
    $('.visual').toggleClass('hidevisual')
  })
  //播放/暂停
  $('.options').on('click','.switch',function(){
    changeSwitch($(this))
  })
  //上一曲/下一曲
  $('.options').on('click','.changeSong',function(){
    changeSong($(this))
  })
  //音乐结束时触发
  audio.addEventListener('ended', function(){
    console.log('ended')
    common()
  })
  //播放设置
  $('.options').on('click','.setting',function(){
    changeSetting($(this))
  })
  //快进
  progressBarNode.on('click',function(e){
    console.log('快进')
    var percent = e.offsetX/parseInt(getComputedStyle(this).width)
    audio.currentTime = percent * audio.duration
    progressNowNode.style.width = percent*100+"%"
  })
  //显示音量条
  $('.icon-shengyin').on('click',function(){
    volumeNode.toggleClass('show-volume')
  })
  //调节音量
  volumeNode.on('click',function(e){
    var percent = e.offsetX/parseInt(getComputedStyle(this).width)
    audio.volume = percent
    volumeNowNode.style.width= percent*100+'%'
  })
}


  
