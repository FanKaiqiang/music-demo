{
  let view = {//添加audio标签与播放暂停按钮
    el: '#app',
    render(data, status) {//对页面进行渲染
      let song = data
      $(this.el).css('background-image', `url(${song.cover})`)//替换背景图片
      $(this.el).find('img.cover').attr('src', song.cover)//替换光碟封面
      if ($(this.el).find('audio').attr('src') !== song.url) {//如果歌曲已经存在，就不重新渲染
        $(this.el).find('audio').attr('src', song.url)
      }
      if (status === 'playing') {//根据歌曲播放状态判断光碟是否转动
        $(this.el).find('.disc-container').addClass('playing')
      } else {
        $(this.el).find('.disc-container').removeClass('playing')
      }
    },
    play() {//播放歌曲
      $(this.el).find('audio')[0].play()
    },
    pause() {//暂停歌曲
      $(this.el).find('audio')[0].pause()
    }
  }
  let model = {
    data: {
      song: {//歌曲信息
        id: '',
        name: '',
        singer: '',
        url: ''
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
      this.model = model
      let id = this.getSongId()//获取查询参数中的歌曲id
      this.model.setId(id)//将id存入model中
      this.model.get().then(() => {//根据获取到的id查询歌曲信息，并将得到的信息存入model
        this.view.render(this.model.data.song, this.model.data.status)//接受歌曲信息，进行渲染
      })
      this.bindEvents()
    },
    bindEvents() {//绑定事件
      $(this.view.el).on('click', '.icon-play', () => {//点击播放按钮
        this.model.data.status = 'playing'//状态切换
        this.view.render(this.model.data.song, this.model.data.status)//渲染页面
        this.view.play()//播放歌曲
      })
      $(this.view.el).on('click', '.icon-pause', () => {//点击暂停按钮
        this.model.data.status = 'paused'//状态切换
        this.view.render(this.model.data.song, this.model.data.status)//渲染页面
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
