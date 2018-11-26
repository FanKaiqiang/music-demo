{
  let view = {//添加audio标签与播放暂停按钮
    el: '#app',
    init() {
      this.$el = $(this.el)
    },
    render(data) {//对页面进行渲染
      let { song, status } = data//从data中提取信息
      this.$el.css('background-image', `url(${song.cover})`)//替换背景图片
      this.$el.find('img.cover').attr('src', song.cover)//替换光碟封面
      if (this.$el.find('audio').attr('src') !== song.url) {//如果歌曲已经存在，就不重新渲染
        let audio = this.$el.find('audio').attr('src', song.url).get(0)//将audio标签的src属性进行替换并把audio标签取出
        audio.onended = () => {//监听取出的audio标签的ended事件
          window.eventHub.emit('songEnd')//发布“songEnd”事件
        }
        audio.ontimeupdate = () => {//监听音乐播放时间变化
          this.showLyric(audio.currentTime)//将当前音乐播放时间传入showLyric方法
        }
      }
      if (status === 'playing') {//根据歌曲播放状态判断光碟是否转动
        this.$el.find('.disc-container').addClass('playing')
      } else {
        this.$el.find('.disc-container').removeClass('playing')
      }
      this.$el.find('.song-description>h1').text(song.name)//将歌曲名渲染到页面中
      let { lyrics } = song//获取歌词
      let array = lyrics.split('\n').map((string) => {//将歌词内容用回车分开，进行遍历
        let p = document.createElement('p')//创建p标签
        let regex = /\[([\d:.]+)\](.+)/
        let matches = string.match(regex)//使用正则分析字符串
        if (matches) {
          p.textContent = matches[2]//歌词填入p标签
          time = matches[1]//取得歌词中的时间
          let parts = time.split(':')//将时间用":"分开
          let minutes = parts[0]//分钟
          let seconds = parts[1]//秒数
          let newTime = parseFloat(minutes, 10) * 60 + parseFloat(seconds, 10)//计算得秒数时间
          p.setAttribute('data-time', newTime)//计算得的时间作为标签属性
        } else {
          p.textContent = string
        }
        return p
      })
      this.$el.find('.lyric>.lines').append(array)//将array中的p标签放入页面中
    },
    play() {//播放歌曲
      this.$el.find('audio')[0].play()
    },
    pause() {//暂停歌曲
      this.$el.find('audio')[0].pause()
    },
    showLyric(time) {//展示歌词
      let allP = this.$el.find('.lyric>.lines>p')//获取所有p标签
      let p//需要展示的标签
      for (let i = 0; i < allP.length; i++) {//遍历所有p标签
        if (i === allP.length - 1) {//如果遍历到最后一个标签
          p = allP[i]//需要展示的标签为当前标签
          break
        } else {//如果不是遍历到最后一个标签
          let previousTime = allP.eq(i).attr('data-time')//前一个标签的时间属性
          let nextTime = allP.eq(i + 1).attr('data-time')//后一个标签的时间属性
          if (previousTime <= time && time < nextTime) {//如果当前时间居于两者时间之中
            p = allP[i]//展示前一个标签
            break
          }
        }
      }
      let pHeight = p.getBoundingClientRect().top//展示的标签距页面顶部距离
      let linesHeight = this.$el.find('.lyric>.lines')[0].getBoundingClientRect().top//歌词框距页面顶部距离
      let height = pHeight - linesHeight//相对距离
      this.$el.find('.lyric>.lines').css('transform', `translateY(${-(height-25)}px)`)//歌词内容移动相对距离，修正25px
      $(p).addClass('active').siblings('.active').removeClass('active')//当前播放的歌词高亮
    }
  }
  let model = {
    data: {
      song: {//歌曲信息
        id: '',
        name: '',
        singer: '',
        url: '',
        lyrics: ''
      },
      status: 'paused'//歌曲状态
    },
    setId(id) {
      this.data.song.id = id
    },
    get() {//从数据库中根据传来的id进行查询
      var query = new AV.Query('Song')
      return query.get(this.data.song.id).then((song) => {//将获取到的数据song存入model中
        Object.assign(this.data.song, song.attributes)
        return song//返回获取到的数据
      })
    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      let id = this.getSongId()//获取查询参数中的歌曲id
      this.model.setId(id)//将id存入model中
      this.model.get().then(() => {//根据获取到的id查询歌曲信息，并将得到的信息存入model
        this.view.render(this.model.data)//接受歌曲信息，进行渲染
      })
      this.bindEvents()
    },
    bindEvents() {//绑定事件
      $(this.view.el).on('click', '.icon-play', () => {//点击播放按钮
        this.model.data.status = 'playing'//状态切换
        this.view.render(this.model.data)//渲染页面
        this.view.play()//播放歌曲
      })
      $(this.view.el).on('click', '.icon-pause', () => {//点击暂停按钮
        this.model.data.status = 'paused'//状态切换
        this.view.render(this.model.data)//渲染页面
        this.view.pause()//暂停歌曲
      })
      window.eventHub.on('songEnd', () => {//监听songEnd事件（歌曲播放结束）
        this.model.data.status = 'paused'//状态切换为暂停（光盘停止旋转）
        this.view.render(this.model.data)//渲染页面
        this.view.pause()//暂停歌曲
      })
    },
    getSongId() {
      let search = window.location.search//获取查询参数
      if (search.indexOf('?') === 0) {//去除查询参数中的问号
        search = search.substring(1)
      }
      let array = search.split('&').filter(v => v)//以&分隔查询参数并存入数组
      let id = ''//准备好存放id的变量

      for (let i = 0; i < array.length; i++) {//遍历所有获得的查询参数
        let kv = array[i].split('=')//将形如“id=xxx”的字符串以等号分隔
        let key = kv[0]//key为“id”
        let value = kv[1]//value为"xxx"
        if (key === 'id') {//如果是我们需要的参数
          id = value//存入id
          break
        }
      }

      return id//返回id，此时id即为从查询参数中取出的值
    }
  }
  controller.init(view, model)
}
