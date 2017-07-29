# project-FM（音乐电台-个人学习作品）
### 音乐来自百度FM, 饥人谷API
## 功能：
1. 已实现：播放/暂停/切换音乐/调节音量/快进/快退/电台分类/滚动歌词
2. 未实现：评论/喜欢
3. 未实现功能思路：
* 存储用户信息
* 当用户点击喜欢时把音乐信息存到“我喜欢的”电台中，通过点击“我喜欢的”这个电台节目，用户可以获取自己点过喜欢的音乐）
* 权限设置：评论读的权限public，写的权限只属于创建它的用户
## 界面
* 封面
<img src="https://github.com/weinaisha/project-FM/blob/master/src/png/1.png"/>
* 歌词
<img src="https://github.com/weinaisha/project-FM/blob/master/src/png/lyrics.png"/>
* 所有电台
<img src="https://github.com/weinaisha/project-FM/blob/master/src/png/alume.png"/>
## 技术
* Promise对象实现的 Ajax 操作
* （ES6）Promise包装了一个音乐加载的异步操作。采用链式的then方法，指定一组按照次序调用的回调函数：通过Ajax获取当前电台音乐，状态为resolve时执行第一个resolve回调函数（渲染音乐信息并返回当前音乐id），待状态为resolve后，执行把第二个resolve回调函数（前一个resolve回调函数的返回值作为参数，通过Ajax获取当前音乐歌词）待状态为resolve后，渲染歌词
* （ES6）使用模板字符串，渲染音乐信息/歌词
* HTML5媒体元素Audio类型：创建Audio对象audioObject，调用audioObject.play()播放音乐，调用audioObject.pause()暂停音乐，‘ended’监听音乐播放结束，当currentTime更新时触发timeupdate事件（以此事件做滚动歌词功能）
* 使用CSS3：animation、transfrom等属性提升用户体验好感度
