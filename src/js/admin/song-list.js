{
  let view = {
    el: '#songList-container',
    template: `
      <ul class="songList">
      </ul>
    `,
    render(data) {
      let $el = $(this.el)//先把ul放到页面里去
      $el.html(this.template)
      let { songs, selectSongId } = data//将获取到的song推入data
      let liList = songs.map((song) => {
        let $li = $('<li></li>').text(song.name).attr('data-id', song.id)//每一首歌生成李哥li标签，标签中含有歌曲的id属性
        if (song.id === selectSongId) {//如果生成的标签与model中存储的选中标签id相同
          $li.addClass('active')//添加active
        }
        return $li//返回生成的li标签到liList
      })//遍历songs，创建li标签
      $el.find('ul').empty()//清空原来的ul
      liList.map((domLi) => {//将li标签设为ul的子元素
        $el.find('ul').append(domLi)
      })
    },
    clearActive() {//清除所有高亮
      $(this.el).find('.active').removeClass('active')
    }
  }
  let model = {
    data: {
      songs: [],
      selectSongId: undefined
    },
    find() {//查询
      var query = new AV.Query('Song');//查询数据库中已有的数据
      return query.find().then((songs) => {//将查询到的结果遍历
        this.data.songs = songs.map((song) => {//将结果推入songs中
          return Object.assign({ id: song.id }, song.attributes)
          //return { id: song.id, ...song.attributes }
        })
        return songs
      })
    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.render(this.model.data)
      this.bindEvents()
      this.bindEventHub()
      this.getAllSongs()
    },
    getAllSongs() {
      return this.model.find().then(() => {//每次初始化时都重新从数据库中读取数据并渲染页面
        this.view.render(this.model.data)
      })
    },
    bindEvents() {
      $(this.view.el).on('click', 'li', (e) => {//歌单绑定监听点击li事件
        let songId = e.currentTarget.getAttribute('data-id')//读取点击元素的data-id属性
        this.model.data.selectSongId = songId//将选中标签的id存入model
        this.view.render(this.model.data)//渲染
        let data
        let songs = this.model.data.songs
        for (let i = 0; i < songs.length; i++) {//遍历songs
          if (songs[i].id === songId) {//看哪个song的id是songId
            data = songs[i]
            break
          }
        }//把用户点击的li对应的歌曲信息借助JSON深拷贝，作为data发布
        window.eventHub.emit('select', JSON.parse(JSON.stringify(data)))//发布select事件
      })
    },
    bindEventHub() {
      window.eventHub.on('create', (songData) => {//监听到歌曲创建
        this.model.data.songs.push(songData)//将数据推入model
        this.view.render(this.model.data)//重新渲染
        this.view.clearActive()//其他标签取消高亮
      })
      window.eventHub.on('new', () => {//订阅new事件
        this.view.clearActive()//其他标签取消高亮
      })
      window.eventHub.on('update', (song) => {//监听update事件
        let songs = this.model.data.songs//获得边栏中所有歌曲信息
        for (let i = 0; i < songs.length; i++) {//遍历
          if (songs[i].id === song.id) {//查询到此次更新的歌曲
            Object.assign(songs[i], song)//将边栏中的歌曲信息进行更新
          }
        }
        this.view.render(this.model.data)//渲染
      })
    }
  }
  controller.init(view, model)
}